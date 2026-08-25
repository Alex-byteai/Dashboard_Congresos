import React, { useState } from 'react';
import { Calendar, MapPin, Clock, GraduationCap, ArrowSquareOut as ExternalLink, WarningCircle as AlertCircle, MagnifyingGlassMinus as SearchX, ShieldCheck } from '@phosphor-icons/react';
import { trackEvent } from '../../../core/services/analytics'
import CongressIntegrityModal from './CongressIntegrityModal';

export default function CongressList({ events, getUrgencyClass, getUrgencyText }) {
    const [integrityEvent, setIntegrityEvent] = useState(null);

    if (events.length === 0) {
        return (
            <div className="empty-state">
                <SearchX size={64} className="empty-icon" />
                <h3>No se encontraron eventos</h3>
                <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
        );
    }

    return (
        <div className="cards-grid">
            {events.map(event => (
                <div key={event.id} className={`event-card ${event.isPast ? 'event-card--past' : ''}`}>
                    <div className="event-header">
                        <div className="event-acronym">{event.evento || 'N/A'}</div>
                        {event.isPast && (
                            <div className="event-status event-status--past">Finalizado</div>
                        )}
                        {event.deadlineDays !== null && (
                            <div className={`urgency-badge ${getUrgencyClass(event.deadlineDays)}`}>
                                <AlertCircle size={14} />
                                {getUrgencyText(event.deadlineDays)}
                            </div>
                        )}
                    </div>

                    <h3 className="event-title">{event.nombreCompleto}</h3>

                    <div className="event-meta">
                        <div className="meta-item">
                            <Calendar size={18} className="meta-icon" />
                            <span className={event.isPast ? 'event-dates--past' : ''}>
                                {event.fechaInicio} - {event.fechaFin}
                            </span>
                        </div>
                        <div className="meta-item">
                            <MapPin size={18} className="meta-icon" />
                            <span>{event.ciudad}, {event.pais}</span>
                        </div>
                        <div className="meta-item">
                            <Clock size={18} className="meta-icon" />
                            <span>Deadline: {event.deadline || 'Por definir'}</span>
                        </div>
                        <div className="meta-item" style={{ alignItems: 'flex-start' }}>
                            <GraduationCap size={18} className="meta-icon" style={{ marginTop: '4px', flexShrink: 0 }} />

                            <div className="tags-carousel" style={{ marginTop: '0' }}>
                                <div className="tags-track">
                                    {event.categoria && event.categoria.length > 0
                                        ? event.categoria.map((cat, index) => (
                                            <span key={`a-${index}`} className="badge badge-area">{cat}</span>
                                        ))
                                        : <span className="badge badge-area">{event.disciplina || 'Sin categoría'}</span>
                                    }
                                    {event.categoria && event.categoria.length > 0 && (
                                        event.categoria.map((cat, index) => (
                                            <span key={`b-${index}`} className="badge badge-area">{cat}</span>
                                        ))
                                    )}
                                    {(!event.categoria || event.categoria.length === 0) && (
                                        <span className="badge badge-area">{event.disciplina || 'Sin categoría'}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="badges">
                        {event.isScopus && <span className="badge badge-scopus">Scopus</span>}
                        {event.isIEEE && <span className="badge badge-ieee">IEEE</span>}
                        {event.isWoS && <span className="badge badge-wos">WoS</span>}
                        {event.modalidad && (
                            <span className={`badge badge-${event.modalidad.toLowerCase()}`}>
                                {event.modalidad}
                            </span>
                        )}
                    </div>

                    <div className="event-actions">
                        {event.enlace && (
                            <a
                                href={`https://${event.enlace.replace(/^https?:\/\//, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="event-link event-link--primary"
                                onClick={() => {
                                    const url = `https://${event.enlace.replace(/^https?:\/\//, '')}`
                                    trackEvent('outbound_click', { event_id: event.id, url })
                                }}
                            >
                                Explorar
                                <ExternalLink size={16} />
                            </a>
                        )}
                        <button
                            type="button"
                            className="event-link event-link--secondary"
                            onClick={() => setIntegrityEvent(event)}
                        >
                            Integridad
                            <ShieldCheck size={16} />
                        </button>
                    </div>
                </div>
            ))}

            <CongressIntegrityModal event={integrityEvent} onClose={() => setIntegrityEvent(null)} />
        </div>
    );
}
