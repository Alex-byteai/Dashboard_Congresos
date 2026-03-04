import React, { useEffect, useRef } from 'react';
import { Search, RotateCcw, ChevronDown, X } from 'lucide-react';
import { trackEvent } from '../analytics'

export default function Filters({ filters, setFilters, countries, categorias, lineas, sublineas, onReset }) {

    const searchDebounceRef = useRef(null)

    const toTitleCase = (str) => str
        .toLowerCase()
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')

    const handleCategoriaChange = (e) => {
        const value = e.target.value
        setFilters({ ...filters, categoria: value, linea: '', sublinea: '' })
        trackEvent('filter_change', { key: 'categoria', value })
    }

    const handleLineaChange = (e) => {
        const value = e.target.value
        setFilters({ ...filters, linea: value, sublinea: '' })
        trackEvent('filter_change', { key: 'linea', value })
    }

    // Count active filters (excluding search which is shown inline)
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
        trackEvent('filter_chip_remove', { key })
    }

    const hasAnyFilter = filters.search || activeFilters.length > 0

    useEffect(() => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)

        const q = (filters.search || '').trim()
        if (!q) return

        searchDebounceRef.current = setTimeout(() => {
            trackEvent('search', { query_length: q.length })
        }, 500)

        return () => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
        }
    }, [filters.search])

    return (
        <div className="filters">
            {/* Top row: search + reset */}
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
                        <button
                            className="search-clear"
                            onClick={() => {
                                setFilters({ ...filters, search: '' })
                                trackEvent('search_clear')
                            }}
                            title="Limpiar"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {hasAnyFilter && (
                    <button
                        className="btn-reset"
                        onClick={() => {
                            onReset()
                            trackEvent('filters_reset')
                        }}
                    >
                        <RotateCcw size={14} />
                        Limpiar todo
                    </button>
                )}
            </div>

            {/* Filter selects */}
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
                        <select
                            value={filters.country}
                            onChange={e => {
                                const value = e.target.value
                                setFilters({ ...filters, country: value })
                                trackEvent('filter_change', { key: 'country', value })
                            }}
                        >
                            <option value="">Todos los países</option>
                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown size={14} className="select-chevron" />
                    </div>
                </div>

                <div className="filter-select-group">
                    <label>Modalidad</label>
                    <div className="select-wrapper">
                        <select
                            value={filters.modality}
                            onChange={e => {
                                const value = e.target.value
                                setFilters({ ...filters, modality: value })
                                trackEvent('filter_change', { key: 'modality', value })
                            }}
                        >
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
                        <select
                            value={filters.indexation}
                            onChange={e => {
                                const value = e.target.value
                                setFilters({ ...filters, indexation: value })
                                trackEvent('filter_change', { key: 'indexation', value })
                            }}
                        >
                            <option value="">Todas</option>
                            <option value="Scopus">Scopus</option>
                            <option value="WoS">WoS</option>
                        </select>
                        <ChevronDown size={14} className="select-chevron" />
                    </div>
                </div>
            </div>

            {/* Active filter chips */}
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
