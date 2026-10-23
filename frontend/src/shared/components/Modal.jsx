import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from '@phosphor-icons/react';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

// Shared modal shell: overlay + panel + header (icon box, title, subtitle, close
// button) + enter/exit animation + body scroll lock. Content goes in `children`;
// pass a function as children to receive the animated `close` handler for
// internal close buttons.
export default function Modal({
    isOpen,
    onClose,
    icon: Icon,
    iconVariant = 'default', // 'default' | 'danger' | 'success'
    badge,
    badgeVariant = 'default', // 'default' | 'danger'
    title,
    subtitle,
    maxWidth = '640px',
    children
}) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        }
        setIsVisible(false);
    }, [isOpen]);

    useBodyScrollLock(isOpen);

    if (!isOpen) return null;

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose(), 200);
    };

    const iconBoxClass = `modal-header__icon-box ${iconVariant !== 'default' ? `modal-header__icon-box--${iconVariant}` : ''}`;
    const badgeClass = `modal-header__badge ${badgeVariant !== 'default' ? `modal-header__badge--${badgeVariant}` : ''}`;

    const modalElement = (
        <div
            className={`modal-overlay ${isVisible ? 'modal-overlay--visible' : ''}`}
            onClick={handleClose}
        >
            <div
                className={`modal-content ${isVisible ? 'modal-content--visible' : ''}`}
                onClick={e => e.stopPropagation()}
                style={{ maxWidth }}
            >
                <div className="modal-header">
                    <div className="modal-header__main">
                        {Icon && (
                            <div className={iconBoxClass}>
                                <Icon size={24} />
                            </div>
                        )}
                        <div className="modal-header__titles">
                            <div className="modal-header__title-row">
                                <h2 className="modal-header__title">{title}</h2>
                                {badge && (
                                    <span className={badgeClass}>{badge}</span>
                                )}
                            </div>
                            {subtitle && (
                                <p className="modal-header__subtitle">{subtitle}</p>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="modal-close-btn"
                        title="Cerrar ventana"
                        aria-label="Cerrar ventana"
                    >
                        <X size={18} />
                    </button>
                </div>

                {typeof children === 'function' ? children(handleClose) : children}
            </div>
        </div>
    );

    return createPortal(modalElement, document.body);
}
