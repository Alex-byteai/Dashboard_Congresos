import React, { useState, useEffect } from 'react';
import { MagnifyingGlass as Search, CheckCircle, WarningCircle as AlertCircle, ArrowSquareOut as ExternalLink, FileMagnifyingGlass as FileSearch, ShieldWarning as ShieldAlert } from '@phosphor-icons/react';
import Modal from '../../../shared/components/Modal';

export default function ReviewRequestModal({ isOpen, onClose, revistas = [], revistasObservadas = [], onViewJournal }) {
    const [issn, setIssn] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle' | 'found' | 'bad_practice' | 'not_found'
    const [foundJournal, setFoundJournal] = useState(null);

    const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSee2dW_AWE-0e-p1p-sApvKxKRD9hp4FNXYCjwIWpWnsg1KSA/viewform";

    // Reset the form whenever the modal closes.
    useEffect(() => {
        if (!isOpen) {
            setIssn('');
            setStatus('idle');
            setFoundJournal(null);
        }
    }, [isOpen]);

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

        const findByIssn = (list) => list.find(rev => {
            const cIssn = cleanString(rev.issn);
            const cEissn = cleanString(rev.eissn || rev.e_issn);
            return (cIssn && cIssn.includes(searchTarget)) || (cEissn && cEissn.includes(searchTarget));
        });

        const matchBad = findByIssn(revistasObservadas);
        if (matchBad) {
            setFoundJournal(matchBad);
            setStatus('bad_practice');
            return;
        }

        const matchGood = findByIssn(revistas);
        if (matchGood) {
            setFoundJournal(matchGood);
            setStatus('found');
        } else {
            setStatus('not_found');
            setFoundJournal(null);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            icon={FileSearch}
            title="Consulta de Revista"
            subtitle="Verifica si ya fue evaluada por ISSN o E-ISSN."
            maxWidth="540px"
        >
            {(close) => (
                <>
                    <div style={{ padding: '1.5rem 2rem 2rem' }}>
                        <form onSubmit={handleCheck} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                                        flex: 1, padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)',
                                        fontSize: '1rem', fontFamily: 'var(--font-mono)', boxSizing: 'border-box',
                                        outline: 'none', transition: 'border-color 0.2s var(--ease-out)', background: 'var(--card-bg-alt)',
                                        color: 'var(--text)', letterSpacing: '0.5px'
                                    }}
                                    placeholder="ISSN / E-ISSN (Ej. 1234-5678)"
                                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                />
                                <button
                                    type="submit"
                                    style={{
                                        padding: '1rem 1.5rem', background: 'var(--accent)', border: 'none',
                                        borderRadius: 'var(--radius-md)', fontWeight: 700, color: 'white', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        fontSize: '1rem', transition: 'transform 0.1s var(--ease-out), background 0.2s var(--ease-out)',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Search size={20} />
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
                        transition: 'max-height 0.4s var(--ease-in-out), opacity 0.3s var(--ease-out)',
                        background: status === 'found' ? 'var(--pastel-green-bg)' : status === 'not_found' ? 'var(--card-bg-alt)' : 'transparent',
                    }}>

                        {status === 'found' && foundJournal && (
                            <div style={{ padding: '2rem 2.5rem', borderTop: '1px solid var(--pastel-green-bg)' }}>
                                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                                    <div style={{ background: 'var(--card-bg)', padding: '0.5rem', borderRadius: '50%' }}>
                                        <CheckCircle size={28} color="var(--pastel-green-text)" style={{ flexShrink: 0 }} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--pastel-green-text)', fontSize: '1.1rem', fontWeight: 700 }}>¡Revista Evaluada!</h4>
                                        <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                            La revista <strong style={{ color: 'var(--text)' }}>{foundJournal.journal}</strong> se encuentra en nuestra base de datos. Puedes encontrar su ficha de integridad y cuartiles usando el buscador principal de revistas.
                                        </p>
                                        <button onClick={() => {
                                            onViewJournal?.(foundJournal);
                                            close();
                                        }} style={{
                                            background: 'var(--pastel-green-text)', border: '1.5px solid var(--pastel-green-text)', color: 'white',
                                            padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer',
                                            fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem'
                                        }}>
                                            Ver revista en el Dashboard
                                            <ExternalLink size={15} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {status === 'not_found' && (
                            <div style={{ padding: '2rem 2.5rem', borderTop: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                                    <div style={{ background: 'var(--card-bg)', padding: '0.5rem', borderRadius: '50%' }}>
                                        <AlertCircle size={28} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text)', fontSize: '1.1rem', fontWeight: 700 }}>Revista No Encontrada</h4>
                                        <p style={{ margin: '0 0 1.25rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                            No tenemos registros de esta revista en el sistema actual. Si consideras que debería ser evaluada, por favor envía una solicitud formal a nuestro equipo de integridad científica.
                                        </p>
                                        <a
                                            href={GOOGLE_FORM_URL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={close}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                                padding: '0.8rem 1.5rem', background: 'var(--primary)', color: 'white',
                                                textDecoration: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600,
                                                fontSize: '0.9rem', width: '100%', boxSizing: 'border-box',
                                                boxShadow: 'none', transition: 'background 0.2s var(--ease-out)'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
                                        >
                                            Ir al Formulario
                                            <ExternalLink size={18} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {status === 'bad_practice' && foundJournal && (
                            <div style={{ padding: '2rem 2.5rem', borderTop: '1px solid var(--pastel-red-bg)', background: 'var(--pastel-red-bg)' }}>
                                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                                    <div style={{ background: 'var(--card-bg)', padding: '0.5rem', borderRadius: '50%' }}>
                                        <ShieldAlert size={28} color="var(--pastel-red-text)" style={{ flexShrink: 0 }} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--pastel-red-text)', fontSize: '1.1rem', fontWeight: 700 }}>Alerta de Integridad</h4>
                                        <p style={{ margin: '0 0 1rem 0', color: 'var(--pastel-red-text)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                            Esta revista ha sido descalificada por presentar indicios de malas prácticas. <strong>NO</strong> se recomienda su uso institucional.
                                        </p>
                                        <div style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--pastel-red-bg)' }}>
                                            <strong style={{ display: 'block', color: 'var(--text)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{foundJournal.journal}</strong>
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', fontFamily: 'var(--font-mono)' }}>
                                                ISSN: {foundJournal.issn || '-'} | E-ISSN: {foundJournal.eissn || foundJournal.e_issn || '-'}
                                            </span>
                                        </div>
                                        <button onClick={close} style={{
                                            background: 'transparent', border: '1.5px solid var(--pastel-red-text)', color: 'var(--pastel-red-text)',
                                            padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer',
                                            fontSize: '0.85rem', marginTop: '1rem', width: '100%'
                                        }}>
                                            Cerrar Alerta
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </Modal>
    );
}
