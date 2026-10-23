import { useEffect, useRef, useState } from 'react';
import {
    SquaresFour, BookOpen, BookBookmark, CaretLeft, MagnifyingGlass, X, FadersHorizontal
} from '@phosphor-icons/react';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

// `id` is the module key used by App's navigateTo (null = hub).
const NAV_ITEMS = [
    { id: null, label: 'Inicio', icon: SquaresFour },
    { id: 'congresos', label: 'Congresos', title: 'Congresos Científicos', icon: BookOpen },
    { id: 'revistas', label: 'Revistas', title: 'Revistas Científicas', icon: BookBookmark },
];

// Below this width the right panel is a drawer opened from the topbar (see index.css).
const DRAWER_QUERY = '(max-width: 1024px)';

export default function DashboardLayout({
    activeModule = null,
    onNavigate,
    searchValue,
    onSearchChange,
    searchPlaceholder,
    rightPanel,
    panelBadge = 0,
    panelDoneLabel = 'Ver resultados',
    children
}) {
    const [panelOpen, setPanelOpen] = useState(false);
    const closeButtonRef = useRef(null);

    // Modals opened from inside the drawer must keep scrolling too
    useBodyScrollLock(panelOpen, '.info-panel, .modal-content');

    useEffect(() => {
        if (!panelOpen) return;
        closeButtonRef.current?.focus();

        const onKeyDown = (e) => {
            if (e.key === 'Escape' && !document.querySelector('.modal-overlay')) setPanelOpen(false);
        };
        const media = window.matchMedia(DRAWER_QUERY);
        const onResize = () => { if (!media.matches) setPanelOpen(false); };

        window.addEventListener('keydown', onKeyDown);
        media.addEventListener('change', onResize);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            media.removeEventListener('change', onResize);
        };
    }, [panelOpen]);

    const closePanel = () => setPanelOpen(false);

    return (
        <div className="dashboard">
            {/* Desktop Left Sidebar */}
            <aside className="sidebar">
                <button
                    type="button"
                    className="sidebar__brand"
                    title="IDIC - Instituto de Investigación Científica"
                    onClick={() => onNavigate(null)}
                >
                    <span className="sidebar__brand-letter">I</span>
                </button>

                <nav className="sidebar__nav">
                    {NAV_ITEMS.map(({ id, label, title: itemTitle, icon: Icon }) => (
                        <button
                            key={label}
                            type="button"
                            className={`sidebar__btn ${activeModule === id ? 'sidebar__btn--active' : ''}`}
                            title={itemTitle || label}
                            onClick={() => onNavigate(id)}
                        >
                            <Icon size={22} />
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Topbar: back + search. The page title lives in the content, so the
                hub (no back, no search) has no topbar. */}
            {activeModule && (
                <header className="topbar">
                    <button type="button" className="topbar__back" onClick={() => onNavigate(null)}>
                        <CaretLeft size={16} />
                        Inicio
                    </button>

                    {onSearchChange && (
                        <div className="topbar__search-wrap">
                            <MagnifyingGlass size={18} className="topbar__search-icon" />
                            <input
                                type="text"
                                className="topbar__search"
                                placeholder={searchPlaceholder}
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                            {searchValue && (
                                <button
                                    type="button"
                                    className="topbar__search-clear"
                                    onClick={() => onSearchChange('')}
                                    title="Limpiar búsqueda"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    )}

                    {rightPanel && (
                        <button
                            type="button"
                            className="topbar__panel-btn"
                            onClick={() => setPanelOpen(true)}
                            aria-expanded={panelOpen}
                            aria-controls="info-panel"
                        >
                            <FadersHorizontal size={18} />
                            <span>Filtros</span>
                            {panelBadge > 0 && <span className="topbar__panel-badge">{panelBadge}</span>}
                        </button>
                    )}
                </header>
            )}

            {/* Main Area */}
            <div className="main-area">
                <main className="main-content">
                    {children}
                </main>

                {/* Sticky sidebar on desktop; drawer (close button + footer) on smaller screens */}
                {rightPanel && (
                    <aside id="info-panel" className={`info-panel ${panelOpen ? 'info-panel--open' : ''}`}>
                        <button
                            ref={closeButtonRef}
                            type="button"
                            className="info-panel__close"
                            onClick={closePanel}
                            aria-label="Cerrar panel"
                        >
                            <X size={18} />
                        </button>

                        {rightPanel}

                        <div className="info-panel__footer">
                            <button type="button" className="info-panel__done" onClick={closePanel}>
                                {panelDoneLabel}
                            </button>
                        </div>
                    </aside>
                )}
                {panelOpen && <div className="info-panel-backdrop" onClick={closePanel} />}
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="mobile-nav">
                {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={label}
                        type="button"
                        className={`mobile-nav__btn ${activeModule === id ? 'mobile-nav__btn--active' : ''}`}
                        onClick={() => onNavigate(id)}
                    >
                        <Icon size={20} />
                        {label}
                    </button>
                ))}
            </nav>
        </div>
    );
}
