import { useState } from 'react';
import { MapPin, ArrowUpRight, CaretDown, CaretUp } from '@phosphor-icons/react';
import { trackEvent } from '../../../core/services/analytics';
import EmptyState from '../../../shared/components/EmptyState';
import CongressIntegrityModal from './CongressIntegrityModal';
import { VERDICTS } from '../verdicts';
import {
    STATUSES, STATUS_ORDER, getStatusBadge, formatLocation, formatDate, formatDateRange, toExternalUrl
} from '../utils';

function CongressCard({ event, onOpenIntegrity }) {
    const status = getStatusBadge(event);
    const verdict = VERDICTS[event.verdict];
    const VerdictIcon = verdict.icon;
    const url = toExternalUrl(event.enlace);
    const indexes = [
        event.isScopus && { label: 'Scopus', className: 'badge--scopus' },
        event.isIEEE && { label: 'IEEE', className: 'badge--ieee' },
        event.isWoS && { label: 'Web of Science', className: 'badge--wos' },
    ].filter(Boolean);

    return (
        <article className={`card-event card-event--${event.status}`}>
            <div className="card-event__header">
                <span className="card-event__acronym" title={event.nombreCompleto}>
                    {event.evento || 'CONGRESO'}
                </span>
                <span className={`urgency-badge ${status.className}`}>{status.label}</span>
            </div>

            <div className="card-event__body">
                <h3 className="card-event__title" title={event.nombreCompleto}>
                    {event.nombreCompleto}
                </h3>
                <p className="card-event__subline">
                    <MapPin size={14} />
                    <span>
                        {formatLocation(event)}
                        {event.modalidad && ` · ${event.modalidad}`}
                    </span>
                </p>
            </div>

            <dl className="card-event__facts">
                <div>
                    <dt>Evento</dt>
                    <dd>{formatDateRange(event)}</dd>
                </div>
                <div>
                    <dt>Cierre de envíos</dt>
                    <dd>{formatDate(event.deadline)}</dd>
                </div>
            </dl>

            {indexes.length > 0 && (
                <div className="card-event__badges">
                    {indexes.map(({ label, className }) => (
                        <span key={label} className={`badge ${className}`}>{label}</span>
                    ))}
                </div>
            )}

            <div className="card-event__footer">
                <button
                    type="button"
                    className={`card-action card-action--${event.verdict}`}
                    onClick={() => onOpenIntegrity(event)}
                    title={`Integridad: ${verdict.label}`}
                >
                    <VerdictIcon size={15} weight="fill" />
                    <span>Integridad</span>
                </button>

                {url && (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card-link"
                        onClick={() => trackEvent('outbound_click', { event_id: event.id, url })}
                    >
                        Sitio web
                        <ArrowUpRight size={14} />
                    </a>
                )}
            </div>
        </article>
    );
}

// Cards grouped by status (see STATUSES). `events` arrive sorted by compareByRelevance.
export default function CongressList({ events }) {
    const [integrityEvent, setIntegrityEvent] = useState(null);
    const [showFinished, setShowFinished] = useState(false);

    if (events.length === 0) {
        return <EmptyState title="No se encontraron congresos" />;
    }

    const sections = STATUS_ORDER
        .map(key => ({ key, events: events.filter(e => e.status === key) }))
        .filter(section => section.events.length > 0);

    return (
        <div className="status-sections">
            {sections.map(({ key, events: sectionEvents }) => {
                // Finished events start collapsed, unless they are all there is to show
                const isCollapsible = key === 'finished' && sections.length > 1;
                const isExpanded = !isCollapsible || showFinished;

                return (
                    <section key={key} className={`status-section status-section--${key}`}>
                        <div className="status-section__header">
                            <div>
                                <h2 className="status-section__title">
                                    {STATUSES[key].heading}
                                    <span className="status-section__count">{sectionEvents.length}</span>
                                </h2>
                                <p className="status-section__hint">{STATUSES[key].hint}</p>
                            </div>

                            {isCollapsible && (
                                <button
                                    type="button"
                                    className="status-section__toggle"
                                    onClick={() => setShowFinished(!showFinished)}
                                    aria-expanded={isExpanded}
                                >
                                    {isExpanded ? 'Ocultar' : `Ver ${sectionEvents.length} finalizados`}
                                    {isExpanded ? <CaretUp size={13} /> : <CaretDown size={13} />}
                                </button>
                            )}
                        </div>

                        {isExpanded && (
                            <div className="cards-grid">
                                {sectionEvents.map(event => (
                                    <CongressCard key={event.id} event={event} onOpenIntegrity={setIntegrityEvent} />
                                ))}
                            </div>
                        )}
                    </section>
                );
            })}

            <CongressIntegrityModal event={integrityEvent} onClose={() => setIntegrityEvent(null)} />
        </div>
    );
}
