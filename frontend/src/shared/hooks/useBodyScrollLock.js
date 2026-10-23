import { useEffect } from 'react';

// Locks page/main-content scroll without modifying <html> or <body> overflow.
// Modifying html/body overflow or injecting body.paddingRight breaks `position: sticky`
// on sidebars (.sidebar and .info-panel) and shifts the dashboard layout horizontally,
// causing the sidebars to collapse, glitch, or disappear.
// `allowSelector` is the overlay that may still scroll (a modal, the mobile panel).
export default function useBodyScrollLock(locked, allowSelector = '.modal-content') {
    useEffect(() => {
        if (!locked) return;

        // In this dashboard layout, vertical scrolling is handled inside `.main-content`
        const mainContent = document.querySelector('.main-content');
        let prevMainOverflow = '';

        if (mainContent) {
            prevMainOverflow = mainContent.style.overflow;
            mainContent.style.overflow = 'hidden';
        }

        // Prevent wheel / touchmove scrolling on the background while the overlay is open
        const preventBgScroll = (e) => {
            if (!e.target.closest(allowSelector)) {
                e.preventDefault();
            }
        };

        window.addEventListener('wheel', preventBgScroll, { passive: false });
        window.addEventListener('touchmove', preventBgScroll, { passive: false });

        return () => {
            if (mainContent) {
                mainContent.style.overflow = prevMainOverflow;
            }
            window.removeEventListener('wheel', preventBgScroll);
            window.removeEventListener('touchmove', preventBgScroll);
        };
    }, [locked, allowSelector]);
}
