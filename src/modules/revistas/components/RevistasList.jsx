import React from 'react';
import { Building2, ExternalLink, Hash, Layers, SearchX } from 'lucide-react';

export default function RevistasList({ revistas }) {
    if (!revistas || revistas.length === 0) {
        return (
            <div className="empty-state">
                <SearchX size={64} className="empty-icon" />
                <h3>No se encontraron revistas</h3>
                <p>Intenta ajustar los filtros</p>
            </div>
        );
    }

    return (
        <div className="cards-grid">
            {revistas.map((r) => (
                <div key={r.id} className="event-card">
                    <div className="event-header">
                        <div className="event-acronym" title={r.journal}>
                            {(r.journal || 'N/A').slice(0, 18)}{(r.journal || '').length > 18 ? '…' : ''}
                        </div>
                        {r.publisher && (
                            <div className="urgency-badge urgency-low" title={r.publisher}>
                                <Building2 size={14} />
                                {(r.publisher || '').slice(0, 14)}{(r.publisher || '').length > 14 ? '…' : ''}
                            </div>
                        )}
                    </div>

                    <h3 className="event-title">{r.journal}</h3>

                    <div className="event-meta">
                        <div className="meta-item">
                            <Hash size={18} className="meta-icon" />
                            <span>ISSN: {r.issn || '—'} {r.eissn ? `• eISSN: ${r.eissn}` : ''}</span>
                        </div>
                        {r.enfoque && (
                            <div className="meta-item" style={{ alignItems: 'flex-start' }}>
                                <Layers size={18} className="meta-icon" style={{ marginTop: '4px', flexShrink: 0 }} />
                                <span>{r.enfoque}</span>
                            </div>
                        )}
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

                    {r.sitioWeb && (
                        <a href={r.sitioWeb} target="_blank" rel="noopener noreferrer" className="event-link">
                            Visitar Sitio Web
                            <ExternalLink size={16} />
                        </a>
                    )}
                </div>
            ))}
        </div>
    );
}
