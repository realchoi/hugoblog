(() => {
    'use strict';

    const roots = document.querySelectorAll('[data-reward-root]');
    if (!roots.length) {
        return;
    }

    const focusableSelector = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    roots.forEach((root) => {
        if (root.dataset.rewardInitialized === 'true') {
            return;
        }

        const openButton = root.querySelector('[data-reward-open]');
        const modal = root.querySelector('[data-reward-modal]');
        const dialog = root.querySelector('[role="dialog"]');
        const closeButton = root.querySelector('[data-reward-close]');
        const backdrop = root.querySelector('[data-reward-backdrop]');

        if (!openButton || !modal || !dialog || !closeButton || !backdrop) {
            return;
        }

        let previouslyFocused = null;

        const showMissingImage = (image) => {
            const fallback = image.parentElement.querySelector('[data-reward-image-fallback]');
            image.hidden = true;
            if (fallback) {
                fallback.hidden = false;
            }
        };

        root.querySelectorAll('[data-reward-image]').forEach((image) => {
            image.addEventListener('error', () => showMissingImage(image), { once: true });
            if (image.complete && image.naturalWidth === 0) {
                showMissingImage(image);
            }
        });

        const isOpen = () => !modal.hidden;

        const openModal = () => {
            if (isOpen()) {
                return;
            }

            previouslyFocused = document.activeElement instanceof HTMLElement
                ? document.activeElement
                : openButton;
            modal.hidden = false;
            modal.dataset.state = 'open';
            modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('reward-modal-open');
            closeButton.focus({ preventScroll: true });
        };

        const closeModal = () => {
            if (!isOpen()) {
                return;
            }

            modal.hidden = true;
            modal.dataset.state = 'closed';
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('reward-modal-open');

            if (previouslyFocused && document.contains(previouslyFocused)) {
                previouslyFocused.focus({ preventScroll: true });
            }
        };

        const keepFocusInside = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeModal();
                return;
            }

            if (event.key !== 'Tab') {
                return;
            }

            const focusableElements = Array.from(dialog.querySelectorAll(focusableSelector))
                .filter((element) => !element.hidden && element.getClientRects().length > 0);

            if (!focusableElements.length) {
                event.preventDefault();
                dialog.focus({ preventScroll: true });
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        openButton.addEventListener('click', openModal);
        closeButton.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);
        modal.addEventListener('keydown', keepFocusInside);

        root.dataset.rewardInitialized = 'true';
        root.classList.add('reward--enhanced');
    });
})();
