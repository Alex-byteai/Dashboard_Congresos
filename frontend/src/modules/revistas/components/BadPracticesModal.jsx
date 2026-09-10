import React from 'react';
import { ShieldWarning as ShieldAlert, Info } from '@phosphor-icons/react';
import Modal from '../../../shared/components/Modal';

export default function BadPracticesModal({ isOpen, onClose, revistasMalas = [] }) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            icon={ShieldAlert}
            title="Revistas Observadas"
            subtitle="Registro de medios descalificados por indicios de malas prácticas editoriales."
            maxWidth="900px"
        >
            <style>{`
                .obs-table { width: 100%; border-collapse: collapse; text-align: left; }
                .obs-table th { padding: 1.1rem 1.25rem; font-weight: 600; }
                .obs-table td { padding: 1.1rem 1.25rem; border-bottom: 1px solid var(--border); }

                @media (max-width: 640px) {
                    .obs-table thead { display: none; }
                    .obs-table, .obs-table tbody, .obs-table tr, .obs-table td { display: block; width: 100%; box-sizing: border-box; }
                    .obs-table tr { padding-top: 1rem; margin-bottom: 1rem; border-radius: var(--radius-md); background: white; border: 1px solid var(--border); }
                    .obs-table td { text-align: right; padding-left: 50%; position: relative; border-bottom: 1px solid var(--card-bg-alt); padding-top: 0.75rem; padding-bottom: 0.75rem; }
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
                        color: var(--text-muted);
                        font-size: 0.75rem;
                        text-transform: uppercase;
                    }
                    .obs-table td:first-child {
                        text-align: left; padding: 0 1.25rem 1rem 1.25rem;
                        border-bottom: 1px solid var(--border); font-size: 1.1rem;
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

            {/* Body / Table */}
            <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, background: 'var(--card-bg-alt)' }}>
                {revistasMalas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No se encontraron revistas observadas en la base de datos.</div>
                ) : (
                    <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'transparent' }}>
                        <table className="obs-table">
                            <thead>
                                <tr style={{ background: 'var(--primary)', color: '#ffffff', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <th style={{ padding: '1.1rem 1.25rem', fontWeight: 600 }}>Título de la Revista</th>
                                    <th style={{ padding: '1.1rem 1.25rem', fontWeight: 600, width: '120px' }}>ISSN</th>
                                    <th style={{ padding: '1.1rem 1.25rem', fontWeight: 600, width: '120px' }}>E-ISSN</th>
                                    <th style={{ padding: '1.1rem 1.25rem', width: '130px', textAlign: 'center', fontWeight: 600 }}>Informe</th>
                                </tr>
                            </thead>
                            <tbody>
                                {revistasMalas.map((rev, idx) => (
                                    <tr key={idx} style={{ transition: 'background 0.2s var(--ease-out)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--card-bg-alt)'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                                        <td data-label="Título" style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: 600, lineHeight: '1.3' }}>{rev.journal}</td>

                                        <td data-label="ISSN" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                                            {rev.issn && rev.issn !== '-' ? rev.issn : <span style={{ color: 'var(--text-muted)' }}>No disp.</span>}
                                        </td>

                                        <td data-label="E-ISSN" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                                            {rev.eissn && rev.eissn !== '-' ? rev.eissn : <span style={{ color: 'var(--text-muted)' }}>No disp.</span>}
                                        </td>

                                        <td data-label="Informe" style={{ textAlign: 'center' }}>
                                            {rev.enlace_informe && rev.enlace_informe.includes('http') ? (
                                                <a href={rev.enlace_informe} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: 'var(--card-bg)', color: 'var(--accent)', border: '1.5px solid var(--accent)', padding: '0.45rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', transition: 'background 0.2s var(--ease-out), color 0.2s var(--ease-out)', minWidth: '100px' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#ffffff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--card-bg)'; e.currentTarget.style.color = 'var(--accent)'; }}>
                                                    Revisar
                                                </a>
                                            ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', display: 'inline-flex', minWidth: '100px', justifyContent: 'center' }}>-</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer Discl */}
            <div style={{ padding: '1.25rem 2rem', background: 'var(--card-bg)', borderTop: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Info size={18} style={{ flexShrink: 0, color: 'var(--accent)', marginTop: '0.1rem' }} />
                <p style={{ margin: 0, lineHeight: '1.5' }}>La información listada posee carácter referencial. Estas revistas fueron marcadas tras identificar indicios de malas prácticas según los lineamientos previstos por el IDIC. Su uso <strong>no está recomendado</strong> bajo ninguna circunstancia como medio de publicación institucional.</p>
            </div>
        </Modal>
    );
}
