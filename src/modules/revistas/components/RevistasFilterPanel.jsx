import React from 'react';
import { Search, RotateCcw, ChevronDown, X, BookOpen, Layers, Target, Activity } from 'lucide-react';

export default function RevistasFilterPanel({ filters, setFilters, publishers, tipos, disciplinas, onReset }) {

    const activeFilters = [
        filters.publisher && { key: 'publisher', label: filters.publisher },
        filters.tipo && { key: 'tipo', label: filters.tipo },
        filters.disciplina && { key: 'disciplina', label: filters.disciplina },
    ].filter(Boolean)

    const removeFilter = (key) => {
        setFilters({ ...filters, [key]: '' })
    }

    const hasAnyFilter = filters.search || activeFilters.length > 0

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
                        <BookOpen size={14} />
                        Editorial
                    </label>
                    <div className="select-wrapper">
                        <select value={filters.publisher} onChange={e => setFilters({ ...filters, publisher: e.target.value })}>
                            <option value="">Todas las editoriales</option>
                            {publishers.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <ChevronDown size={14} className="select-chevron" />
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

            {activeFilters.length > 0 && (
                <div className="active-chips">
                    <span className="chips-label">Filtros aplicados:</span>
                    {activeFilters.map(f => (
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
