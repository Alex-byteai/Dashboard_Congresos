import React, { useState } from 'react';
import { Info, Users, GraduationCap, BookOpen, Scales as Scale, ClipboardText as ClipboardList, FileMagnifyingGlass as FileSearch, Database, CheckCircle, Warning as AlertTriangle, XCircle, ShieldCheck, ShieldWarning as ShieldAlert } from '@phosphor-icons/react';

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
                    padding: '0.6rem 0.8rem', background: 'var(--primary)',
                    color: 'white', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)', whiteSpace: 'normal',
                    width: 'max-content', maxWidth: '250px', zIndex: 100, boxShadow: 'var(--shadow-md)',
                    textAlign: 'center', lineHeight: '1.4', pointerEvents: 'none'
                }}>
                    {content}
                    <div style={{
                        position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                        borderWidth: '5px', borderStyle: 'solid', borderColor: 'var(--primary) transparent transparent transparent'
                    }} />
                </div>
            )}
        </div>
    );
};

const getStatus = (text) => {
    if (!text) return 'error';
    const t = text.toLowerCase();

    if (t.includes('no precisa')) return 'warning';

    return 'success';
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
        bg = 'var(--pastel-green-bg)'; color = 'var(--pastel-green-text)'; Icon = CheckCircle;
    } else if (status === 'warning') {
        bg = 'var(--pastel-yellow-bg)'; color = 'var(--pastel-yellow-text)'; Icon = AlertTriangle;
    } else {
        bg = 'var(--card-bg-alt)'; color = 'var(--text-secondary)'; Icon = XCircle;
    }

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: bg, color: color, padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${bg}` }}>
            <Icon size={12} />
            {label}
        </div>
    );
};

const CriteriaCard = ({ icon: Icon, title, tooltip, value, fallback, gridColumn }) => (
    <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', gridColumn }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Icon size={16} style={{ color: 'var(--text-muted)' }} />
            <h6 style={{ margin: 0, color: 'var(--text)', fontSize: '0.85rem' }}>{title}</h6>
            <Tooltip content={tooltip}>
                <Info size={14} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }} />
            </Tooltip>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
            {value || fallback}
        </div>
    </div>
);

// Integrity breakdown for a single congress, rendered inside CongressIntegrityModal.
export default function CongressIntegrityDetail({ event }) {
    const integridad = event.integridad || {};
    const revStatus = getStatus(integridad.revision_pares);
    const indStatus = 'success'; // Todos los congresos en el Hub están indexados corporativamente
    const verdictColor = getVerdictStatus(integridad.conclusiones);

    let verdictBorder = 'var(--border)';
    let verdictBg = 'white';
    if (verdictColor === 'good') { verdictBorder = 'var(--pastel-green-text)'; verdictBg = 'var(--pastel-green-bg)'; }
    else if (verdictColor === 'danger') { verdictBorder = 'var(--pastel-red-text)'; verdictBg = 'var(--pastel-red-bg)'; }

    return (
        <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <Badge status={revStatus} label="Revisión por Pares" />
                <Badge status={indStatus} label="Indexación" />
            </div>

            {/* Verdict Top Bar */}
            <div style={{ background: verdictBg, padding: '1.25rem', borderRadius: 'var(--radius-md)', border: `1px solid ${verdictBorder}`, borderLeft: `4px solid ${verdictBorder}`, boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem' }}>
                <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--text)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {verdictColor === 'danger' ? <ShieldAlert size={18} color="var(--pastel-red-text)" /> : <ShieldCheck size={18} color={verdictColor === 'good' ? 'var(--pastel-green-text)' : 'var(--primary)'} />}
                    Dictamen General de Integridad
                </h5>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text)', lineHeight: '1.5' }}>
                    {integridad.conclusiones || 'La evaluación no especifica un veredicto explícito todavía.'}
                </p>
            </div>

            {/* Criteria Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <CriteriaCard icon={FileSearch} title="Revisión por Pares" value={integridad.revision_pares} fallback="No registrado"
                    tooltip="Proceso crítico donde expertos evalúan de forma anónima la calidad científica de los artículos antes de aceptarlos." />
                <CriteriaCard icon={Database} title="Indexación en BD" value={integridad.indexacion_bd} fallback="No registrado"
                    tooltip="Mide si el congreso cuenta con el respaldo de estar listado en bases de datos formales de alto impacto (Scopus, WoS, IEEE)." />
                <CriteriaCard icon={Users} title="Organizadores" value={integridad.organizadores} fallback="No registrado"
                    tooltip="Identifica a las instituciones u organizaciones que están detrás de la creación y financiación del congreso, validando su trayectoria institucional." />
                <CriteriaCard icon={GraduationCap} title="Comité Científico" value={integridad.comite_cientifico} fallback="No registrado"
                    tooltip="Revisa la conformación del comité de expertos que guía académicamente el congreso. Su prestigio impacta el rigor del evento." />
                <CriteriaCard icon={BookOpen} title="Programa y Temas" value={integridad.programa_temas} fallback="No registrado"
                    tooltip="Analiza la agenda del congreso para buscar consistencia. Los congresos predatorios a menudo mezclan temas inconexos." />
                <CriteriaCard icon={Scale} title="Conflicto de Intereses" value={integridad.conflicto_intereses} fallback="No registrado"
                    tooltip="Verifica si los organizadores toman medidas activas para asegurar que el contenido no esté influenciado por intereses personales o monetarios." />
                <CriteriaCard icon={ClipboardList} title="Observaciones Generales" value={integridad.observaciones} fallback="No hay observaciones especiales."
                    tooltip="Anotaciones extra sobre la evaluación, detalles anómalos, o apuntes que no encajan en otras secciones." gridColumn="1 / -1" />
            </div>
        </div>
    );
}
