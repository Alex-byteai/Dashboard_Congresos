import React from 'react';
import { ExternalLink, AlertCircle, SearchX } from 'lucide-react';
import { trackEvent } from '../analytics'

export default function CongressTable({ events, getUrgencyClass, getUrgencyText }) {
    if (events.length === 0) {
        return (
            <div className="empty-state">
                <SearchX size={64} className="empty-icon" />
                <h3>No se encontraron eventos</h3>
                <p>Intenta ajustar los filtros</p>
            </div>
        );
    }

    const getStatusClass = (days) => {
        if (days === null) return 'status-passed';
        if (days < 0) return 'status-passed';
        if (days <= 30) return 'status-urgent';
        if (days <= 90) return 'status-warning';
        return 'status-good';
    }

    return (
        <div className="table-card">
            <div className="table-wrapper">
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th style={{ width: '30%' }}>Evento</th>
                            <th>Fecha</th>
                            <th>Lugar</th>
                            <th>Deadline</th>
                            <th>Indexación</th>
                            <th style={{ textAlign: 'right' }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map(event => (
                            <tr key={event.id}>
                                <td>
                                    <span className="table-event-name">{event.evento}</span>
                                    <span className="table-event-sub">{event.nombreCompleto}</span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span style={{ fontWeight: 600 }}>{event.fechaInicio}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>al {event.fechaFin}</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontWeight: 500 }}>{event.ciudad}</span>
                                    <br />
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{event.pais}</span>
                                </td>
                                <td>
                                    {event.deadlineDays !== null ? (
                                        <div className={`status-pill ${getStatusClass(event.deadlineDays)}`}>
                                            <AlertCircle size={12} />
                                            {event.deadlineDays < 0 ? 'Vencido' : getUrgencyText(event.deadlineDays)}
                                        </div>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Por definir</span>
                                    )}
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', paddingLeft: '8px' }}>
                                        {event.deadline || ''}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {event.isScopus && <span className="badge badge-scopus">Scopus</span>}
                                        {event.isIEEE && <span className="badge badge-ieee">IEEE</span>}
                                        {event.isWoS && <span className="badge badge-wos">WoS</span>}
                                        {!event.isScopus && !event.isIEEE && !event.isWoS && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>-</span>}
                                    </div>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    {event.enlace ? (
                                        <a
                                            href={`https://${event.enlace.replace(/^https?:\/\//, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="table-link"
                                            onClick={() => {
                                                const url = `https://${event.enlace.replace(/^https?:\/\//, '')}`
                                                trackEvent('outbound_click', { event_id: event.id, url })
                                            }}
                                        >
                                            Visitar <ExternalLink size={14} />
                                        </a>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>N/A</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="table-footer">
                Mostrando {events.length} resultados
            </div>
        </div>
    );
}
