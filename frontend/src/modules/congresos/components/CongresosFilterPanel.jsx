import { MapPin, Clock, Pulse } from '@phosphor-icons/react';
import SidebarFilter, {
    FilterGroup, FilterPills, FilterSelect, FilterSwitch
} from '../../../shared/components/SidebarFilter';
import { MODALITIES } from '../utils';

// Boolean filters shown as switches; `label` is also the applied-filter tag.
const STATUS_SWITCHES = [
    { key: 'onlyOpen', label: 'Convocatoria abierta', hint: 'Solo congresos que aún reciben trabajos' },
    { key: 'hideFinished', label: 'No finalizados', hint: 'Oculta los eventos que ya concluyeron' },
];

export default function CongresosFilterPanel({
    filters,
    setFilters,
    countries = [],
    lineas = [],
    onCategoryRemove,
    onReset
}) {
    const set = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

    const applied = [
        ...STATUS_SWITCHES.filter(({ key }) => filters[key]).map(({ key, label }) => ({ key, label })),
        filters.country && { key: 'country', label: `País: ${filters.country}` },
        filters.modality && { key: 'modality', label: `Modalidad: ${filters.modality}` },
    ].filter(Boolean);

    const removeApplied = (key) => set(key, typeof filters[key] === 'boolean' ? false : '');

    return (
        <SidebarFilter
            filters={filters}
            setFilters={setFilters}
            lineas={lineas}
            applied={applied}
            onRemoveApplied={removeApplied}
            onCategoryRemove={onCategoryRemove}
            onReset={onReset}
        >
            <FilterGroup icon={Clock} label="Estado">
                <div className="sidebar-filter__switches">
                    {STATUS_SWITCHES.map(({ key, label, hint }) => (
                        <FilterSwitch
                            key={key}
                            label={label}
                            hint={hint}
                            checked={filters[key]}
                            onChange={checked => set(key, checked)}
                        />
                    ))}
                </div>
            </FilterGroup>

            <FilterGroup icon={MapPin} label="Ubicación">
                <FilterSelect
                    value={filters.country}
                    onChange={value => set('country', value)}
                    placeholder="Cualquier país"
                    options={countries}
                />
            </FilterGroup>

            <FilterGroup icon={Pulse} label="Modalidad">
                <FilterPills
                    options={MODALITIES}
                    value={filters.modality}
                    onChange={value => set('modality', value)}
                />
            </FilterGroup>
        </SidebarFilter>
    );
}
