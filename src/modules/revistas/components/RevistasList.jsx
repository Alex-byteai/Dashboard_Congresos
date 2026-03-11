import React from 'react';
import { Building2, ExternalLink, Hash, Layers, SearchX, Globe, Layout } from 'lucide-react';

export default function RevistasList({ revistas }) {
    if (!revistas || revistas.length === 0) {
        return (
            <div className="empty-state">
                <SearchX size={64} className="empty-icon" />
                <h3>No se encontraron revistas</h3>
                <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
        );
    }

    return (
        <div className="cards-grid">
            {revistas.map((r) => (
                <div key={r.id} className="event-card event-card--revistas">
                    <div className="event-header">
                        <div className="event-acronym" title={r.journal}>
                            ISSN: {r.issn || 'N/A'}
                        </div>
                        {r.publisher && (
                            <div className="urgency-badge urgency-low" style={{ background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' }}>
                                <Building2 size={12} />
                                {r.publisher}
                            </div>
                        )}
                    </div>

                    <h3 className="event-title">{r.journal}</h3>

                    <div className="event-meta">
                        <div className="meta-item">
                            <Layout size={18} className="meta-icon" />
                            <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{r.enfoque || 'General'}</span>
                        </div>

                        <div className="meta-item" style={{ alignItems: 'flex-start' }}>
                            <Layers size={18} className="meta-icon" style={{ marginTop: '4px', flexShrink: 0 }} />
                            <div className="tags-carousel" style={{ marginTop: '0' }}>
                                <div className="tags-track">
                                    {(r.disciplinas || []).length > 0
                                        ? (r.disciplinas || []).map((d) => (
                                            <span key={d} className="badge badge-area">{d}</span>
                                        ))
                                        : <span className="badge badge-area">Sin disciplina</span>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="badges">
                        <span className={`badge ${r.tipo === 'Data Journal' ? 'badge-virtual' : 'badge-area'}`} style={{
                            background: r.tipo === 'Data Journal' ? '#ecfdf5' : '#eff6ff',
                            color: r.tipo === 'Data Journal' ? '#059669' : '#3b82f6',
                            fontWeight: 600
                        }}>
                            {r.tipo || 'Journal'}
                        </span>
                        {r.sitioWeb && (
                            <span className="badge badge-virtual" style={{ background: '#f8fafc', color: '#64748b' }}>
                                <Globe size={12} /> Acceso Online
                            </span>
                        )}
                    </div>

                    {r.sitioWeb && (
                        <a
                            href={r.sitioWeb}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="event-link"
                            style={{ background: 'var(--primary)', color: 'white', borderRadius: '14px' }}
                        >
                            Explorar Revista
                            <ExternalLink size={16} />
                        </a>
                    )}
                </div>
            ))}
        </div>
    );
}
