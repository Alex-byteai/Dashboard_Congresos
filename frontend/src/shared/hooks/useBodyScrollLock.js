import { useEffect } from 'react';

// Locks page scroll while `locked` is true, restoring the previous state on
// unlock/unmount. `<html>` is the element that actually scrolls in standards
// mode, so both it and `<body>` need the lock for this to work cross-browser.
// Compensates for the vanished scrollbar width so the page doesn't shift
// when the lock engages.
export default function useBodyScrollLock(locked) {
    useEffect(() => {
        if (!locked) return;

        const { documentElement: html, body } = document;
        const scrollbarWidth = window.innerWidth - html.clientWidth;

        const previous = {
            htmlOverflow: html.style.overflow,
            bodyOverflow: body.style.overflow,
            bodyPaddingRight: body.style.paddingRight,
        };

        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            html.style.overflow = previous.htmlOverflow;
            body.style.overflow = previous.bodyOverflow;
            body.style.paddingRight = previous.bodyPaddingRight;
        };
    }, [locked]);
}
