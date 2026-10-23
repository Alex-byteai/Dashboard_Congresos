import { Target, Tag, BookOpen } from '@phosphor-icons/react';
import SidebarFilter, {
    FilterGroup, FilterPills, FilterSelect
} from '../../../shared/components/SidebarFilter';
import { APC_OPTIONS } from '../utils';

const APPLIED_LABELS = {
    tipo: 'Tipo',
    apc: 'APC',
    disciplina: 'Disciplina',
};

export default function RevistasFilterPanel({
    filters,
    setFilters,
    tipos = [],
    disciplinas = [],
    sublineas = [],
    onLineRemove,
    onReset
}) {
    const set = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

    const applied = Object.entries(APPLIED_LABELS)
        .filter(([key]) => filters[key])
        .map(([key, label]) => ({ key, label: `${label}: ${filters[key]}` }));

    return (
        <SidebarFilter
            filters={filters}
            setFilters={setFilters}
            sublineas={sublineas}
            applied={applied}
            onRemoveApplied={key => set(key, '')}
            onLineRemove={onLineRemove}
            onReset={onReset}
        >
            <FilterGroup icon={Target} label="Tipo de Revista">
                <FilterPills options={tipos} value={filters.tipo} onChange={value => set('tipo', value)} />
            </FilterGroup>

            <FilterGroup icon={Tag} label="Cargos por publicación (APC)">
                <FilterPills options={APC_OPTIONS} value={filters.apc} onChange={value => set('apc', value)} />
            </FilterGroup>

            <FilterGroup icon={BookOpen} label="Disciplina">
                <FilterSelect
                    value={filters.disciplina}
                    onChange={value => set('disciplina', value)}
                    placeholder="Todas las disciplinas"
                    options={disciplinas}
                />
            </FilterGroup>
        </SidebarFilter>
    );
}
