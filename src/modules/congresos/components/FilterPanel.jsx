import React from 'react';
import { Search, RotateCcw, ChevronDown, X } from 'lucide-react';

export default function Filters({ filters, setFilters, countries, categorias, lineas, sublineas, onReset }) {

    const toTitleCase = (str) => str
        .toLowerCase()
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')

    const handleCategoriaChange = (e) => {
        setFilters({ ...filters, categoria: e.target.value, linea: '', sublinea: '' })
    }

    const handleLineaChange = (e) => {
        setFilters({ ...filters, linea: e.target.value, sublinea: '' })
    }

    const activeFilters = [
        filters.country && { key: 'country', label: filters.country },
        filters.categoria && { key: 'categoria', label: toTitleCase(filters.categoria) },
        filters.linea && { key: 'linea', label: filters.linea },
        filters.modality && { key: 'modality', label: filters.modality },
        filters.indexation && { key: 'indexation', label: filters.indexation },
    ].filter(Boolean)

    const removeFilter = (key) => {
        const reset = { ...filters, [key]: '' }
        if (key === 'categoria') { reset.linea = ''; reset.sublinea = '' }
        if (key === 'linea') { reset.sublinea = '' }
        setFilters(reset)
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
                        placeholder="Buscar congreso, disciplina…"
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
                    <label>Categoría</label>
                    <div className="select-wrapper">
                        <select value={filters.categoria} onChange={handleCategoriaChange}>
                            <option value="">Todas las categorías</option>
                            {categorias.map(c => <option key={c} value={c}>{toTitleCase(c)}</option>)}
                        </select>
                        <ChevronDown size={14} className="select-chevron" />
                    </div>
                </div>

                <div className="filter-select-group">
                    <label>Línea de investigación</label>
                    <div className={`select-wrapper ${!filters.categoria ? 'disabled' : ''}`}>
                        <select value={filters.linea} onChange={handleLineaChange} disabled={!filters.categoria}>
                            <option value="">Todas las líneas</option>
                            {lineas.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <ChevronDown size={14} className="select-chevron" />
                    </div>
                </div>

                <div className="filter-select-group">
                    <label>País</label>
                    <div className="select-wrapper">
                        <select value={filters.country} onChange={e => setFilters({ ...filters, country: e.target.value })}>
                            <option value="">Todos los países</option>
                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown size={14} className="select-chevron" />
                    </div>
                </div>

                <div className="filter-select-group">
                    <label>Modalidad</label>
                    <div className="select-wrapper">
                        <select value={filters.modality} onChange={e => setFilters({ ...filters, modality: e.target.value })}>
                            <option value="">Todas</option>
                            <option value="Presencial">Presencial</option>
                            <option value="Hibrido">Híbrido</option>
                            <option value="Virtual">Virtual</option>
                        </select>
                        <ChevronDown size={14} className="select-chevron" />
                    </div>
                </div>

                <div className="filter-select-group">
                    <label>Indexación</label>
                    <div className="select-wrapper">
                        <select value={filters.indexation} onChange={e => setFilters({ ...filters, indexation: e.target.value })}>
                            <option value="">Todas</option>
                            <option value="Scopus">Scopus</option>
                            <option value="WoS">WoS</option>
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
