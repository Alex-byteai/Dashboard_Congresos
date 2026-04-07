import React from 'react';
import { Building2, ExternalLink, Hash, Layers, SearchX, Globe, Layout, ChevronDown, ChevronUp, ShieldCheck, FilePlus } from 'lucide-react';

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

            {(r.sitioWeb || r.enlace_informe) && (
                <div className="event-actions" style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '1rem', width: '100%' }}>
                    {r.sitioWeb && (
                        <a
                            href={r.sitioWeb}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="event-link"
                            style={{ background: 'var(--primary)', color: 'white', border: '2px solid var(--primary)', borderRadius: '12px', flex: 1, justifyContent: 'center', marginBottom: 0, padding: '0.65rem', boxSizing: 'border-box' }}
                        >
                            Explorar
                            <ExternalLink size={16} />
                        </a>
                    )}
                    {r.enlace_informe && (
                        <a
                            href={r.enlace_informe}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="event-link"
                            style={{ background: '#f8fafc', color: 'var(--text-main)', border: '2px solid #e2e8f0', borderRadius: '12px', flex: 1, justifyContent: 'center', marginBottom: 0, padding: '0.65rem', boxSizing: 'border-box' }}
                        >
                            Informe
                            <ShieldCheck size={16} style={{ color: '#059669' }} />
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}

export default function RevistasList({ revistas, onRequestReview }) {
    if (!revistas || revistas.length === 0) {
        return (
            <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)', textAlign: 'center' }}>
                <SearchX size={64} className="empty-icon" style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text)', marginBottom: '0.5rem' }}>No se encontraron revistas</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: onRequestReview ? '2rem' : 0 }}>Intenta ajustar los filtros de búsqueda o ingresa otros términos.</p>
                
                {onRequestReview && (
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', maxWidth: '400px', width: '100%', boxShadow: 'var(--shadow-sm)' }}>
                        <FilePlus size={32} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text)' }}>¿No encuentras la revista que buscas?</h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Solicita la evaluación de una revista que aún no ha sido indexada.</p>
                        <button 
                            onClick={onRequestReview}
                            style={{ padding: '0.6rem 1.25rem', background: 'var(--card-bg)', color: 'var(--text-main)', border: '1.5px solid var(--border)', borderRadius: '50px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', width: '100%', justifyContent: 'center' }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-main)' }}
                        >
                            Solicitar Inclusión
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="cards-grid">
            {revistas.map((r) => <RevistaCard key={r.id} r={r} />)}
        </div>
    );
}
