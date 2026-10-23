import { useState, useEffect } from 'react';
import {
    MagnifyingGlass,
    CheckCircle,
    FileMagnifyingGlass,
    ShieldWarning,
    ArrowSquareOut,
    Barcode,
    X,
    Buildings
} from '@phosphor-icons/react';
import Modal from '../../../shared/components/Modal';
import { REVIEW_FORM_URL } from '../../../shared/constants';
import IssnTags from './IssnTags';
import { getApcBadgeClass, matchesIssn, normalizeIssn } from '../utils';

const MIN_ISSN_CHARS = 5;

export default function ReviewRequestModal({
    isOpen,
    onClose,
    revistas = [],
    revistasObservadas = [],
    onViewJournal
}) {
    const [issn, setIssn] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle' | 'invalid' | 'found' | 'bad_practice' | 'not_found'
    const [foundJournal, setFoundJournal] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setIssn('');
            setStatus('idle');
            setFoundJournal(null);
        }
    }, [isOpen]);

    const handleCheck = (e) => {
        e.preventDefault();
        if (normalizeIssn(issn).length < MIN_ISSN_CHARS) {
            setStatus('invalid');
            return;
        }

        // Observed journals take precedence over the approved catalog
        const matchBad = revistasObservadas.find(rev => matchesIssn(rev, issn));
        const matchGood = !matchBad && revistas.find(rev => matchesIssn(rev, issn));
        setFoundJournal(matchBad || matchGood || null);
        setStatus(matchBad ? 'bad_practice' : matchGood ? 'found' : 'not_found');
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            icon={FileMagnifyingGlass}
            title="Consulta de ISSN"
            subtitle="Verifica la idoneidad de una revista o solicita su evaluación al equipo IDIC."
            maxWidth="620px"
        >
            {(close) => (
                <div className="review-modal__body">
                    <p className="review-modal__prompt">
                        Ingresa el código ISSN (impreso u online) para consultar si la revista ya fue evaluada institucionalmente.
                    </p>

                    <form onSubmit={handleCheck} className="review-modal__form">
                        <div className="review-modal__input-row">
                            <div className="review-modal__input-wrap">
                                <Barcode size={18} className="review-modal__input-icon" />
                                <input
                                    type="text"
                                    required
                                    value={issn}
                                    onChange={e => {
                                        setIssn(e.target.value);
                                        setStatus('idle');
                                    }}
                                    placeholder="ISSN o E-ISSN (ej. 2045-2322)"
                                    className="review-modal__input"
                                    autoFocus
                                />
                                {issn && (
                                    <button
                                        type="button"
                                        className="modal-search-bar__clear"
                                        onClick={() => {
                                            setIssn('');
                                            setStatus('idle');
                                        }}
                                        title="Limpiar código"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                            <button type="submit" className="review-modal__submit">
                                <MagnifyingGlass size={16} />
                                <span>Consultar</span>
                            </button>
                        </div>
                        {status === 'invalid' ? (
                            <p className="review-modal__hint review-modal__hint--error">
                                Ingresa un ISSN válido (mínimo {MIN_ISSN_CHARS} caracteres).
                            </p>
                        ) : (
                            <p className="review-modal__hint">
                                El ISSN consta habitualmente de 8 caracteres alfanuméricos divididos por un guion.
                            </p>
                        )}
                    </form>

                    {status === 'found' && (
                        <div className="review-result-card review-result-card--found">
                            <div className="review-result-card__header">
                                <div className="review-result-card__icon-box">
                                    <CheckCircle size={22} weight="fill" />
                                </div>
                                <div>
                                    <h4 className="review-result-card__badge-title">Revista Evaluada e Idónea</h4>
                                    <p className="review-result-card__badge-sub">Este título forma parte del catálogo verificado IDIC</p>
                                </div>
                            </div>

                            <div className="review-result-card__content">
                                <h3 className="review-result-card__journal-title">{foundJournal.journal}</h3>
                                <div className="review-result-card__meta-tags">
                                    {foundJournal.publisher && (
                                        <span className="card-event__cat-tag" title="Editorial">
                                            <Buildings size={12} />
                                            <span>{foundJournal.publisher}</span>
                                        </span>
                                    )}
                                    {foundJournal.tipo_apc && (
                                        <span className={`badge ${getApcBadgeClass(foundJournal.tipo_apc)}`}>
                                            {foundJournal.tipo_apc}
                                        </span>
                                    )}
                                    <IssnTags journal={foundJournal} />
                                </div>
                                <p className="review-result-card__desc">
                                    La revista cumple con los criterios de idoneidad institucional. Puedes explorar sus líneas de investigación, cuartiles y detalles en el catálogo.
                                </p>
                            </div>

                            <div className="review-result-card__actions">
                                <button
                                    type="button"
                                    className="review-result-card__btn-primary"
                                    onClick={() => {
                                        onViewJournal(foundJournal);
                                        close();
                                    }}
                                >
                                    <span>Ver en el Catálogo</span>
                                    <ArrowSquareOut size={15} />
                                </button>
                                <button
                                    type="button"
                                    className="review-result-card__btn-secondary"
                                    onClick={close}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}

                    {status === 'bad_practice' && (
                        <div className="review-result-card review-result-card--bad">
                            <div className="review-result-card__header">
                                <div className="review-result-card__icon-box">
                                    <ShieldWarning size={22} weight="fill" />
                                </div>
                                <div>
                                    <h4 className="review-result-card__badge-title">Alerta de Integridad Editorial</h4>
                                    <p className="review-result-card__badge-sub">Revista incluida en el registro de medios observados</p>
                                </div>
                            </div>

                            <div className="review-result-card__content">
                                <h3 className="review-result-card__journal-title">{foundJournal.journal}</h3>
                                <div className="review-result-card__meta-tags">
                                    <IssnTags journal={foundJournal} />
                                </div>
                                <p className="review-result-card__desc">
                                    Esta revista presenta indicios de malas prácticas o métricas descalificadas bajo los criterios del IDIC. Su uso <strong>no está admitido</strong> como medio de publicación institucional.
                                </p>
                            </div>

                            <div className="review-result-card__actions">
                                {foundJournal.enlace_informe && (
                                    <a
                                        href={foundJournal.enlace_informe}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="review-result-card__btn-primary"
                                    >
                                        <span>Ver Informe de Idoneidad</span>
                                        <ArrowSquareOut size={15} />
                                    </a>
                                )}
                                <button
                                    type="button"
                                    className="review-result-card__btn-secondary"
                                    onClick={close}
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    )}

                    {status === 'not_found' && (
                        <div className="review-result-card review-result-card--not-found">
                            <div className="review-result-card__header">
                                <div className="review-result-card__icon-box">
                                    <FileMagnifyingGlass size={22} />
                                </div>
                                <div>
                                    <h4 className="review-result-card__badge-title">Revista No Registrada</h4>
                                    <p className="review-result-card__badge-sub">El código consultado no figura en las bases institucionales</p>
                                </div>
                            </div>

                            <div className="review-result-card__content">
                                <p className="review-result-card__desc">
                                    No se encontraron antecedentes de evaluación para el ISSN <strong>{issn}</strong>. Si tienes previsto postular un manuscrito a este medio, puedes solicitar su evaluación formal de idoneidad ante la Dirección de Investigación (IDIC).
                                </p>
                            </div>

                            <div className="review-result-card__actions">
                                <a
                                    href={REVIEW_FORM_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="review-result-card__btn-primary review-result-card__btn-accent"
                                    onClick={close}
                                >
                                    <span>Completar Solicitud de Evaluación</span>
                                    <ArrowSquareOut size={16} />
                                </a>
                                <button
                                    type="button"
                                    className="review-result-card__btn-secondary"
                                    onClick={close}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}
