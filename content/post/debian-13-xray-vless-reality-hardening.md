---
title: "Debian 13 VPS 安全加固与 Xray VLESS + REALITY 手动部署"
slug: "debian-13-xray-vless-reality-hardening"
tags: [Debian, VPS, SSH, Xray, VLESS, REALITY, Nginx, Fail2Ban]
categories: [技术, VPS]
keywords:
- Debian 13 安全加固
- VPS 安全
- SSH 密钥登录
- Xray VLESS REALITY
- Nginx
- Fail2Ban
- Cloudflare DNS
- acme.sh
description: "从 SSH 密钥登录、UFW 与 Fail2Ban 开始，加固一台新的 Debian 13 VPS，再手动部署 Xray VLESS + REALITY、Nginx 回落站点与客户端配置。"
summary: "从 SSH 密钥登录、UFW 与 Fail2Ban 开始，加固一台新的 Debian 13 VPS，再手动部署 Xray VLESS + REALITY、Nginx 回落站点与客户端配置。"
cover:
  image: "/covers/debian-13-xray-vless-reality-hardening.svg"
  alt: "Debian 13 VPS 安全加固与 Xray VLESS + REALITY 手动部署封面"
  relative: false
date: 2026-07-18T14:00:00+08:00
lastmod: 2026-07-18T15:05:00+08:00
draft: false
---

这篇文章记录一套我更愿意在新 VPS 上采用的部署顺序：先把 SSH 登录、系统更新和防火墙收紧，再部署 Nginx、证书和 Xray，最后从服务器内外分别验证。

全文基于 Debian 13（trixie），目标是搭建下面这套结构：

```text
公网 80/tcp   -> Nginx（HTTP 页面）
公网 443/tcp  -> Xray（VLESS + REALITY + Vision）
                       |
                       +-> 127.0.0.1:8443
                              Nginx HTTPS 回落站点

公网 42345/tcp -> OpenSSH（示例端口）
```

它不是一键脚本。每一步都保留了检查命令，方便在真正修改服务之前确认状态，也方便出问题时定位和回滚。

> 请只在你拥有或获准管理的服务器上使用本文配置，并遵守所在地法律及服务商条款。

<!-- more -->

## 开始前先统一变量

文中使用以下占位值，请先替换成自己的信息：

```text
服务器公网 IPv4：YOUR_SERVER_IP
普通登录用户：youruser
SSH 新端口：42345
主域名：domain.com
REALITY 子域名：x.domain.com
ACME 邮箱：user@example.com
```

本文让 Xray 只监听 IPv4，因此 `x.domain.com` 应配置一条指向 VPS 公网 IPv4 的 `A` 记录，并在 Cloudflare 中设为 **DNS only（灰云）**。

如果你还没有为 Xray 配置 IPv6 监听，不要给这个子域名添加 `AAAA` 记录。否则支持 IPv6 的客户端可能优先连到一个没有服务监听的地址。

云厂商的安全组、网络 ACL 与 VPS 内的 UFW 是两层限制。后文涉及的端口需要在两边都放行：

- `42345/tcp`：SSH 示例端口；
- `80/tcp`：Nginx HTTP；
- `443/tcp`：Xray REALITY；
- `8443/tcp`：只监听回环地址，**不要对公网放行**。

## 第一部分：Debian 13 与 SSH 安全加固

### 1. 保留旧会话，先创建普通管理员用户

整个 SSH 加固过程中都不要关闭当前窗口。改完后用第二个终端测试新端口；只有密钥登录与 `sudo` 都正常，才退出旧会话。

如果 VPS 初始只允许 `root` 登录，先创建普通用户：

```bash
adduser youruser
usermod -aG sudo youruser
su - youruser
sudo whoami
```

最后一条命令应输出：

```text
root
```

### 2. 在本地生成并上传 SSH 密钥

下面的命令在**本地电脑**执行：

```bash
ssh-keygen -t ed25519 -a 100 \
  -f ~/.ssh/debian13_ed25519 \
  -C "debian13-server"
```

