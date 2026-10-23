import {
    MapPin,
    ArrowUpRight,
    ArrowSquareOut,
    CheckCircle,
    WarningCircle,
    FileMagnifyingGlass,
    Database,
    Buildings,
    GraduationCap,
    BookOpen,
    Scales,
    ClipboardText,
    Info
} from '@phosphor-icons/react';
import { PROTOCOLO_PDF_URL } from '../../../shared/constants';
import { VERDICTS } from '../verdicts';
import { formatLocation, toExternalUrl } from '../utils';

const hasText = (value) => Boolean(value && value.trim() && value !== '-');

const CriteriaCard = ({ icon: Icon, title, value, fallback = 'No registrado', isFullWidth = false, isTemas = false }) => {
    const hasValue = hasText(value);
    const isNoPrecisa = hasValue && value.toLowerCase().includes('no precisa');

    // Multi-line programmes are shown as a list
    const temasLines = isTemas && hasValue && value.includes('\n')
        ? value.split('\n').map(l => l.replace(/^Temario:\s*/i, '').trim()).filter(Boolean)
        : [];

    return (
        <div className={`integrity-card ${isFullWidth ? 'integrity-card--full' : ''}`}>
            <div className="integrity-card__header">
                <div className="integrity-card__title-wrap">
                    <div className="integrity-card__icon">
                        <Icon size={16} />
                    </div>
                    <h4 className="integrity-card__title">{title}</h4>
                </div>

                {isNoPrecisa && (
                    <span className="integrity-card__warning-pill">
                        <WarningCircle size={12} weight="fill" />
                        <span>No precisa</span>
                    </span>
                )}
            </div>

            <div className="integrity-card__body">
                {!hasValue ? (
                    <span className="integrity-card__fallback">{fallback}</span>
                ) : temasLines.length > 0 ? (
                    <>
                        <strong className="integrity-card__temas-label">Áreas y Temario Registrado:</strong>
                        <ul className="integrity-card__temas-list">
                            {temasLines.map((line, idx) => (
                                <li key={idx}>{line}</li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p>{value}</p>
                )}
            </div>
        </div>
    );
};

export default function CongressIntegrityDetail({ event }) {
    const integridad = event.integridad || {};
    const { verdict } = event;
    const { icon: VerdictIcon, title: verdictTitle, badge: verdictBadge } = VERDICTS[verdict];

    const revText = (integridad.revision_pares || '').toLowerCase();
    const hasPeerReview = revText.includes('revisión') && !revText.includes('no precisa');

    const websiteUrl = toExternalUrl(event.enlace);

    return (
        <>
            <div className="integrity-modal__body">
                {/* Event metadata */}
                <div className="integrity-meta-bar">
                    <span className="card-event__cat-tag" title="Ubicación del evento">
                        <MapPin size={12} />
                        <span>{formatLocation(event)}</span>
                    </span>

                    {event.modalidad && (
                        <span className="badge badge--modality">{event.modalidad}</span>
                    )}

                    {event.publicacion && (
                        <span className="card-event__tech-tag" title="Indexación de publicación">
                            <b>PUBLICACIÓN</b> {event.publicacion}
                        </span>
                    )}

                    {hasPeerReview ? (
                        <span className="badge badge--apc-free" title="Revisión por pares declarada">
                            <CheckCircle size={12} />
                            <span>Revisión por Pares</span>
                        </span>
                    ) : (
                        <span className="badge badge--apc-optional" title="Sin precisión de revisión por pares">
                            <WarningCircle size={12} />
                            <span>Revisión No Precisada</span>
                        </span>
                    )}

                    {websiteUrl && (
                        <a
                            href={websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card-link"
                            title="Ir a la web oficial del evento"
                        >
                            Sitio web
                            <ArrowUpRight size={14} />
                        </a>
                    )}
                </div>

                {/* Verdict Banner */}
                <div className={`integrity-verdict integrity-verdict--${verdict}`}>
                    <div className="integrity-verdict__icon-box">
                        <VerdictIcon size={22} weight={verdict === 'neutral' ? 'bold' : 'fill'} />
                    </div>
                    <div className="integrity-verdict__content">
                        <div className="integrity-verdict__title-row">
                            <h3 className="integrity-verdict__title">{verdictTitle}</h3>
                            <span className="integrity-verdict__badge">{verdictBadge}</span>
                        </div>
                        <p className="integrity-verdict__text">
                            {integridad.conclusiones || 'La evaluación no especifica un veredicto explícito en la ficha actual.'}
                        </p>
                    </div>
                </div>

                {/* Criteria Grid */}
                <div className="integrity-grid">
                    <CriteriaCard
                        icon={FileMagnifyingGlass}
                        title="Revisión por Pares"
                        value={integridad.revision_pares}
                        fallback="Sin detalle en la convocatoria"
                    />
                    <CriteriaCard
                        icon={Database}
                        title="Indexación en Bases de Datos"
                        value={integridad.indexacion_bd}
                    />
                    <CriteriaCard
                        icon={Buildings}
                        title="Entidades Organizadoras"
                        value={integridad.organizadores}
                        fallback="No registradas en la ficha"
                    />
                    <CriteriaCard
                        icon={GraduationCap}
                        title="Comité Científico"
                        value={integridad.comite_cientifico}
                        fallback="Sin información explícita"
                    />
                    <CriteriaCard
                        icon={BookOpen}
                        title="Programa y Temario"
                        value={integridad.programa_temas}
                        fallback="Programa pendiente de publicación"
                        isTemas
                    />
                    <CriteriaCard
                        icon={Scales}
                        title="Conflicto de Intereses"
                        value={integridad.conflicto_intereses}
                        fallback="No precisa declaración"
                    />
                    {hasText(integridad.observaciones) && (
                        <CriteriaCard
                            icon={ClipboardText}
                            title="Observaciones Adicionales"
                            value={integridad.observaciones}
                            isFullWidth
                        />
                    )}
                </div>
            </div>

            {/* Institutional Protocol Footer */}
            <div className="integrity-footer">
                <div className="integrity-footer__text">
                    <Info size={16} className="integrity-footer__icon" />
                    <span>Evaluación efectuada bajo los lineamientos del Protocolo de Idoneidad para Publicaciones del IDIC.</span>
                </div>
                <a
                    href={PROTOCOLO_PDF_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="integrity-footer__link"
                    title="Ver documento oficial del Protocolo IDIC"
                >
                    <span>Ver Protocolo IDIC (PDF)</span>
                    <ArrowSquareOut size={14} />
                </a>
            </div>
        </>
    );
}
