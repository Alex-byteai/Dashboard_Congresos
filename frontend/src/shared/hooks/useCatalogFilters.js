import { useState } from 'react';
import { linesForCareers, linesOfCareer } from '../taxonomy';

// Filter state shared by the catalog modules (congresos, revistas).
// Careers are a shortcut for their priority lines, so every career change
// re-derives `lineas`; any line change clears the dependent `sublineas`.
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
        setFilters(prev => ({ ...prev, lineas: linesForCareers(next), sublineas: [] }));
    };

    // `null` ("Todos") or clicking the only active line clears the selection.
    const selectLine = (line) => {
        const isOnlyActive = filters.lineas.length === 1 && filters.lineas[0] === line;
        setSelectedCareers([]);
        setFilters(prev => ({ ...prev, lineas: line && !isOnlyActive ? [line] : [], sublineas: [] }));
    };

    // Removing a line also drops the careers that brought it in
    const removeLine = (line) => {
        setSelectedCareers(prev => prev.filter(id => !linesOfCareer(id).includes(line)));
        setFilters(prev => ({ ...prev, lineas: prev.lineas.filter(l => l !== line), sublineas: [] }));
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
        toggleCareer, selectLine, removeLine, resetFilters
    };
}
