import { Search, RotateCcw, ChevronDown, X, BookOpen, Layers, Target, Activity } from 'lucide-react';
import React from 'react';

const CAT_COLORS = {
    'INNOVACIÓN Y TECNOLOGÍA DIGITAL': { color: '#0ea5e9' },
    'DESARROLLO SOSTENIBLE Y MEDIOAMBIENTE': { color: '#10b981' },
    'SOCIEDAD Y COMPORTAMIENTO HUMANO': { color: '#6366f1' },
    'GESTIÓN Y ECONOMÍA DEL CONOCIMIENTO': { color: '#f78e1e' },
}

export default function RevistasFilterPanel({ filters, setFilters, tipos, disciplinas, categorias, lineas, onReset }) {

    const toggleLinea = (linea) => {
        const current = filters.lineas || []
        const isSelected = current.includes(linea)
        const newLineas = isSelected
            ? current.filter(l => l !== linea)
            : [...current, linea]
        setFilters({ ...filters, lineas: newLineas })
    }

    const otherActiveFilters = [
        filters.tipo && { key: 'tipo', label: filters.tipo },
        filters.disciplina && { key: 'disciplina', label: filters.disciplina },
    ].filter(Boolean)

    const removeFilter = (key) => {
        setFilters({ ...filters, [key]: '' })
    }

    const hasAnyFilter = filters.search || filters.categorias.length > 0 || otherActiveFilters.length > 0

    return (
        <div className="filters filters--revistas">
            <div className="filters-top-row">
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar por nombre de revista, editorial o ISSN..."
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

            {/* Research Lines — Progressive Disclosure */}
            {filters.categorias.length > 0 && lineas.length > 0 && (
                <div className="career-filter career-filter--inline">
                    <div className="career-filter__header">
                        <span className="career-filter__label">Líneas de Investigación</span>
                        {(filters.lineas || []).length > 0 && (
                            <button className="career-filter__clear"
                                onClick={() => setFilters({ ...filters, lineas: [] })}>
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

            <div className="filters-selects">
                <div className="filter-select-group filter-select-group--chips">
                    <label>
                        <Target size={14} />
                        Tipo de Revista
                    </label>
                    <div className="modality-chips">
                        {tipos.map(t => (
                            <button
                                key={t}
                                className={`modality-chip ${filters.tipo === t ? 'modality-chip--active' : ''}`}
                                onClick={() => setFilters({ ...filters, tipo: filters.tipo === t ? '' : t })}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="filter-select-group">
                    <label>
                        <Layers size={14} />
                        Disciplina
                    </label>
                    <div className="select-wrapper">
                        <select value={filters.disciplina} onChange={e => setFilters({ ...filters, disciplina: e.target.value })}>
                            <option value="">Todas las disciplinas</option>
                            {disciplinas.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <ChevronDown size={14} className="select-chevron" />
                    </div>
                </div>
            </div>

            {hasAnyFilter && (filters.categorias.length > 0 || otherActiveFilters.length > 0) && (
                <div className="active-chips">
                    <span className="chips-label">Filtros aplicados:</span>
                    
                    {/* Categories color-coded like Congresos */}
                    {filters.categorias.map(cat => {
                        const color = CAT_COLORS[cat]?.color || '#f78e1e'
                        return (
                            <span key={cat} className="filter-chip"
                                style={{ borderColor: color, color: color, fontWeight: 700 }}>
                                {cat}
                                <button 
                                    onClick={() => setFilters({ ...filters, categorias: filters.categorias.filter(c => c !== cat) })}
                                    style={{ background: color }}
                                >
                                    <X size={11} />
                                </button>
                            </span>
                        )
                    })}

                    {/* Lines coded like Congresos */}
                    {(filters.lineas || []).map(l => (
                        <span key={l} className="filter-chip"
                            style={{ borderColor: '#475569', color: '#475569' }}>
                            {l}
                            <button onClick={() => toggleLinea(l)} style={{ background: '#475569' }}><X size={11} /></button>
                        </span>
                    ))}

                    {/* Other filters */}
                    {otherActiveFilters.map(f => (
                        <span key={f.key} className="filter-chip">
                            {f.label}
                            <button onClick={() => removeFilter(f.key)}><X size={11} /></button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
