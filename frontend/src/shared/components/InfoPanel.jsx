import { FileText } from '@phosphor-icons/react';
import { PROTOCOLO_PDF_URL } from '../constants';

// Building blocks for the right info panel (DashboardLayout `rightPanel`).

export function InfoPanelSection({ title, children }) {
    return (
        <div className="info-panel__section">
            <p className="info-panel__section-title">{title}</p>
            {children}
        </div>
    );
}

// One row: avatar, name + subtitle and an optional `aside` (badge). Renders as an
// external link when `href` is given and as a button when `onClick` is given.
export function InfoPanelItem({ avatar, tone, name, sub, aside, href, onClick, title }) {
    const content = (
        <>
            <div className={`info-panel__avatar ${tone ? `info-panel__avatar--${tone}` : ''}`}>{avatar}</div>
            <div className="info-panel__item-text">
                <div className="info-panel__item-name">{name}</div>
                <div className="info-panel__item-sub">{sub}</div>
            </div>
            {aside}
        </>
    );

    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="info-panel__item" title={title}>
                {content}
            </a>
        );
    }
    if (onClick) {
        return (
            <button type="button" className="info-panel__item" onClick={onClick} title={title}>
                {content}
            </button>
        );
    }
    return <div className="info-panel__item" title={title}>{content}</div>;
}

export function ProtocolPanelSection() {
    return (
        <InfoPanelSection title="Protocolo IDIC">
            <InfoPanelItem
                href={PROTOCOLO_PDF_URL}
                avatar={<FileText size={18} />}
                name="Protocolo de Idoneidad"
                sub="Lineamientos para publicaciones (PDF)"
                title="Ver documento oficial del Protocolo IDIC"
            />
        </InfoPanelSection>
    );
}
