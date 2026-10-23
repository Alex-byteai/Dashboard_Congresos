import { useState, useEffect } from 'react';
import {
    BookOpen,
    BookBookmark,
    ShieldWarning,
    Barcode,
    FileText,
    ArrowRight,
    ArrowSquareOut,
    Seal
} from '@phosphor-icons/react';
import DashboardLayout from '../../shared/components/DashboardLayout';
import BadPracticesModal from '../../modules/revistas/components/BadPracticesModal';
import ReviewRequestModal from '../../modules/revistas/components/ReviewRequestModal';
import { PROTOCOLO_PDF_URL } from '../../shared/constants';
import { loadCongresos, loadRevistas, loadRevistasObservadas } from '../services/data';

export default function ModuleSelector({ onNavigate }) {
    const [totalCongresos, setTotalCongresos] = useState(null);
    const [revistas, setRevistas] = useState([]);
    const [revistasObservadas, setRevistasObservadas] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const [showBadPractices, setShowBadPractices] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);

    useEffect(() => {
        Promise.all([
            loadCongresos().catch(() => null),
            loadRevistas().catch(() => null),
            loadRevistasObservadas().catch(() => null),
        ]).then(([congData, revData, obsData]) => {
            setTotalCongresos(congData?.congresses?.length ?? null);
            setRevistas(revData?.revistas || []);
            setRevistasObservadas(obsData?.revistas_observadas || []);
            setLoaded(true);
        });
    }, []);

    const kpiValue = (count) => (loaded && count !== null ? count : '—');

    return (
        <DashboardLayout onNavigate={onNavigate}>
            <div className="hub">

                {/* ── Hero Section ── */}
                <header className="hub__hero">
                    <div className="hub__hero-eyebrow">
                        <Seal size={15} weight="fill" />
                        <span>Instituto de Investigación Científica · Universidad de Lima</span>
                    </div>
                    <h1 className="hub__hero-title">
                        Portal de Integridad Científica
                    </h1>
                    <p className="hub__hero-lead">
                        Herramienta institucional para la evaluación y postulación informada de ponencias académicas y publicaciones en revistas indexadas, resguardando la calidad y reputación investigativa.
                    </p>
                </header>

                {/* ── KPI Metrics Strip ── */}
                <section className="hub__kpi-grid">
                    <div className="hub-kpi">
                        <div className="hub-kpi__top">
                            <span className="hub-kpi__value">{kpiValue(totalCongresos)}</span>
                            <div className="hub-kpi__icon-box">
                                <BookOpen size={18} />
                            </div>
                        </div>
                        <h4 className="hub-kpi__title">Congresos Evaluados</h4>
                        <p className="hub-kpi__desc">Eventos académicos.</p>
                    </div>

                    <div className="hub-kpi">
                        <div className="hub-kpi__top">
                            <span className="hub-kpi__value">{kpiValue(revistas.length)}</span>
                            <div className="hub-kpi__icon-box hub-kpi__icon-box--accent">
                                <BookBookmark size={18} />
                            </div>
                        </div>
                        <h4 className="hub-kpi__title">Revistas en Catálogo</h4>
                        <p className="hub-kpi__desc">Revistas catalogadas con cuartiles Scopus, política de APC y líneas de investigación.</p>
                    </div>

                    <div className="hub-kpi">
                        <div className="hub-kpi__top">
                            <span className="hub-kpi__value">{kpiValue(revistasObservadas.length)}</span>
                            <div className="hub-kpi__icon-box hub-kpi__icon-box--danger">
                                <ShieldWarning size={18} />
                            </div>
                        </div>
                        <h4 className="hub-kpi__title">Alertas Editoriales</h4>
                        <p className="hub-kpi__desc">Revistas descalificadas por indicios de prácticas predatorias o falta de rigor.</p>
                    </div>
                </section>

                {/* ── Module Cards ── */}
                <section className="hub__modules-grid">
                    <article
                        className="hub-card"
                        onClick={() => onNavigate('congresos')}
                        title="Explorar el módulo de Congresos Científicos"
                    >
                        <div className="hub-card__top">
                            <div className="hub-card__icon-box">
                                <BookOpen size={26} />
                            </div>
                            <span className="hub-card__badge">Disponible</span>
                        </div>

                        <div className="hub-card__main">
                            <h2 className="hub-card__title">Congresos Científicos</h2>
                            <p className="hub-card__desc">
                                Encuentra congresos científicos evaluados según criterios de integridad y calidad editorial para apoyar una postulación informada.
                            </p>
                            <div className="hub-card__tags">
                                <span className="hub-card__tag">Cronograma de Cierres</span>
                                <span className="hub-card__tag">Filtro por Carrera</span>
                                <span className="hub-card__tag">Revisión por Pares</span>
                                <span className="hub-card__tag">Dictamen Técnico</span>
                            </div>
                        </div>

                        <div className="hub-card__action">
                            <span>Ingresar a Congresos</span>
                            <ArrowRight size={18} />
                        </div>
                    </article>

                    <article
                        className="hub-card"
                        onClick={() => onNavigate('revistas')}
                        title="Explorar el módulo de Revistas Científicas"
                    >
                        <div className="hub-card__top">
                            <div className="hub-card__icon-box">
                                <BookBookmark size={26} />
                            </div>
                            <span className="hub-card__badge">Disponible</span>
                        </div>

                        <div className="hub-card__main">
                            <h2 className="hub-card__title">Revistas Científicas</h2>
                            <p className="hub-card__desc">
                                Consulta informes de integridad y revisa información clave de revistas científicas para la elección del medio de publicación.
                            </p>
                            <div className="hub-card__tags">
                                <span className="hub-card__tag">Políticas APC</span>
                                <span className="hub-card__tag">Cuartiles Scopus (Q1-Q4)</span>
                                <span className="hub-card__tag">Líneas de Investigación</span>
                            </div>
                        </div>

                        <div className="hub-card__action">
                            <span>Ingresar a Revistas</span>
                            <ArrowRight size={18} />
                        </div>
                    </article>
                </section>

                {/* ── Institutional Tools ── */}
                <section className="hub__tools-section">
                    <p className="hub__tools-label">Recursos y Herramientas Institucionales</p>

                    <div className="hub__tools-grid">
                        <a
                            href={PROTOCOLO_PDF_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hub-tool"
                            title="Ver documento oficial del Protocolo IDIC"
                        >
                            <div className="hub-tool__top">
                                <div className="hub-tool__icon">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <h4 className="hub-tool__title">Protocolo IDIC</h4>
                                    <p className="hub-tool__desc">Lineamientos oficiales de idoneidad y criterios éticos para publicaciones (PDF).</p>
                                </div>
                            </div>
                            <div className="hub-tool__action">
                                <span>Consultar Guía</span>
                                <ArrowSquareOut size={14} />
                            </div>
                        </a>

                        <div
                            className="hub-tool"
                            onClick={() => setShowBadPractices(true)}
                            title="Ver registro de revistas observadas"
                        >
                            <div className="hub-tool__top">
                                <div className="hub-tool__icon hub-tool__icon--danger">
                                    <ShieldWarning size={18} />
                                </div>
                                <div>
                                    <h4 className="hub-tool__title">Revistas Observadas</h4>
                                    <p className="hub-tool__desc">Registro de medios descalificados por indicios de prácticas no idóneas.</p>
                                </div>
                            </div>
                            <div className="hub-tool__action hub-tool__action--danger">
                                <span>Revisar Alertas</span>
                                <ArrowRight size={14} />
                            </div>
                        </div>

                        <div
                            className="hub-tool"
                            onClick={() => setShowReviewModal(true)}
                            title="Consultar idoneidad por código ISSN"
                        >
                            <div className="hub-tool__top">
                                <div className="hub-tool__icon">
                                    <Barcode size={18} />
                                </div>
                                <div>
                                    <h4 className="hub-tool__title">Consulta de ISSN</h4>
                                    <p className="hub-tool__desc">Verifica si una revista ya fue evaluada o solicita su dictamen formal al equipo IDIC.</p>
                                </div>
                            </div>
                            <div className="hub-tool__action">
                                <span>Verificar Revista</span>
                                <ArrowRight size={14} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Institutional Disclaimer ── */}
                <div className="hub__notice">
                    <span className="hub__notice-tag">Aviso Institucional</span>
                    <p>
                        La información presentada ha sido elaborada conforme a los protocolos y lineamientos institucionales orientados a resguardar la integridad científica de las publicaciones. Este portal constituye una herramienta de apoyo para la toma de decisiones sobre la elección de revistas y congresos por parte de investigadores con afiliación a la Universidad. Reúne información de medios previamente evaluados y en proceso de actualización continua. Su contenido tiene carácter orientador y no sustituye la evaluación académica ni la responsabilidad del equipo investigador en la selección del medio de publicación.
                    </p>
                </div>

            </div>

            <BadPracticesModal
                isOpen={showBadPractices}
                onClose={() => setShowBadPractices(false)}
                revistasMalas={revistasObservadas}
            />

            <ReviewRequestModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                revistas={revistas}
                revistasObservadas={revistasObservadas}
                onViewJournal={(journal) => onNavigate('revistas', { search: journal.journal })}
            />
        </DashboardLayout>
    );
}
