import {
    ArrowCounterClockwise, CaretDown, Check, FadersHorizontal, X
} from '@phosphor-icons/react';

// Right-panel filter shared by the catalog modules: header with active count and
// reset, module-specific groups (`children`), research-line pills and the list of
// removable applied filters. `applied` holds the module's other active filters
// as { key, label }; `onRemoveApplied(key)` clears one of them.
export default function SidebarFilter({
    filters,
    setFilters,
    lineas = [],
    applied = [],
    onRemoveApplied,
    onCategoryRemove,
    onReset,
    children
}) {
    const toggleLinea = (linea) => setFilters(prev => ({
        ...prev,
        lineas: prev.lineas.includes(linea)
            ? prev.lineas.filter(l => l !== linea)
            : [...prev.lineas, linea]
    }));

    const tags = [
        ...(filters.search
            ? [{ key: 'search', label: `Búsqueda: "${filters.search}"`, onRemove: () => setFilters(prev => ({ ...prev, search: '' })) }]
            : []),
        ...filters.categorias.map(cat => ({ key: cat, label: cat, isCategory: true, onRemove: () => onCategoryRemove(cat) })),
        ...filters.lineas.map(l => ({ key: l, label: l, onRemove: () => toggleLinea(l) })),
        ...applied.map(f => ({ ...f, onRemove: () => onRemoveApplied(f.key) })),
    ];

    return (
        <div className="sidebar-filter">
            <div className="sidebar-filter__header">
                <div className="sidebar-filter__title-wrap">
                    <FadersHorizontal size={17} className="sidebar-filter__icon" />
                    <span className="sidebar-filter__title">Filtros</span>
                    {tags.length > 0 && (
                        <span className="sidebar-filter__count">{tags.length}</span>
                    )}
                </div>

                {tags.length > 0 && (
                    <button
                        type="button"
                        className="sidebar-filter__reset"
                        onClick={onReset}
                        title="Restablecer todos los filtros"
                    >
                        <ArrowCounterClockwise size={12} />
                        <span>Reiniciar</span>
                    </button>
                )}
            </div>

            <div className="sidebar-filter__groups">
                {children}

                {/* Research lines: only once a category is selected */}
                {filters.categorias.length > 0 && lineas.length > 0 && (
                    <div className="sidebar-filter__group">
                        <div className="sidebar-filter__group-header">
                            <span className="sidebar-filter__label">Líneas de investigación</span>
                            {filters.lineas.length > 0 && (
                                <button
                                    type="button"
                                    className="sidebar-filter__link-clear"
                                    onClick={() => setFilters(prev => ({ ...prev, lineas: [] }))}
                                >
                                    Limpiar
                                </button>
                            )}
                        </div>
                        <div className="sidebar-filter__pills sidebar-filter__pills--lines">
                            {lineas.map(linea => (
                                <button
                                    key={linea}
                                    type="button"
                                    className={`sidebar-filter__line-pill ${filters.lineas.includes(linea) ? 'sidebar-filter__line-pill--active' : ''}`}
                                    onClick={() => toggleLinea(linea)}
                                    title={linea}
                                >
                                    {linea}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {tags.length > 0 && (
                    <div className="sidebar-filter__applied">
                        <span className="sidebar-filter__label">Filtros aplicados:</span>
                        <div className="sidebar-filter__applied-tags">
                            {tags.map(tag => (
                                <span key={tag.key} className={`applied-tag ${tag.isCategory ? 'applied-tag--cat' : ''}`} title={tag.label}>
                                    <span>{tag.label}</span>
                                    <button type="button" onClick={tag.onRemove} title={`Quitar ${tag.label}`}>
                                        <X size={11} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export function FilterGroup({ icon: Icon, label, children }) {
    return (
        <div className="sidebar-filter__group">
            <span className="sidebar-filter__label">
                <Icon size={13} />
                {label}
            </span>
            {children}
        </div>
    );
}

export function FilterPill({ active, onClick, children }) {
    return (
        <button
            type="button"
            className={`sidebar-filter__pill ${active ? 'sidebar-filter__pill--active' : ''}`}
            onClick={onClick}
        >
            {active && <Check size={11} />}
            <span>{children}</span>
        </button>
    );
}

// Single-choice pills: clicking the active option clears it.
export function FilterPills({ options, value, onChange }) {
    return (
        <div className="sidebar-filter__pills">
            {options.map(option => (
                <FilterPill
                    key={option}
                    active={value === option}
                    onClick={() => onChange(value === option ? '' : option)}
                >
                    {option}
                </FilterPill>
            ))}
        </div>
    );
}

// On/off filter with an explanatory hint. A native checkbox keeps keyboard and
// screen-reader support; the track/thumb are purely visual.
export function FilterSwitch({ checked, onChange, label, hint }) {
    return (
        <label className="filter-switch">
            <span className="filter-switch__text">
                <span className="filter-switch__label">{label}</span>
                {hint && <span className="filter-switch__hint">{hint}</span>}
            </span>
            <input
                type="checkbox"
                role="switch"
                className="filter-switch__input"
                checked={checked}
                onChange={e => onChange(e.target.checked)}
            />
            <span className="filter-switch__track" aria-hidden="true">
                <span className="filter-switch__thumb" />
            </span>
        </label>
    );
}

export function FilterSelect({ value, onChange, placeholder, options }) {
    return (
        <div className="sidebar-filter__select-wrap">
            <select
                className="sidebar-filter__select"
                value={value}
                onChange={e => onChange(e.target.value)}
            >
                <option value="">{placeholder}</option>
                {options.map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
            <CaretDown size={13} className="sidebar-filter__chevron" />
        </div>
    );
}
