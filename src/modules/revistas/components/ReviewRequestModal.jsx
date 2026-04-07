import React, { useState } from 'react';
import { X, Send, FilePlus } from 'lucide-react';

export default function ReviewRequestModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        journalName: '',
        issn: '',
        reason: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const subject = `Solicitud de Revisión de Integridad: ${formData.journalName}`;
        const body = `Nombre de la Revista: ${formData.journalName}%0D%0AISSN/E-ISSN: ${formData.issn}%0D%0A%0D%0AMotivo de la solicitud:%0D%0A${formData.reason}`;

        window.location.href = `mailto:iqintegridadidic@ulima.edu.pe?subject=${subject}&body=${body}`;
        onClose();
        // Reset form
        setFormData({ journalName: '', issn: '', reason: '' });
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            backdropFilter: 'blur(2px)'
        }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)',
                padding: '2rem', width: '90%', maxWidth: '500px',
                boxShadow: 'var(--shadow-xl)', position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)'
                    }}
                >
                    <X size={24} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.75rem', background: '#fff7ed', borderRadius: '50%', color: 'var(--primary)' }}>
                        <FilePlus size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>¿No encuentras tu revista?</h2>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Solicita la revisión de integridad de una nueva revista.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text)' }}>
                            Nombre de la Revista <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.journalName}
                            onChange={e => setFormData({ ...formData, journalName: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', fontSize: '0.875rem', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }}
                            placeholder="Ej. Journal of Advanced Research"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text)' }}>
                            ISSN / E-ISSN (Obligatorio) <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.issn}
                            onChange={e => setFormData({ ...formData, issn: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', fontSize: '0.875rem', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }}
                            placeholder="Ej. 1234-5678"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text)' }}>
                            Justificación o Motivo <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={formData.reason}
                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', fontSize: '0.875rem', fontFamily: 'var(--font-body)', resize: 'vertical', boxSizing: 'border-box' }}
                            placeholder="Explica brevemente por qué sugieres una revisión de integridad para esta revista..."
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', fontWeight: 600, color: 'var(--text)', cursor: 'pointer' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            style={{ flex: 1, padding: '0.75rem', background: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            <Send size={18} />
                            Enviar Solicitud
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
