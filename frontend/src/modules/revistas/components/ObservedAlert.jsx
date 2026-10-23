import { ShieldWarning, ArrowUpRight } from '@phosphor-icons/react';
import IssnTags from './IssnTags';

const MAX_LISTED = 3;

// Shown above the results when the search matches journals from the observed registry.
export default function ObservedAlert({ journals, onShowRegistry }) {
    const isSingle = journals.length === 1;

    return (
        <div className="observed-alert" role="alert">
            <div className="observed-alert__icon">
                <ShieldWarning size={20} weight="fill" />
            </div>

            <div className="observed-alert__content">
                <p className="observed-alert__title">
                    {isSingle
                        ? 'Esta revista está observada por el IDIC'
                        : `${journals.length} revistas observadas coinciden con tu búsqueda`}
                </p>
                <p className="observed-alert__text">
                    {isSingle ? 'Figura' : 'Figuran'} en el registro de revistas con indicios de malas prácticas editoriales. Su uso <strong>no está admitido</strong> para publicaciones institucionales.
                </p>

                <ul className="observed-alert__list">
                    {journals.slice(0, MAX_LISTED).map(journal => (
                        <li key={journal.journal} className="observed-alert__item">
                            <span className="observed-alert__journal">{journal.journal}</span>
                            <IssnTags journal={journal} />
                            {journal.enlace_informe && (
                                <a
                                    href={journal.enlace_informe}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="card-link"
                                >
                                    Ver informe
                                    <ArrowUpRight size={14} />
                                </a>
                            )}
                        </li>
                    ))}
                </ul>

                <button type="button" className="observed-alert__more" onClick={onShowRegistry}>
                    {journals.length > MAX_LISTED
                        ? `Ver las ${journals.length} en el registro de revistas observadas`
                        : 'Ver registro de revistas observadas'}
                </button>
            </div>
        </div>
    );
}