建议为私钥设置强口令。生成的私钥绝不能上传或分享：

```text
~/.ssh/debian13_ed25519      # 私钥
~/.ssh/debian13_ed25519.pub  # 公钥
```

将公钥复制到服务器：

```bash
ssh-copy-id -i ~/.ssh/debian13_ed25519.pub \
  -p 22 youruser@YOUR_SERVER_IP
```

如果本地没有 `ssh-copy-id`：

```bash
ssh -p 22 youruser@YOUR_SERVER_IP \
  'umask 077; mkdir -p ~/.ssh; cat >> ~/.ssh/authorized_keys' \
  < ~/.ssh/debian13_ed25519.pub
```

在另一个本地终端中确认密钥可以登录：

```bash
ssh -i ~/.ssh/debian13_ed25519 \
  -p 22 youruser@YOUR_SERVER_IP
```

此时先不要禁用密码登录。

### 3. 更新系统并安装基础组件

回到服务器执行：

```bash
sudo apt update
sudo apt full-upgrade -y
sudo apt install -y \
  openssh-server ufw fail2ban python3-systemd \
  curl wget ca-certificates openssl jq unzip tar \
  nginx socat cron dnsutils
```

如果系统升级了内核，先确认没有未完成的配置，再在合适的维护窗口重启：

```bash
sudo dpkg --audit
test -f /var/run/reboot-required && cat /var/run/reboot-required
```

### 4. 备份 SSH 配置

```bash
sudo mkdir -p /root/ssh-hardening-backup
sudo cp -a /etc/ssh/sshd_config \
  /root/ssh-hardening-backup/sshd_config.bak.$(date +%F-%H%M%S)
sudo cp -a /etc/ssh/sshd_config.d \
  /root/ssh-hardening-backup/sshd_config.d.bak.$(date +%F-%H%M%S)
sudo ls -lah /root/ssh-hardening-backup
```

### 5. 先放行新端口，再启用 UFW

先到云厂商控制台放行 `42345/tcp`，然后在服务器执行：

```bash
NEW_SSH_PORT=42345

sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'TEMP old SSH port'
sudo ufw allow ${NEW_SSH_PORT}/tcp comment 'SSH high port'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'Xray REALITY'
sudo ufw enable
sudo ufw status verbose
```

如果你有固定公网 IP，可以把 SSH 规则进一步收紧：

```bash
sudo ufw delete allow ${NEW_SSH_PORT}/tcp
sudo ufw allow from YOUR_PUBLIC_IP \
  to any port ${NEW_SSH_PORT} proto tcp \
  comment 'SSH from my IP'
```

家庭宽带公网 IP 经常变化时不要这样做，否则可能把自己挡在服务器外。

### 6. 使用 drop-in 加固 sshd

Debian 会在主配置开头加载 `/etc/ssh/sshd_config.d/*.conf`。OpenSSH 对大多数选项采用“首次取值生效”，而通配文件又按字典序加载，因此这里使用 `00-hardening.conf`。

```bash
NEW_SSH_PORT=42345

sudo tee /etc/ssh/sshd_config.d/00-hardening.conf >/dev/null <<EOF
Port ${NEW_SSH_PORT}
PubkeyAuthentication yes
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
PermitEmptyPasswords no
MaxAuthTries 3
X11Forwarding no
EOF
```

如果普通用户还不能稳定登录并使用 `sudo`，先不要禁用 root。可以临时改为：

```text
PermitRootLogin prohibit-password
```

### 7. 先验证，再重新加载

检查语法：

```bash
sudo sshd -t
```

没有输出通常表示语法正确。再查看最终生效值：

```bash
sudo sshd -T | grep -E \
  '^(port|pubkeyauthentication|passwordauthentication|kbdinteractiveauthentication|permitrootlogin|permitemptypasswords|maxauthtries|x11forwarding) '
```

预期结果包括：

```text
port 42345
pubkeyauthentication yes
passwordauthentication no
kbdinteractiveauthentication no
permitrootlogin no
permitemptypasswords no
maxauthtries 3
x11forwarding no
```

