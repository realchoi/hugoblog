(() => {
    'use strict';

    const dialog = document.querySelector('[data-image-lightbox]');
    const content = document.querySelector('.post-single .post-content');
    if (!dialog || !content || dialog.dataset.imageLightboxInitialized === 'true') {
        return;
    }

    const preview = dialog.querySelector('[data-image-lightbox-preview]');
    const closeButton = dialog.querySelector('[data-image-lightbox-close]');
    if (!preview || !closeButton || typeof dialog.showModal !== 'function') {
        return;
    }

    const images = Array.from(content.querySelectorAll('img')).filter((image) => (
        !image.classList.contains('in-text') && !image.closest('a')
    ));
    if (!images.length) {
        return;
    }

    let previouslyFocused = null;

    const closeLightbox = () => {
        if (dialog.open) {
            dialog.close();
        }
    };

    const openLightbox = (trigger) => {
        const source = trigger.currentSrc || trigger.src;
        if (!source || dialog.open) {
            return;
        }

        previouslyFocused = trigger;
        preview.src = source;
        preview.alt = trigger.alt || '';
        dialog.showModal();
        document.documentElement.classList.add('image-lightbox-open');
        document.body.classList.add('image-lightbox-open');
        closeButton.focus({ preventScroll: true });
    };

    images.forEach((image) => {
        const label = image.alt ? `查看大图：${image.alt}` : '查看大图';
        image.classList.add('image-lightbox__trigger');
        image.setAttribute('role', 'button');
        image.setAttribute('tabindex', '0');
        image.setAttribute('aria-haspopup', 'dialog');
        image.setAttribute('aria-label', label);
        image.addEventListener('click', () => openLightbox(image));
        image.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') {
                return;
            }
            event.preventDefault();
            openLightbox(image);
        });
    });

    closeButton.addEventListener('click', closeLightbox);
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) {
            closeLightbox();
        }
    });
    dialog.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeLightbox();
        }
    });
    dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        closeLightbox();
    });
    dialog.addEventListener('close', () => {
        document.documentElement.classList.remove('image-lightbox-open');
        document.body.classList.remove('image-lightbox-open');
        preview.removeAttribute('src');
        preview.alt = '';

        if (previouslyFocused && document.contains(previouslyFocused)) {
            previouslyFocused.focus({ preventScroll: true });
        }
        previouslyFocused = null;
    });

    dialog.dataset.imageLightboxInitialized = 'true';
})();
