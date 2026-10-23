import { useState } from 'react';
import {
    ArrowUpRight, Stack, Layout, CaretDown, CaretUp, ShieldCheck, FilePlus, Buildings
} from '@phosphor-icons/react';
import EmptyState from '../../../shared/components/EmptyState';
import IssnTags from './IssnTags';
import { getApcBadgeClass, getWosCollections, isInWos } from '../utils';

function RevistaCard({ r }) {
    const [isOpen, setIsOpen] = useState(false);
    const quartiles = r.categorias_scopus || [];
    const wosCollections = getWosCollections(r);

    return (
        <article data-journal-id={r.id} className="card-event">
            <div className="card-event__header">
                <div className="card-event__tech-group">
                    <IssnTags journal={r} />
                </div>
            </div>

            <div className="card-event__body">
                <h3 className="card-event__title" title={r.journal}>
                    {r.journal}
                </h3>
                {/* Editorial and Enfoque */}
                <div className="card-event__categories">
                    {r.publisher && (
                        <span className="card-event__cat-tag" title={`Editorial: ${r.publisher}`}>
                            <Buildings size={12} />
                            <span>{r.publisher}</span>
                        </span>
                    )}
                    {r.enfoque && (
                        <span className="card-event__cat-tag" title={`Enfoque: ${r.enfoque}`}>
                            <Layout size={12} />
                            <span>{r.enfoque}</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Scopus quartiles; journals outside Scopus (e.g. only in WoS) say so instead */}
            <div className="card-event__quartiles">
                {quartiles.length > 0 ? (
                    <div className="quartiles-box">
                        <button
                            type="button"
                            className="quartiles-box__toggle"
                            onClick={() => setIsOpen(!isOpen)}
                            title="Desplegar cuartiles Scopus por subcategoría"
                        >
                            <span className="quartiles-box__label">
                                <Stack size={14} />
                                <span>Scopus: {quartiles.length} {quartiles.length === 1 ? 'Categoría' : 'Categorías'}</span>
                            </span>
                            {isOpen ? <CaretUp size={13} /> : <CaretDown size={13} />}
                        </button>

                        <div className={`quartiles-box__dropdown ${isOpen ? 'is-open' : ''}`}>
                            <div className="quartiles-box__list">
                                {quartiles.map((cat, idx) => (
                                    <div key={idx} className="quartiles-row">
                                        <span className={`quartile-pill q-${(cat.Cuartil || 'NA').toLowerCase()}`}>
                                            {cat.Cuartil || 'N/A'}
                                        </span>
                                        <span className="quartiles-row__name" title={cat.Subcategoria}>
                                            {cat.Subcategoria}
                                        </span>
                                        {cat.Percentil && (
                                            <span className="quartiles-row__percentile">P{cat.Percentil}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : r.disciplinas?.length > 0 ? (
                    <div className="card-event__disciplines">
                        {r.disciplinas.map(d => (
                            <span key={d} className="badge badge--discipline">{d}</span>
                        ))}
                    </div>
                ) : (
                    <p className="card-event__no-scopus">
                        <Stack size={14} />
                        <span>
                            Sin cuartiles Scopus
                            {isInWos(r) && ` · Web of Science${wosCollections ? ` (${wosCollections})` : ''}`}
                        </span>
                    </p>
                )}
            </div>

            <div className="card-event__badges">
                {r.tipo && (
                    <span className="badge badge--journal-type">{r.tipo}</span>
                )}
                {r.tipo_apc && (
                    <span className={`badge ${getApcBadgeClass(r.tipo_apc)}`}>{r.tipo_apc}</span>
                )}
                {r.citeScore && (
                    <span className="badge badge--citescore" title="Scopus CiteScore">
                        CiteScore {r.citeScore}
                    </span>
                )}
            </div>

            {(r.sitioWeb || r.enlace_informe) && (
                <div className="card-event__footer">
                    {r.enlace_informe && (
                        <a
                            href={r.enlace_informe}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card-action card-action--good"
                            title="Ver informe de integridad de la revista"
                        >
                            <ShieldCheck size={15} weight="fill" />
                            <span>Integridad</span>
                        </a>
                    )}
                    {r.sitioWeb && (
                        <a
                            href={r.sitioWeb}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="card-link"
                        >
                            Sitio web
                            <ArrowUpRight size={14} />
                        </a>
                    )}
                </div>
            )}
        </article>
    );
}

export default function RevistasList({ revistas, onRequestReview }) {
    if (revistas.length === 0) {
        return (
            <EmptyState title="No se encontraron revistas">
                <div className="empty-state__action-box">
                    <FilePlus size={28} className="empty-state__action-icon" />
                    <h4>¿No encuentras la revista que buscas?</h4>
                    <p>Solicita la evaluación de una revista para su revisión por el equipo IDIC.</p>
                    <button
                        type="button"
                        onClick={onRequestReview}
                        className="btn-action btn-action--primary"
                    >
                        Solicitar Inclusión
                    </button>
                </div>
            </EmptyState>
        );
    }

    return (
        <div className="cards-grid">
            {revistas.map(r => <RevistaCard key={r.id} r={r} />)}
        </div>
    );
}