如果值不一致，先检查全部配置来源：

```bash
sudo grep -RniE \
  '^(Port|PubkeyAuthentication|PasswordAuthentication|KbdInteractiveAuthentication|PermitRootLogin|AllowUsers|Match)' \
  /etc/ssh/sshd_config /etc/ssh/sshd_config.d/
```

确认无误后重新加载：

```bash
sudo systemctl reload ssh
sudo systemctl status ssh --no-pager
```

如果失败，可在仍然存活的旧会话中回滚：

```bash
sudo mv /etc/ssh/sshd_config.d/00-hardening.conf \
  /root/ssh-hardening-backup/00-hardening.conf.disabled
sudo systemctl reload ssh
sudo journalctl -u ssh -n 80 --no-pager
```

### 8. 用第二个终端验证新登录方式

在本地新开一个终端：

```bash
ssh -i ~/.ssh/debian13_ed25519 \
  -p 42345 youruser@YOUR_SERVER_IP
```

登录后检查：

```bash
sudo whoami
sudo ss -tlnp | grep sshd
```

再从本地确认密码认证已关闭：

```bash
ssh -o PubkeyAuthentication=no \
  -o PreferredAuthentications=password \
  -p 42345 youruser@YOUR_SERVER_IP
```

预期结果是 `Permission denied (publickey)`。

只有新端口登录、密钥认证和 `sudo` 三项都确认正常后，才删除 22 端口规则：

```bash
sudo ufw delete allow 22/tcp
sudo ufw status verbose
```

同时删除云厂商安全组中的 `22/tcp` 入站规则。

### 9. 配置 Fail2Ban

不要直接修改 Fail2Ban 自带的 `.conf` 文件，把本地覆盖写入 `.local`：

```bash
NEW_SSH_PORT=42345

sudo tee /etc/fail2ban/jail.d/sshd.local >/dev/null <<EOF
[sshd]
enabled = true
port = ${NEW_SSH_PORT}
filter = sshd
backend = systemd
banaction = ufw
maxretry = 5
findtime = 10m
bantime = 1h
EOF
```

如果你有固定公网 IP，可以在 `[sshd]` 下增加白名单：

```ini
ignoreip = 127.0.0.1/8 ::1 YOUR_PUBLIC_IP/32
```

检查并启动：

```bash
sudo fail2ban-server -t
sudo systemctl enable --now fail2ban
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

### 10. 配置本地 SSH 别名

在本地编辑 `~/.ssh/config`：

```sshconfig
Host debian13-server
    HostName YOUR_SERVER_IP
    User youruser
    Port 42345
    IdentityFile ~/.ssh/debian13_ed25519
    IdentitiesOnly yes
```

以后直接执行：

```bash
ssh debian13-server
```

修改端口主要是减少扫描日志里的噪音，真正的安全边界仍然是密钥认证、禁用 root 远程登录、及时更新、最小化暴露端口和持续监控。

## 第二部分：准备 Nginx 与证书

### 1. 核对 DNS、端口和服务

```bash
DOMAIN=domain.com
SITE_DOMAIN=x.domain.com

