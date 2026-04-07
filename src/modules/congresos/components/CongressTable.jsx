import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck, SearchX, Info, Users, GraduationCap, BookOpen, Scale, ClipboardList, FileSearch, Database, CheckCircle, AlertTriangle, XCircle, ShieldAlert } from 'lucide-react';

const Tooltip = ({ content, children }) => {
    const [show, setShow] = useState(false);
    return (
        <div
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'help' }}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            onClick={(e) => { e.stopPropagation(); setShow(!show); }}
        >
            {children}
            {show && (
                <div style={{
                    position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-4px)',
                    padding: '0.6rem 0.8rem', background: '#1e293b',
                    color: 'white', fontSize: '0.75rem', borderRadius: '6px', whiteSpace: 'normal',
                    width: 'max-content', maxWidth: '250px', zIndex: 100, boxShadow: 'var(--shadow-md)',
                    textAlign: 'center', lineHeight: '1.4', pointerEvents: 'none'
                }}>
                    {content}
                    <div style={{
                        position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                        borderWidth: '5px', borderStyle: 'solid', borderColor: '#1e293b transparent transparent transparent'
                    }} />
                </div>
            )}
        </div>
    );
};

const getStatus = (text) => {
    if (!text) return 'error';
    const t = text.toLowerCase();
    if (t.includes('no se registra') || t.includes('no especificado') || t.includes('no especifica') || t === 'n/a' || t === '-') return 'error';
    if (t.includes('doble ciego') || t.includes('aplica') || t.includes('scopus') || t.includes('ieee') || t.includes('wos') || t.includes('scielo') || t.includes('sí')) return 'success';
    return 'warning';
};

const getVerdictStatus = (text) => {
    if (!text) return 'neutral';
    const t = text.toLowerCase();
    if (t.includes('riesgo') || t.includes('no confiable') || t.includes('cuestionable') || t.includes('cautela') || t.includes('falta de transparencia')) return 'danger';
    if (t.includes('confiable')) return 'good';
    return 'neutral';
};

const Badge = ({ status, label }) => {
    let bg, color, Icon;
    if (status === 'success') {
        bg = '#ecfdf5'; color = '#059669'; Icon = CheckCircle;
    } else if (status === 'warning') {
        bg = '#fefce8'; color = '#ca8a04'; Icon = AlertTriangle;
    } else {
        bg = '#f1f5f9'; color = '#64748b'; Icon = XCircle;
    }

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: bg, color: color, padding: '0.25rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600, border: `1px solid ${bg}` }}>
            <Icon size={12} />
            {label}
        </div>
    );
};

