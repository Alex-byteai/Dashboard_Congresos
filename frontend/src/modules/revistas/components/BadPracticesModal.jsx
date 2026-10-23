import { useState, useMemo } from 'react';
import {
    ShieldWarning,
    MagnifyingGlass,
    X,
    FileText,
    ArrowUpRight,
    Info
} from '@phosphor-icons/react';
import Modal from '../../../shared/components/Modal';
import IssnTags from './IssnTags';
import { matchesIssn } from '../utils';

export default function BadPracticesModal({ isOpen, onClose, revistasMalas = [] }) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return revistasMalas;
        return revistasMalas.filter(r => r.journal?.toLowerCase().includes(q) || matchesIssn(r, q));
    }, [revistasMalas, search]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            icon={ShieldWarning}
            iconVariant="danger"
            title="Revistas Observadas"
            subtitle="Registro institucional de medios descalificados por indicios de malas prácticas editoriales."
            badge={`${revistasMalas.length} títulos`}
            badgeVariant="danger"
            maxWidth="760px"
        >
            <div className="modal-search-bar">
                <div className="modal-search-bar__wrap">
                    <MagnifyingGlass size={16} className="modal-search-bar__icon" />
                    <input
                        type="text"
                        className="modal-search-bar__input"
                        placeholder="Buscar por título de revista, ISSN o E-ISSN..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            type="button"
                            className="modal-search-bar__clear"
                            onClick={() => setSearch('')}
                            title="Limpiar búsqueda"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
                <span className="modal-search-bar__count">
                    {filtered.length} de {revistasMalas.length}
                </span>
            </div>

            <div className="modal-body">
                {filtered.length === 0 ? (
                    <p className="obs-list__empty">
                        {search
                            ? `No se encontraron revistas observadas con "${search}"`
                            : 'No hay revistas observadas registradas.'}
                    </p>
                ) : (
                    <div className="obs-list">
                        {filtered.map(rev => (
                            <article key={rev.journal} className="obs-card">
                                <div className="obs-card__main">
                                    <h3 className="obs-card__title">{rev.journal}</h3>
                                    <div className="obs-card__meta">
                                        <IssnTags journal={rev} />
                                    </div>
                                </div>

                                {rev.enlace_informe ? (
                                    <a
                                        href={rev.enlace_informe}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="obs-card__btn"
                                        title={`Ver informe de idoneidad para ${rev.journal}`}
                                    >
                                        <FileText size={15} />
                                        <span>Ver Informe</span>
                                        <ArrowUpRight size={13} />
                                    </a>
                                ) : (
                                    <span className="obs-card__pending">Informe en trámite</span>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>

            <div className="modal-disclaimer">
                <Info size={18} className="modal-disclaimer__icon" />
                <div>
                    La información listada tiene carácter referencial institucional. Estos medios editoriales fueron calificados con indicios de malas prácticas según el Protocolo IDIC. Su uso <strong>no está admitido ni recomendado</strong> para publicaciones de la comunidad universitaria.
                </div>
            </div>
        </Modal>
    );
}