dig +short A "$SITE_DOMAIN"
dig +short AAAA "$SITE_DOMAIN"
curl -4 ifconfig.me; echo
sudo ss -tulpen | grep -E ':(80|443|8443|42345)\s' || true
sudo ufw status numbered
```

检查点：

- `A` 记录应指向当前服务器公网 IPv4；
- 本文的 IPv4-only 方案不应存在 `AAAA` 记录；
- `80` 可以由 Nginx 监听；
- `443` 与 `8443` 此时应未被占用；
- Cloudflare 中 `x.domain.com` 必须为灰云。

启动 Nginx 与 cron：

```bash
sudo systemctl enable --now nginx cron
sudo systemctl status nginx cron --no-pager
```

### 2. 创建最小权限的 Cloudflare API Token

在 Cloudflare 控制台创建 API Token，权限限定为：

```text
Zone - DNS - Edit
Zone - Zone - Read
Zone Resources - Include - Specific zone - domain.com
```

不要使用权限过大的 Global API Key。

进入 root shell，并设置非敏感变量：

```bash
sudo -i
DOMAIN=domain.com
SITE_DOMAIN=x.domain.com
EMAIL=user@example.com
```

安装 acme.sh：

```bash
curl https://get.acme.sh | sh -s email="$EMAIL"
ACME=/root/.acme.sh/acme.sh
$ACME --version
$ACME --set-default-ca --server letsencrypt
```

Token 不要直接写在命令行中，否则容易进入 shell history。使用隐藏输入：

```bash
read -rsp 'Cloudflare API Token: ' CF_Token
echo
export CF_Token
```

### 3. 签发并安装通配符证书

```bash
$ACME --register-account -m "$EMAIL"
$ACME --issue \
  --dns dns_cf \
  -d "$DOMAIN" \
  -d "*.$DOMAIN" \
  -k ec-256
```

为 Nginx 创建稳定的证书路径：

```bash
CERT_DIR=/etc/nginx/ssl/$DOMAIN
mkdir -p "$CERT_DIR"
chmod 700 "$CERT_DIR"

$ACME --install-cert \
  -d "$DOMAIN" \
  --ecc \
  --key-file "$CERT_DIR/privkey.pem" \
  --fullchain-file "$CERT_DIR/fullchain.pem" \
  --reloadcmd "systemctl reload nginx"

chmod 600 "$CERT_DIR/privkey.pem"
chmod 644 "$CERT_DIR/fullchain.pem"
```

验证证书的 SAN：

```bash
openssl x509 \
  -in "$CERT_DIR/fullchain.pem" \
  -noout -subject -issuer -dates -ext subjectAltName
```

结果必须包含：

```text
DNS:domain.com
DNS:*.domain.com
```

acme.sh 会把续期所需的 Cloudflare 凭据保存到自己的账户配置。收紧权限并移除当前 shell 变量：

```bash
chmod 600 /root/.acme.sh/account.conf
chmod 700 /root/.acme.sh
unset CF_Token
```

检查自动续期任务：

```bash
crontab -l
$ACME --cron --home /root/.acme.sh
```

### 4. 配置本机 HTTPS 回落站点

创建站点目录：

```bash
WEB_ROOT=/var/www/$SITE_DOMAIN
CERT_DIR=/etc/nginx/ssl/$DOMAIN

mkdir -p "$WEB_ROOT"
chown -R www-data:www-data "$WEB_ROOT"
chmod 755 "$WEB_ROOT"
```

写入一个普通静态首页：

```bash
tee "$WEB_ROOT/index.html" >/dev/null <<EOF
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>$SITE_DOMAIN</title>
  <style>
    body { max-width: 720px; margin: 80px auto; padding: 0 24px;
           font-family: system-ui, sans-serif; line-height: 1.6; color: #222; }
  </style>
</head>
<body>
  <h1>$SITE_DOMAIN</h1>
  <p>This site is running normally.</p>
</body>
</html>
EOF
```

备份并创建 Nginx 站点配置：

```bash
mkdir -p /root/nginx-backup
cp -a /etc/nginx/sites-available \
  /root/nginx-backup/sites-available.$(date +%F-%H%M%S)
cp -a /etc/nginx/sites-enabled \
  /root/nginx-backup/sites-enabled.$(date +%F-%H%M%S)

tee /etc/nginx/sites-available/$SITE_DOMAIN.conf >/dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $SITE_DOMAIN;

    root $WEB_ROOT;
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }
}

