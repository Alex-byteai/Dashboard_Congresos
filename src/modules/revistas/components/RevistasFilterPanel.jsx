import React from 'react';
import { Search, RotateCcw, ChevronDown, X } from 'lucide-react';

export default function RevistasFilterPanel({ filters, setFilters, publishers, enfoques, disciplinas, onReset }) {

    const activeFilters = [
        filters.publisher && { key: 'publisher', label: filters.publisher },
        filters.enfoque && { key: 'enfoque', label: filters.enfoque },
        filters.disciplina && { key: 'disciplina', label: filters.disciplina },
    ].filter(Boolean)

    const removeFilter = (key) => {
        setFilters({ ...filters, [key]: '' })
    }

    const hasAnyFilter = filters.search || activeFilters.length > 0

    return (
        <div className="filters">
            <div className="filters-top-row">
                <div className="search-wrapper">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar revista, ISSN, publisher…"
                        value={filters.search}
                        onChange={e => setFilters({ ...filters, search: e.target.value })}
                    />
                    {filters.search && (
                        <button className="search-clear" onClick={() => setFilters({ ...filters, search: '' })} title="Limpiar">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {hasAnyFilter && (
                    <button className="btn-reset" onClick={onReset}>
                        <RotateCcw size={14} />
                        Limpiar todo
                    </button>
                )}
            </div>

            <div className="filters-selects">
                <div className="filter-select-group">
                    <label>Publisher</label>
                    <div className="select-wrapper">
                        <select value={filters.publisher} onChange={e => setFilters({ ...filters, publisher: e.target.value })}>
                            <option value="">Todos</option>
                            {publishers.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <ChevronDown size={14} className="select-chevron" />
                    </div>
                </div>

                <div className="filter-select-group">
                    <label>Enfoque</label>
                    <div className="select-wrapper">
                        <select value={filters.enfoque} onChange={e => setFilters({ ...filters, enfoque: e.target.value })}>
                            <option value="">Todos</option>
                            {enfoques.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                        <ChevronDown size={14} className="select-chevron" />
                    </div>
                </div>

                <div className="filter-select-group">
                    <label>Disciplina</label>
                    <div className="select-wrapper">
                        <select value={filters.disciplina} onChange={e => setFilters({ ...filters, disciplina: e.target.value })}>
                            <option value="">Todas</option>
                            {disciplinas.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <ChevronDown size={14} className="select-chevron" />
                    </div>
                </div>
            </div>

            {activeFilters.length > 0 && (
                <div className="active-chips">
                    <span className="chips-label">Activos:</span>
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
