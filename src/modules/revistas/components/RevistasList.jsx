import React from 'react';
import { Building2, ExternalLink, Hash, Layers, SearchX, Globe, Layout, ChevronDown, ChevronUp } from 'lucide-react';

function RevistaCard({ r }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const hasQuartiles = (r.categorias_scopus || []).length > 0;

    return (
        <div key={r.id} className="event-card event-card--revistas">
            <div className="event-header">
                <div className="event-tech-header">
                    {r.issn && (
                        <div className="tech-tag" title="ISSN Internacional">
                            <b>ISSN</b> {r.issn}
                        </div>
                    )}
                    {r.eissn && (
                        <div className="tech-tag" title="Electronic ISSN">
                            <b>E-ISSN</b> {r.eissn}
                        </div>
                    )}
                </div>
            </div>

            <h3 className="event-title">{r.journal}</h3>

            <div className="event-meta">
                <div className="meta-item">
                    <Layout size={18} className="meta-icon" />
                    <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{r.enfoque || 'General'}</span>
                </div>

                <div className="meta-item" style={{ alignItems: 'flex-start', minWidth: 0 }}>
                    <Layers size={18} className="meta-icon" style={{ marginTop: '6px', flexShrink: 0 }} />
                    <div className="quartile-list">
                        {hasQuartiles ? (
                            <>
                                <button 
                                    className="quartile-toggle-btn"
                                    onClick={() => setIsOpen(!isOpen)}
                                >
                                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    Scopus: {r.categorias_scopus.length} {(r.categorias_scopus.length === 1 ? 'Categoría' : 'Categorías')}
                                </button>
                                <div className={`quartile-content-wrapper ${isOpen ? 'is-open' : ''}`}>
                                    <div className="quartile-content-inner">
                                        {(r.categorias_scopus || []).map((cat, idx) => {
                                            const qClass = `q-rank-${(cat.Cuartil || 'NA').toLowerCase()}`;
                                            return (
                                                <div key={idx} className="quartile-row">
                                                    <span className={`quartile-indicator ${qClass}`}>
                                                        {cat.Cuartil || 'N/A'}
                                                    </span>
                                                    <span className="quartile-name" title={cat.Subcategoria}>
                                                        {cat.Subcategoria}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="tags-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {(r.disciplinas || []).map((d) => (
                                    <span key={d} className="badge badge-area">{d}</span>
                                ))}
                            </div>
                        )}
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
    );
}

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
            {revistas.map((r) => <RevistaCard key={r.id} r={r} />)}
        </div>
    );
}