server {
    listen 127.0.0.1:8443 ssl;
    http2 on;
    server_name $SITE_DOMAIN;

    root $WEB_ROOT;
    index index.html;

    ssl_certificate     $CERT_DIR/fullchain.pem;
    ssl_certificate_key $CERT_DIR/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;

    access_log /var/log/nginx/$SITE_DOMAIN.8443.access.log;
    error_log  /var/log/nginx/$SITE_DOMAIN.8443.error.log;

    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF

ln -sfn /etc/nginx/sites-available/$SITE_DOMAIN.conf \
  /etc/nginx/sites-enabled/$SITE_DOMAIN.conf
```

检查、加载并验证：

```bash
nginx -t
systemctl reload nginx
ss -tulpen | grep -E ':(80|443|8443)\s' || true

curl -I "http://$SITE_DOMAIN/"
curl -I --resolve "$SITE_DOMAIN:8443:127.0.0.1" \
  "https://$SITE_DOMAIN:8443/"
```

此时应看到公网 `80` 由 Nginx 监听、`127.0.0.1:8443` 由 Nginx 监听，公网 `443` 仍为空闲。`8443` 不应出现在 `0.0.0.0` 或公网网卡上。

## 第三部分：部署 Xray VLESS + REALITY

### 1. 安装 Xray-core

以下步骤继续在 root shell 中执行。官方安装脚本默认让 Xray 以 `nobody` 用户运行：

```bash
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install

command -v xray
xray version
systemctl cat xray --no-pager | head -n 80
systemctl stop xray
systemctl enable xray
```

安装后的主要路径通常是：

```text
/usr/local/bin/xray
/usr/local/etc/xray/config.json
/etc/systemd/system/xray.service
/var/log/xray/
```

### 2. 生成并保存连接参数

```bash
XRAY_UUID=$(xray uuid)
xray x25519
```

当前版本通常输出 `PrivateKey`、`Password` 和 `Hash32`。这里的 `Password` 实际由服务端私钥派生，供 REALITY 客户端持有；旧版本可能仍把它标成 `PublicKey`。

把输出中的 `PrivateKey` 与 `Password` 分别填入变量：

```bash
REALITY_PRIVATE_KEY='粘贴 Private key'
REALITY_PASSWORD='粘贴 Password（旧版本为 Public key）'
REALITY_SHORT_ID=$(openssl rand -hex 8)

echo "UUID: $XRAY_UUID"
echo "Private key prefix: ${REALITY_PRIVATE_KEY:0:6}******"
echo "Password prefix:    ${REALITY_PASSWORD:0:6}******"
echo "Short ID: $REALITY_SHORT_ID"
```

保存到仅 root 可读的参数文件：

```bash
cat > /root/xray-reality-params.sh <<EOF
XRAY_UUID='$XRAY_UUID'
REALITY_PRIVATE_KEY='$REALITY_PRIVATE_KEY'
REALITY_PASSWORD='$REALITY_PASSWORD'
REALITY_SHORT_ID='$REALITY_SHORT_ID'
SERVER_NAME='x.domain.com'
REALITY_TARGET='127.0.0.1:8443'
LISTEN_PORT='443'
FLOW='xtls-rprx-vision'
EOF

chmod 600 /root/xray-reality-params.sh
```

注意：服务端配置使用 `PrivateKey`；客户端使用对应的 `Password`。不要把 `PrivateKey` 写入分享链接或客户端配置，也不要公开发布完整的客户端连接参数。

### 3. 写入服务端配置

先再次确认 `443` 没有被其他程序占用：

```bash
ss -tulpen | grep -E ':(80|443|8443)\s' || true
```

载入参数并备份原配置：

```bash
source /root/xray-reality-params.sh
mkdir -p /root/xray-backup
cp -a /usr/local/etc/xray \
  /root/xray-backup/xray.$(date +%F-%H%M%S)
```

写入 `/usr/local/etc/xray/config.json`：

```bash
cat > /usr/local/etc/xray/config.json <<EOF
{
  "log": {
    "loglevel": "warning",
    "access": "/var/log/xray/access.log",
    "error": "/var/log/xray/error.log"
  },
  "inbounds": [
    {
      "tag": "vless-reality-in",
      "listen": "0.0.0.0",
      "port": ${LISTEN_PORT},
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "${XRAY_UUID}",
            "flow": "${FLOW}",
            "email": "main-user"
          }
        ],
        "decryption": "none"
      },
      "streamSettings": {
        "method": "raw",
        "security": "reality",
        "realitySettings": {
          "show": false,
          "target": "${REALITY_TARGET}",
          "xver": 0,
          "serverNames": ["${SERVER_NAME}"],
          "privateKey": "${REALITY_PRIVATE_KEY}",
          "shortIds": ["${REALITY_SHORT_ID}"]
        }
      },
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls", "quic"],
        "routeOnly": true
      }
    }
  ],
  "outbounds": [
    {
      "tag": "direct",
      "protocol": "freedom"
    },
    {
      "tag": "block",
      "protocol": "blackhole"
    }
  ],
  "routing": {
    "domainStrategy": "AsIs",
    "rules": [
      {
        "type": "field",
        "protocol": ["bittorrent"],
        "outboundTag": "block"
      }
    ]
  }
}
EOF
```

官方安装脚本默认使用 `User=nobody`。在 Debian 中让配置归 `root:nogroup`、权限为 `640`，既能让服务读取，又避免其他普通用户直接读取 UUID 与 REALITY 私钥：

```bash
chown root:nogroup /usr/local/etc/xray/config.json
chmod 640 /usr/local/etc/xray/config.json
systemctl show xray -p User -p Group
```

如果你改过 systemd 服务用户或组，请让配置的组与实际运行组一致，不要机械照抄 `nogroup`。

### 4. 验证并启动 Xray

先测试配置，不要直接重启：

```bash
xray run -test -config /usr/local/etc/xray/config.json
```

看到 `Configuration OK.` 后再启动：

```bash
systemctl restart xray
systemctl status xray --no-pager
ss -tulpen | grep -E ':(80|443|8443)\s' || true
```

最终应为：

```text
80                 -> Nginx
0.0.0.0:443        -> Xray
127.0.0.1:8443     -> Nginx
```

测试非 REALITY 请求是否能由 Xray 转到本机 Nginx：

```bash
source /root/xray-reality-params.sh

