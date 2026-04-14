import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle, AlertCircle, ExternalLink, FileSearch, ShieldAlert } from 'lucide-react';

export default function ReviewRequestModal({ isOpen, onClose, revistas = [], revistasObservadas = [] }) {
    const [issn, setIssn] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle' | 'found' | 'bad_practice' | 'not_found'
    const [foundJournal, setFoundJournal] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSee2dW_AWE-0e-p1p-sApvKxKRD9hp4FNXYCjwIWpWnsg1KSA/viewform";

    // Trigger smooth fade-in without double blink
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
        setTimeout(() => {
            setIssn('');
            setStatus('idle');
            setFoundJournal(null);
            onClose();
        }, 150); // Small delay to let opacity fade out before removing from DOM
    };

    const cleanString = (str) => {
        if (!str) return '';
        return String(str).replace(/[-\s.,]/g, '').toLowerCase();
    };

    const handleCheck = (e) => {
        e.preventDefault();

        if (!issn.trim()) return;

        const searchTarget = cleanString(issn);

        // Prevent false positives on very short inputs (ISSN is usually 8 chars)
        if (searchTarget.length < 6) {
            alert("Por favor, ingresa un ISSN más completo (mínimo 6 caracteres).");
            return;
        }

        const matchBad = revistasObservadas.find(rev => {
            const cIssn = cleanString(rev.issn);
            const cEissn = cleanString(rev.eissn || rev.e_issn);
            return (cIssn && cIssn.includes(searchTarget)) || (cEissn && cEissn.includes(searchTarget));
        });

        if (matchBad) {
            setFoundJournal(matchBad);
            setStatus('bad_practice');
            return;
        }

        const matchGood = revistas.find(rev => {
            const cIssn = cleanString(rev.issn);
            const cEissn = cleanString(rev.eissn || rev.e_issn);
            return (cIssn && cIssn.includes(searchTarget)) || (cEissn && cEissn.includes(searchTarget));
        });

        if (matchGood) {
            setFoundJournal(matchGood);
            setStatus('found');
        } else {
            setStatus('not_found');
            setFoundJournal(null);
        }
    };

    return (
        <div className="modal-overlay" onClick={handleClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            backdropFilter: 'blur(4px)',
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.2s ease-out'
        }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                background: '#ffffff', borderRadius: '16px',
                padding: '0', width: '92%', maxWidth: '540px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative', overflow: 'hidden',
                transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute', top: '1.25rem', right: '1.25rem',
                        background: '#f1f5f9', border: 'none', cursor: 'pointer',
                        color: '#64748b', borderRadius: '50%', width: '36px', height: '36px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s', zIndex: 10
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#334155'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                >
                    <X size={20} />
                </button>

                <div style={{ padding: '2.5rem 2.5rem 1.5rem', borderBottom: status === 'idle' ? 'none' : '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: '#fff7ed', borderRadius: '20px', color: 'var(--accent)', marginBottom: '1rem' }}>
                            <FileSearch size={32} strokeWidth={1.5} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#0f172a', letterSpacing: '-0.02em' }}>
                            Consulta de Revista
                        </h2>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b', lineHeight: '1.5', maxWidth: '380px' }}>
                            Ingresa el identificador para verificar si la revista ya fue evaluada en nuestro sistema.
                        </p>
                    </div>

                    <form onSubmit={handleCheck} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', '@media (minWidth: 480px)': { flexDirection: 'row' } }}>
                           <input
                                type="text"
                                required
                                minLength={6}
                                value={issn}
                                onChange={e => {
                                    setIssn(e.target.value);
                                    if (status !== 'idle') setStatus('idle');
                                }}
                                style={{
                                    flex: 1, padding: '1rem 1.25rem', borderRadius: '12px', border: '2px solid #e2e8f0',
                                    fontSize: '1rem', fontFamily: 'inherit', boxSizing: 'border-box',
                                    outline: 'none', transition: 'border-color 0.2s', background: '#f8fafc',
                                    color: '#0f172a', letterSpacing: '1px'
                                }}
                                placeholder="ISSN / E-ISSN (Ej. 1234-5678)"
                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                            />
                            <button
                                type="submit"
                                style={{
                                    padding: '1rem 1.5rem', background: 'var(--accent)', border: 'none',
                                    borderRadius: '12px', fontWeight: 700, color: 'white', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    fontSize: '1rem', transition: 'transform 0.1s, background 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <Search size={20} strokeWidth={2.5} />
                                Verificar
                            </button>
                        </div>
                    </form>
                </div>

                {/* Status Animated Area */}
                <div style={{
                    maxHeight: status === 'idle' ? '0' : '500px',
                    opacity: status === 'idle' ? 0 : 1,
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    background: status === 'found' ? '#f0fdf4' : status === 'not_found' ? '#f8fafc' : 'transparent',
                }}>

                    {status === 'found' && foundJournal && (
                        <div style={{ padding: '2rem 2.5rem', borderTop: '1px solid #bbf7d0' }}>
                            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                                <div style={{ background: '#dcfce7', padding: '0.5rem', borderRadius: '50%' }}>
                                    <CheckCircle size={28} color="#16a34a" style={{ flexShrink: 0 }} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#166534', fontSize: '1.1rem', fontWeight: 700 }}>¡Revista Evaluada!</h4>
                                    <p style={{ margin: '0 0 1rem 0', color: '#15803d', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                        La revista <strong style={{ color: '#14532d' }}>{foundJournal.journal}</strong> se encuentra en nuestra base de datos. Puedes encontrar su ficha de integridad y cuartiles usando el buscador principal de revistas.
                                    </p>
                                    <button onClick={handleClose} style={{
                                        background: 'transparent', border: '1.5px solid #22c55e', color: '#15803d',
                                        padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                                        fontSize: '0.85rem'
                                    }}>
                                        Volver al Dashboard
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'not_found' && (
                        <div style={{ padding: '2rem 2.5rem', borderTop: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                                <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '50%' }}>
                                    <AlertCircle size={28} color="#64748b" style={{ flexShrink: 0 }} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#334155', fontSize: '1.1rem', fontWeight: 700 }}>Revista No Encontrada</h4>
                                    <p style={{ margin: '0 0 1.25rem 0', color: '#475569', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                        No tenemos registros de esta revista en el sistema actual. Si consideras que debería ser evaluada, por favor envía una solicitud formal a nuestro equipo de integridad científica.
                                    </p>
                                    <a
                                        href={GOOGLE_FORM_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={handleClose}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                            padding: '0.8rem 1.5rem', background: '#0f172a', color: 'white',
                                            textDecoration: 'none', borderRadius: '10px', fontWeight: 600,
                                            fontSize: '0.9rem', width: '100%', boxSizing: 'border-box',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#0f172a'}
                                    >
                                        Ir al Formulario
                                        <ExternalLink size={18} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'bad_practice' && foundJournal && (
                        <div style={{ padding: '2rem 2.5rem', borderTop: '1px solid #fecaca', background: '#fef2f2' }}>
                            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                                <div style={{ background: '#fee2e2', padding: '0.5rem', borderRadius: '50%' }}>
                                    <ShieldAlert size={28} color="#dc2626" style={{ flexShrink: 0 }} />
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#991b1b', fontSize: '1.1rem', fontWeight: 700 }}>Alerta de Integridad</h4>
                                    <p style={{ margin: '0 0 1rem 0', color: '#b91c1c', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                        Esta revista ha sido descalificada por presentar indicios de malas prácticas. <strong>NO</strong> se recomienda su uso institucional.
                                    </p>
                                    <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                                        <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{foundJournal.journal}</strong>
                                        <span style={{ color: '#475569', fontSize: '0.85rem', display: 'block' }}>
                                            ISSN: {foundJournal.issn || '-'} | E-ISSN: {foundJournal.eissn || foundJournal.e_issn || '-'}
                                        </span>
                                    </div>
                                    <button onClick={handleClose} style={{
                                        background: 'transparent', border: '1.5px solid #ef4444', color: '#dc2626',
                                        padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                                        fontSize: '0.85rem', marginTop: '1rem', width: '100%'
                                    }}>
                                        Cerrar Alerta
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
