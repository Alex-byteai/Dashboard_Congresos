import { Rows, X } from '@phosphor-icons/react';
import { LINES, CAREERS, careersForLine } from '../taxonomy';

// Priority-line chips (short label; official name as tooltip) plus the career
// chips below them. State and handlers come from useCatalogFilters.
export default function LineFilter({
    lineas,
    selectedCareers,
    onSelectLine,
    onToggleCareer,
    allLabel = 'Todos'
}) {
    const activeLine = lineas.length === 1 ? lineas[0] : null;
    const careers = activeLine ? careersForLine(activeLine) : CAREERS;
    const chips = [{ id: null, label: allLabel, icon: Rows }, ...LINES];

    return (
        <>
            <div className="category-chips-row">
                {chips.map(({ id, label, icon: Icon }) => {
                    const isActive = id ? lineas.includes(id) : lineas.length === 0;
                    const isFaded = id && lineas.length > 0 && !isActive;
                    return (
                        <button
                            key={label}
                            type="button"
                            className={`category-chip-card ${isActive ? 'category-chip-card--active' : ''} ${isFaded ? 'category-chip-card--faded' : ''}`}
                            onClick={() => onSelectLine(id)}
                            title={id || 'Mostrar todas las líneas de investigación'}
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
                        {activeLine ? 'Carreras vinculadas:' : 'Filtrar por carrera:'}
                    </span>

                    {selectedCareers.length > 0 && (
                        <button type="button" className="career-subbar__clear" onClick={() => onSelectLine(null)}>
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