curl -I --resolve "$SERVER_NAME:443:127.0.0.1" \
  "https://$SERVER_NAME/"
```

如果失败，查看：

```bash
journalctl -u xray -n 100 --no-pager
tail -n 80 /var/log/nginx/x.domain.com.8443.error.log
```

最后在本地电脑测试公网访问：

```bash
curl -I https://x.domain.com/
```

普通浏览器访问应看到前面创建的静态页面。

## 第四部分：生成客户端配置

### 1. VLESS URI

在服务器 root shell 中执行：

```bash
source /root/xray-reality-params.sh

cat > /root/xray-client-uri.txt <<EOF
vless://${XRAY_UUID}@${SERVER_NAME}:${LISTEN_PORT}?encryption=none&flow=${FLOW}&security=reality&sni=${SERVER_NAME}&fp=chrome&pbk=${REALITY_PASSWORD}&sid=${REALITY_SHORT_ID}&type=tcp&headerType=none#${SERVER_NAME}-reality
EOF

chmod 600 /root/xray-client-uri.txt
cat /root/xray-client-uri.txt
```

不同客户端对分享 URI 的兼容性不完全一致。如果导入失败，可以手动填写：

```text
协议：VLESS
地址：x.domain.com
端口：443
UUID：XRAY_UUID
加密：none
传输：TCP / RAW
安全：REALITY
Flow：xtls-rprx-vision
SNI：x.domain.com
Fingerprint：chrome
Password / Public Key：REALITY_PASSWORD（名称以客户端 UI 为准）
Short ID：REALITY_SHORT_ID
Allow insecure：false
UDP：true
```

### 2. Mihomo / Clash Meta 片段

```bash
source /root/xray-reality-params.sh

