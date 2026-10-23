import { useState } from 'react';
import { categoriesForCareers, categoryOfCareer } from '../taxonomy';

// Filter state shared by the catalog modules (congresos, revistas).
// A career is an alias for its ULima category, so every career change
// re-derives `categorias`; any category change clears the dependent `lineas`.
// `emptyFilters` must be a stable object (defined at module level); it is also
// what `resetFilters` returns to. `overrides` only seed the first render.
export default function useCatalogFilters(emptyFilters, overrides) {
    const [filters, setFilters] = useState(() => ({ ...emptyFilters, ...overrides }));
    const [selectedCareers, setSelectedCareers] = useState([]);

    const toggleCareer = (careerId) => {
        const next = selectedCareers.includes(careerId)
            ? selectedCareers.filter(id => id !== careerId)
            : [...selectedCareers, careerId];
        setSelectedCareers(next);
        setFilters(prev => ({ ...prev, categorias: categoriesForCareers(next), lineas: [] }));
    };

    // `null` ("Todos") or clicking the only active category clears the selection.
    const selectCategory = (category) => {
        const isOnlyActive = filters.categorias.length === 1 && filters.categorias[0] === category;
        setSelectedCareers([]);
        setFilters(prev => ({ ...prev, categorias: category && !isOnlyActive ? [category] : [], lineas: [] }));
    };

    const removeCategory = (category) => {
        setSelectedCareers(prev => prev.filter(id => categoryOfCareer(id) !== category));
        setFilters(prev => ({ ...prev, categorias: prev.categorias.filter(c => c !== category), lineas: [] }));
    };

    const resetFilters = () => {
        setFilters(emptyFilters);
        setSelectedCareers([]);
    };

    // One per list item and per non-empty value: the same count as SidebarFilter's tags
    const activeCount = Object.values(filters).reduce(
        (count, value) => count + (Array.isArray(value) ? value.length : value ? 1 : 0),
        0
    );

    return {
        filters, setFilters, selectedCareers, activeCount,
        toggleCareer, selectCategory, removeCategory, resetFilters
    };
}