export default function CongressTable({ events }) {
    const [expandedRow, setExpandedRow] = useState(null);

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    if (events.length === 0) {
        return (
            <div className="empty-state">
                <SearchX size={64} className="empty-icon" />
                <h3>No se encontraron eventos</h3>
                <p>Intenta ajustar los filtros</p>
            </div>
        );
    }

    return (
        <div className="table-card" style={{ marginTop: '2rem', overflow: 'visible' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={22} style={{ color: 'var(--primary)' }} />
                    Evaluación de Integridad Científica
                </h3>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Visualiza el nivel de confianza, rigurosidad y validación de cada congreso.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {events.map(event => {
                    const isExpanded = expandedRow === event.id;
                    const integridad = event.integridad || {};

                    const revStatus = getStatus(integridad.revision_pares);
                    const indStatus = getStatus(integridad.indexacion_bd);
                    const verdictColor = getVerdictStatus(integridad.conclusiones);

                    let verdictBorder = 'var(--border)';
                    let verdictBg = 'white';
                    if (verdictColor === 'good') { verdictBorder = '#10b981'; verdictBg = '#f0fdf4'; }
                    else if (verdictColor === 'danger') { verdictBorder = '#ef4444'; verdictBg = '#fef2f2'; }

                    return (
                        <div key={event.id} style={{ borderBottom: isExpanded ? '3px solid #cbd5e1' : '1px solid var(--border)', background: isExpanded ? '#fafaf9' : 'white', borderRadius: isExpanded ? '4px' : '0', transition: 'all 0.2s', margin: isExpanded ? '0.5rem 0' : '0' }}>
                            {/* Accordion Header */}
                            <div
                                onClick={() => toggleRow(event.id)}
                                style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '1rem', flexWrap: 'wrap' }}
                            >
                                <div style={{ flex: '1 1 250px' }}>
                                    <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--primary)', fontWeight: '600', fontSize: '1rem' }}>{event.evento || 'Sin Acrónimo'}</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{event.nombreCompleto}</p>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Badge status={revStatus} label="Revisión por Pares" />
                                        <Badge status={indStatus} label="Indexación" />
                                    </div>
                                    <div style={{ background: isExpanded ? 'var(--primary)' : '#f1f5f9', color: isExpanded ? 'white' : 'var(--text-main)', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>
                            </div>

                            {/* Accordion Body */}
                            {isExpanded && (
                                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>

                                    {/* Verdict Top Bar */}
                                    <div style={{ background: verdictBg, padding: '1.25rem', borderRadius: 'var(--radius-md)', border: `1px solid ${verdictBorder}`, borderLeft: `4px solid ${verdictBorder}`, boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem' }}>
                                        <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {verdictColor === 'danger' ? <ShieldAlert size={18} color="#ef4444" /> : <ShieldCheck size={18} color={verdictColor === 'good' ? '#10b981' : 'var(--primary)'} />}
                                            Dictamen General de Integridad
                                        </h5>
                                        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text)', lineHeight: '1.5' }}>
                                            {integridad.conclusiones || 'La evaluación no especifica un veredicto explícito todavía.'}
                                        </p>
                                    </div>

                                    {/* Criteria Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>

                                        {/* Revisión por Pares */}
                                        <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <FileSearch size={16} style={{ color: 'var(--text-muted)' }} />
                                                <h6 style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.85rem' }}>Revisión por Pares</h6>
                                                <Tooltip content="Proceso crítico donde expertos evalúan de forma anónima la calidad científica de los artículos antes de aceptarlos.">
                                                    <Info size={14} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                                                </Tooltip>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                                                {integridad.revision_pares || 'No registrado'}
                                            </div>
                                        </div>

                                        {/* Indexación */}
                                        <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <Database size={16} style={{ color: 'var(--text-muted)' }} />
                                                <h6 style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.85rem' }}>Indexación en BD</h6>
                                                <Tooltip content="Mide si el congreso cuenta con el respaldo de estar listado en bases de datos formales de alto impacto (Scopus, WoS, IEEE).">
                                                    <Info size={14} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                                                </Tooltip>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                                                {integridad.indexacion_bd || 'No registrado'}
                                            </div>
                                        </div>

                                        {/* Organizadores */}
                                        <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <Users size={16} style={{ color: 'var(--text-muted)' }} />
                                                <h6 style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.85rem' }}>Organizadores</h6>
                                                <Tooltip content="Identifica a las instituciones u organizaciones que están detrás de la creación y financiación del congreso, validando su trayectoria institucional.">
                                                    <Info size={14} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                                                </Tooltip>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                                                {integridad.organizadores || 'No registrado'}
                                            </div>
                                        </div>

                                        {/* Comité Científico */}
                                        <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <GraduationCap size={16} style={{ color: 'var(--text-muted)' }} />
                                                <h6 style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.85rem' }}>Comité Científico</h6>
                                                <Tooltip content="Revisa la conformación del comité de expertos que guía académicamente el congreso. Su prestigio impacta el rigor del evento.">
                                                    <Info size={14} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                                                </Tooltip>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                                                {integridad.comite_cientifico || 'No registrado'}
                                            </div>
                                        </div>

                                        {/* Programa */}
                                        <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <BookOpen size={16} style={{ color: 'var(--text-muted)' }} />
                                                <h6 style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.85rem' }}>Programa y Temas</h6>
                                                <Tooltip content="Analiza la agenda del congreso para buscar consistencia. Los congresos predatorios a menudo mezclan temas inconexos.">
                                                    <Info size={14} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                                                </Tooltip>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                                                {integridad.programa_temas || 'No registrado'}
                                            </div>
                                        </div>

                                        {/* Conflicto de Intereses */}
                                        <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <Scale size={16} style={{ color: 'var(--text-muted)' }} />
                                                <h6 style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.85rem' }}>Conflicto de Intereses</h6>
                                                <Tooltip content="Verifica si los organizadores toman medidas activas para asegurar que el contenido no esté influenciado por intereses personales o monetarios.">
                                                    <Info size={14} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                                                </Tooltip>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                                                {integridad.conflicto_intereses || 'No registrado'}
                                            </div>
                                        </div>

                                        {/* Observaciones */}
                                        <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                <ClipboardList size={16} style={{ color: 'var(--text-muted)' }} />
                                                <h6 style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.85rem' }}>Observaciones Generales</h6>
                                                <Tooltip content="Anotaciones extra sobre la evaluación, detalles anómalos, o apuntes que no encajan en otras secciones.">
                                                    <Info size={14} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
                                                </Tooltip>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                                                {integridad.observaciones || 'No hay observaciones especiales.'}
                                            </div>
                                        </div>

                                    </div>

                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="table-footer" style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid var(--border)', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Mostrando {events.length} resultados metodológicos
            </div>
        </div>
    );
}
