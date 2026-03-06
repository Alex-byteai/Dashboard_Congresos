import React from 'react';
import { Search, RotateCcw, ChevronDown, X, MapPin, Globe, Clock, CheckCircle2, Circle, Activity } from 'lucide-react';

// Color matching for active chips bar
const CAT_COLORS = {
    'INNOVACIÓN Y TECNOLOGÍA DIGITAL': { color: '#0ea5e9' },
    'DESARROLLO SOSTENIBLE Y MEDIOAMBIENTE': { color: '#10b981' },
    'SOCIEDAD Y COMPORTAMIENTO HUMANO': { color: '#6366f1' },
    'GESTIÓN Y ECONOMÍA DEL CONOCIMIENTO': { color: '#f78e1e' },
}

export default function Filters({ filters, setFilters, countries, lineas, onReset, activeCategoryLabels = [] }) {

    const toggleLinea = (linea) => {
        const current = filters.lineas || []
        const isSelected = current.includes(linea)
        const newLineas = isSelected
            ? current.filter(l => l !== linea)
            : [...current, linea]
        setFilters({ ...filters, lineas: newLineas, sublinea: '' })
    }

    const activeOtherFilters = [
        filters.country && { key: 'country', label: filters.country },
        filters.modality && { key: 'modality', label: filters.modality },
        filters.indexation && { key: 'indexation', label: filters.indexation },
        filters.onlyActive && { key: 'onlyActive', label: 'Solo vigentes' },
    ].filter(Boolean)

    const removeFilter = (key) => setFilters({ ...filters, [key]: '' })

    const hasAnyFilter =
        filters.search ||
        filters.categorias.length > 0 ||
        (filters.lineas || []).length > 0 ||
        activeOtherFilters.length > 0

    return (
        <div className="filters">

            {/* Central Search + Reset Actions */}
            <div className="filters-top-row">
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Busca por nombre de congreso, tema o disciplina..."
                        value={filters.search}
                        onChange={e => setFilters({ ...filters, search: e.target.value })}
                    />
                    {filters.search && (
                        <button className="search-clear" onClick={() => setFilters({ ...filters, search: '' })}>
                            <X size={14} />
                        </button>
                    )}
                </div>
                {hasAnyFilter && (
                    <button className="btn-reset" onClick={onReset}>
                        <RotateCcw size={14} />
                        Reiniciar filtros
                    </button>
                )}
            </div>

            {/* Research Lines — Progressive Disclosure: Only show if Categories are active */}
            {filters.categorias.length > 0 && lineas.length > 0 && (
                <div className="career-filter career-filter--inline">
                    <div className="career-filter__header">
                        <span className="career-filter__label">Líneas de Investigación</span>
                        {(filters.lineas || []).length > 0 && (
                            <button className="career-filter__clear"
                                onClick={() => setFilters({ ...filters, lineas: [], sublinea: '' })}>
                                Limpiar líneas
                            </button>
                        )}
                    </div>
                    <div className="career-filter__grid">
                        {lineas.map(linea => {
                            const isActive = (filters.lineas || []).includes(linea)
                            return (
                                <button
                                    key={linea}
                                    className={`career-chip ${isActive ? 'career-chip--active' : ''}`}
                                    style={{ '--career-color': '#475569', '--career-bg': '#f1f5f9' }}
                                    onClick={() => toggleLinea(linea)}
                                >
                                    <span className="career-chip__name">{linea}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Standard Context Selectors */}
            <div className="filters-selects">
                <div className="filter-select-group">
                    <label>
                        <MapPin size={14} />
                        Ubicación
                    </label>
                    <div className="select-wrapper">
                        <select value={filters.country} onChange={e => setFilters({ ...filters, country: e.target.value })}>
                            <option value="">Cualquier país</option>
                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <Globe size={14} className="select-chevron" />
                    </div>
                </div>

                <div className="filter-select-group filter-select-group--chips">
                    <label>
                        <Activity size={14} />
                        Modalidad
                    </label>
                    <div className="modality-chips">
                        {['Presencial', 'Hibrido', 'Virtual'].map(m => (
                            <button
                                key={m}
                                className={`modality-chip ${filters.modality === m ? 'modality-chip--active' : ''}`}
                                onClick={() => setFilters({ ...filters, modality: filters.modality === m ? '' : m })}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="filter-select-group filter-select-group--toggle">
                    <label>
                        <Clock size={14} />
                        Deadline
                    </label>
                    <button
                        className={`deadline-toggle ${filters.onlyActive ? 'deadline-toggle--active' : ''}`}
                        onClick={() => setFilters({ ...filters, onlyActive: !filters.onlyActive })}
                    >
                        <div className="deadline-toggle__track">
                            <div className="deadline-toggle__thumb">
                                {filters.onlyActive ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                            </div>
                        </div>
                        <span className="deadline-toggle__label">Solo vigentes</span>
                    </button>
                </div>
            </div>

            {/* Active Filters Summary Bar */}
            {hasAnyFilter && (
                <div className="active-chips">
                    <span className="chips-label">Filtros aplicados:</span>

                    {/* Visual indicators for selected Categories (derived from Careers) */}
                    {activeCategoryLabels.map(cat => {
                        const color = CAT_COLORS[cat]?.color || '#f78e1e'
                        return (
                            <span key={cat} className="filter-chip"
                                style={{ borderColor: color, color: color, fontWeight: 700 }}>
                                {cat}
                            </span>
                        )
                    })}

                    {/* Lines */}
                    {(filters.lineas || []).map(l => (
                        <span key={l} className="filter-chip"
                            style={{ borderColor: '#475569', color: '#475569' }}>
                            {l}
                            <button onClick={() => toggleLinea(l)} style={{ background: '#475569' }}><X size={11} /></button>
                        </span>
                    ))}

                    {/* Standard Selectors */}
                    {activeOtherFilters.map(f => (
                        <span key={f.key} className="filter-chip">
                            {f.label}
                            <button onClick={() => removeFilter(f.key)}><X size={11} /></button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}
