import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, ExternalLink, Info } from 'lucide-react';

export default function BadPracticesModal({ isOpen, onClose, revistasMalas = [] }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose(), 200);
    };

    return (
        <div className="modal-overlay" onClick={handleClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            backdropFilter: 'blur(4px)',
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.2s ease-out',
            padding: '1rem'
        }}>
            <style>{`
                .obs-table { width: 100%; border-collapse: collapse; text-align: left; }
                .obs-table th { padding: 1.1rem 1.25rem; font-weight: 600; }
                .obs-table td { padding: 1.1rem 1.25rem; border-bottom: 1px solid #e2e8f0; }

                @media (max-width: 640px) {
                    .obs-table thead { display: none; }
                    .obs-table, .obs-table tbody, .obs-table tr, .obs-table td { display: block; width: 100%; box-sizing: border-box; }
                    .obs-table tr { padding-top: 1rem; margin-bottom: 1rem; border-radius: 8px; background: white; border: 1px solid #e2e8f0; }
                    .obs-table td { text-align: right; padding-left: 50%; position: relative; border-bottom: 1px solid #f8fafc; padding-top: 0.75rem; padding-bottom: 0.75rem; }
                    .obs-table td::before {
                        content: attr(data-label);
                        position: absolute;
                        left: 1rem;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 40%;
                        white-space: nowrap;
                        text-align: left;
                        font-weight: 700;
                        color: #64748b;
                        font-size: 0.75rem;
                        text-transform: uppercase;
                    }
                    .obs-table td:first-child { 
                        text-align: left; padding: 0 1.25rem 1rem 1.25rem; 
                        border-bottom: 1px solid #e2e8f0; font-size: 1.1rem;
                    }
                    .obs-table td:first-child::before { display: none; }
                    .obs-table td:last-child {
                        text-align: left; padding-left: 1.25rem; padding-right: 1.25rem;
                        display: flex; justify-content: flex-start;
                        border-bottom: none;
                    }
                    .obs-table td:last-child::before { display: none; }
                }
            `}</style>
            
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                background: '#ffffff', borderRadius: '16px',
                padding: '0', width: '100%', maxWidth: '900px',
                maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
                position: 'relative', overflow: 'hidden',
                transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {/* Header (Corporate Ulima style) */}
                <div style={{ padding: '2rem', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', zIndex: 10 }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ padding: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a' }}>
                            <ShieldAlert size={28} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: '#0f172a' }}>Revistas Observadas</h2>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Registro de medios descalificados por indicios de malas prácticas editoriales.</p>
                        </div>
                    </div>
                    <button onClick={handleClose} style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: '#64748b', padding: '0.4rem', borderRadius: '50%',
                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }} 
                    onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Body / Table */}
                <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, background: '#f8fafc' }}>
                    {revistasMalas.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No se encontraron revistas observadas en la base de datos.</div>
                    ) : (
                        <div style={{ borderRadius: '10px', overflow: 'hidden', background: 'transparent' }}>
                            <table className="obs-table">
                                <thead>
                                    <tr style={{ background: '#0f172a', color: '#ffffff', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        <th style={{ padding: '1.1rem 1.25rem', fontWeight: 600 }}>Título de la Revista</th>
                                        <th style={{ padding: '1.1rem 1.25rem', fontWeight: 600, width: '120px' }}>ISSN</th>
                                        <th style={{ padding: '1.1rem 1.25rem', fontWeight: 600, width: '120px' }}>E-ISSN</th>
                                        <th style={{ padding: '1.1rem 1.25rem', width: '130px', textAlign: 'center', fontWeight: 600 }}>Informe</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {revistasMalas.map((rev, idx) => (
                                        <tr key={idx} style={{ transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                                            <td data-label="Título" style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 600, lineHeight: '1.3' }}>{rev.journal}</td>
                                            
                                            <td data-label="ISSN" style={{ fontSize: '0.9rem', color: '#475569', fontFamily: 'monospace' }}>
                                                {rev.issn && rev.issn !== '-' ? rev.issn : <span style={{ color: '#cbd5e1' }}>No disp.</span>}
                                            </td>
                                            
                                            <td data-label="E-ISSN" style={{ fontSize: '0.9rem', color: '#475569', fontFamily: 'monospace' }}>
                                                {rev.eissn && rev.eissn !== '-' ? rev.eissn : <span style={{ color: '#cbd5e1' }}>No disp.</span>}
                                            </td>

                                            <td data-label="Informe" style={{ textAlign: 'center' }}>
                                                {rev.enlace_informe && rev.enlace_informe.includes('http') ? (
                                                    <a href={rev.enlace_informe} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#ffffff', color: '#ff5017', border: '1.5px solid #ff5017', padding: '0.45rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s', minWidth: '100px' }} onMouseEnter={e => { e.currentTarget.style.background = '#ff5017'; e.currentTarget.style.color = '#ffffff'; }} onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#ff5017'; }}>
                                                        Revisar
                                                    </a>
                                                ) : <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic', display: 'inline-flex', minWidth: '100px', justifyContent: 'center' }}>-</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                
                {/* Footer Discl */}
                <div style={{ padding: '1.25rem 2rem', background: '#ffffff', borderTop: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <Info size={18} style={{ flexShrink: 0, color: '#ff5017', marginTop: '0.1rem' }} />
                    <p style={{ margin: 0, lineHeight: '1.5' }}>La información listada posee carácter referencial. Estas revistas fueron marcadas tras identificar indicios de malas prácticas según los lineamientos previstos por el IDIC. Su uso <strong>no está recomendado</strong> bajo ninguna circunstancia como medio de publicación institucional.</p>
                </div>
            </div>
        </div>
    );
}