cat > /root/xray-mihomo-proxy.yaml <<EOF
- name: "${SERVER_NAME}-reality"
  type: vless
  server: ${SERVER_NAME}
  port: ${LISTEN_PORT}
  uuid: ${XRAY_UUID}
  network: tcp
  udp: true
  tls: true
  flow: ${FLOW}
  servername: ${SERVER_NAME}
  client-fingerprint: chrome
  reality-opts:
    public-key: ${REALITY_PASSWORD}
    short-id: ${REALITY_SHORT_ID}
EOF

chmod 600 /root/xray-mihomo-proxy.yaml
cat /root/xray-mihomo-proxy.yaml
```

### 3. sing-box outbound 片段

```bash
source /root/xray-reality-params.sh

cat > /root/xray-singbox-outbound.json <<EOF
{
  "type": "vless",
  "tag": "${SERVER_NAME}-reality",
  "server": "${SERVER_NAME}",
  "server_port": ${LISTEN_PORT},
  "uuid": "${XRAY_UUID}",
  "flow": "${FLOW}",
  "packet_encoding": "xudp",
  "tls": {
    "enabled": true,
    "server_name": "${SERVER_NAME}",
    "utls": {
      "enabled": true,
      "fingerprint": "chrome"
    },
    "reality": {
      "enabled": true,
      "public_key": "${REALITY_PASSWORD}",
      "short_id": "${REALITY_SHORT_ID}"
    }
  }
}
EOF

chmod 600 /root/xray-singbox-outbound.json
cat /root/xray-singbox-outbound.json
```

这只是一个 outbound 片段，需要放入完整 sing-box 配置的 `outbounds` 数组中。

## 第五部分：最终验收与日常维护

### 一次性验收清单

服务器端：

```bash
sudo sshd -t
sudo systemctl --no-pager --full status ssh fail2ban nginx xray
sudo fail2ban-client status sshd
sudo nginx -t
sudo xray run -test -config /usr/local/etc/xray/config.json
sudo ss -tulpen | grep -E ':(80|443|8443|42345)\s'
sudo ufw status verbose
```

本地电脑：

```bash
ssh debian13-server
curl -I http://x.domain.com/
curl -I https://x.domain.com/
```

最后用实际客户端导入节点，确认 TCP 与 UDP 的常用访问都正常。

### 更新与日志

定期更新 Debian：

```bash
sudo apt update
sudo apt full-upgrade
```

用官方脚本更新 Xray 后，重新执行配置测试并观察服务：

```bash
sudo -i
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install
xray run -test -config /usr/local/etc/xray/config.json
systemctl restart xray
systemctl status xray --no-pager
```

如果只想更新 `geoip.dat` 与 `geosite.dat`，不更新 Xray-core，可以使用官方脚本的 `install-geodata`：

```bash
sudo -i
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install-geodata

ls -lh /usr/local/share/xray/geoip.dat \
  /usr/local/share/xray/geosite.dat
xray run -test -config /usr/local/etc/xray/config.json
systemctl restart xray
systemctl status xray --no-pager
```

如果配置中使用了 `geoip:` 或 `geosite:` 路由规则，更新文件后需要重启 Xray，才能确保当前进程载入新数据。

常用日志：

```bash
sudo journalctl -u ssh -n 100 --no-pager
sudo journalctl -u fail2ban -n 100 --no-pager
sudo journalctl -u nginx -n 100 --no-pager
sudo journalctl -u xray -n 100 --no-pager
```

如果服务异常，优先按“配置测试 → 服务状态 → 端口监听 → 防火墙 → DNS”这个顺序排查，不要一上来同时改多处配置。

## 参考资料

- [Debian 13 `sshd_config(5)`](https://manpages.debian.org/trixie/openssh-server/sshd_config.5.en.html)
- [Debian 13 Fail2Ban `jail.conf(5)`](https://manpages.debian.org/trixie/fail2ban/jail.conf.5.en.html)
- [Project X：REALITY 配置](https://xtls.github.io/config/transports/reality.html)
- [Project X：传输配置](https://xtls.github.io/config/transport.html)
- [XTLS/Xray-install](https://github.com/XTLS/Xray-install)
- [acme.sh](https://github.com/acmesh-official/acme.sh)
