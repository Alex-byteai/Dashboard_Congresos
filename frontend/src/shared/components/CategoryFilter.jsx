import { Rows, X } from '@phosphor-icons/react';
import { CATEGORIES, CAREERS } from '../taxonomy';

// Quick category chips plus the contextual career chips below them.
// State and handlers come from useCatalogFilters.
export default function CategoryFilter({
    categorias,
    selectedCareers,
    onSelectCategory,
    onToggleCareer,
    allLabel = 'Todos'
}) {
    const activeCategory = categorias.length === 1 ? categorias[0] : null;
    const careers = activeCategory
        ? CAREERS.filter(c => c.categoria === activeCategory)
        : CAREERS;
    const chips = [
        { id: null, label: allLabel, icon: Rows },
        ...CATEGORIES.map(c => ({ ...c, label: c.id }))
    ];

    return (
        <>
            <div className="category-chips-row">
                {chips.map(({ id, label, icon: Icon }) => {
                    const isActive = id ? categorias.includes(id) : categorias.length === 0;
                    const isFaded = id && categorias.length > 0 && !isActive;
                    return (
                        <button
                            key={label}
                            type="button"
                            className={`category-chip-card ${isActive ? 'category-chip-card--active' : ''} ${isFaded ? 'category-chip-card--faded' : ''}`}
                            onClick={() => onSelectCategory(id)}
                            title={id ? `Filtrar por ${label}` : 'Mostrar todas las categorías'}
                        >
                            <Icon size={20} className="category-chip-card__icon" />
                            <span>{label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="career-subbar">
                <div className="career-subbar__header">
                    <span className="career-subbar__label">
                        {activeCategory ? 'Carreras vinculadas:' : 'Filtrar por carrera:'}
                    </span>

                    {selectedCareers.length > 0 && (
                        <button type="button" className="career-subbar__clear" onClick={() => onSelectCategory(null)}>
                            <X size={12} />
                            Limpiar carreras ({selectedCareers.length})
                        </button>
                    )}
                </div>

                <div className="career-subbar__chips">
                    {careers.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            type="button"
                            className={`career-subchip ${selectedCareers.includes(id) ? 'career-subchip--active' : ''}`}
                            onClick={() => onToggleCareer(id)}
                        >
                            <Icon size={14} className="career-subchip__icon" />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
