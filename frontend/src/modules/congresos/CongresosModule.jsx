import { useEffect, useMemo, useState } from 'react'
import {
    SquaresFour, Calendar, Clock, CheckCircle, WarningCircle, Database
} from '@phosphor-icons/react'

import DashboardLayout from '../../shared/components/DashboardLayout'
import CategoryFilter from '../../shared/components/CategoryFilter'
import StatsStrip from '../../shared/components/StatsStrip'
import { InfoPanelItem, InfoPanelSection, ProtocolPanelSection } from '../../shared/components/InfoPanel'
import useCatalogFilters from '../../shared/hooks/useCatalogFilters'
import { loadCongresos } from '../../core/services/data'
import CongresosFilterPanel from './components/CongresosFilterPanel'
import CongressList from './components/CongressList'
import Timeline from './components/Timeline'
import {
    prepareCongress, compareByRelevance,
    getUrgencyClass, getUrgencyText, formatLocation, formatDate
} from './utils'

const EMPTY_FILTERS = {
    search: '',
    country: '',
    modality: '',
    onlyOpen: false,
    hideFinished: false,
    categorias: [],
    lineas: []
}

export default function CongresosModule({ onNavigate }) {
    const [data, setData] = useState([])
    const [taxonomy, setTaxonomy] = useState({})
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('cards')
    const {
        filters, setFilters, selectedCareers, activeCount,
        toggleCareer, selectCategory, removeCategory, resetFilters
    } = useCatalogFilters(EMPTY_FILTERS)

    useEffect(() => {
        loadCongresos()
            .then(json => {
                setTaxonomy(json.taxonomy || {})
                setData((json.congresses || []).map(prepareCongress))
            })
            .catch(err => console.error('Error loading congresos:', err))
            .finally(() => setLoading(false))
    }, [])

    const filteredEvents = useMemo(() => {
        const q = filters.search.toLowerCase().trim()
        return data.filter(event => {
            const matchesSearch = !q ||
                event.evento?.toLowerCase().includes(q) ||
                event.nombreCompleto?.toLowerCase().includes(q) ||
                event.disciplina?.toLowerCase().includes(q)
            const matchesCountry = !filters.country || event.pais === filters.country
            const matchesModality = !filters.modality || event.modalidad === filters.modality
            const matchesStatus = (!filters.onlyOpen || event.status === 'open') &&
                (!filters.hideFinished || event.status !== 'finished')
            const matchesCategoria = filters.categorias.length === 0 ||
                filters.categorias.some(cat => event.categoria?.includes(cat))
            const matchesLinea = filters.lineas.length === 0 ||
                filters.lineas.some(l => event.linea?.includes(l))

            return matchesSearch && matchesCountry && matchesModality && matchesStatus &&
                matchesCategoria && matchesLinea
        }).sort(compareByRelevance)
    }, [data, filters])

    const countries = useMemo(
        () => [...new Set(data.map(e => e.pais).filter(Boolean))].sort(),
        [data]
    )

    const lineas = useMemo(
        () => [...new Set(filters.categorias.flatMap(cat => Object.keys(taxonomy[cat] || {})))].sort(),
        [filters.categorias, taxonomy]
    )

    const upcomingDeadlines = useMemo(
        () => data
            .filter(e => e.status === 'open')
            .sort(compareByRelevance)
            .slice(0, 5),
        [data]
    )

    // filteredEvents is sorted with open calls first, closest deadline first
    const nextDeadline = filteredEvents.find(e => e.status === 'open')
    const stats = [
        { icon: Calendar, value: filteredEvents.length, label: 'Congresos encontrados' },
        { icon: CheckCircle, value: filteredEvents.filter(e => e.status === 'open').length, label: 'Convocatorias abiertas', tone: 'success' },
        {
            icon: Clock,
            value: nextDeadline ? formatDate(nextDeadline.deadline) : '—',
            label: nextDeadline ? `Próximo cierre · ${nextDeadline.evento}` : 'Próximo cierre',
            tone: 'danger'
        },
    ]

    const rightPanel = !loading && (
        <>
            <CongresosFilterPanel
                filters={filters}
                setFilters={setFilters}
                countries={countries}
                lineas={lineas}
                onCategoryRemove={removeCategory}
                onReset={resetFilters}
            />

            <InfoPanelSection title="Próximos Cierres">
                {upcomingDeadlines.length === 0 ? (
                    <p className="info-panel__empty">No hay cierres próximos registrados</p>
                ) : (
                    upcomingDeadlines.map(ev => (
                        <InfoPanelItem
                            key={ev.id}
                            avatar={ev.evento?.slice(0, 3) || 'CON'}
                            name={ev.evento || ev.nombreCompleto}
                            sub={formatLocation(ev)}
                            aside={
                                <span className={`urgency-badge ${getUrgencyClass(ev.deadlineDays)}`}>
                                    <WarningCircle size={10} />
                                    {getUrgencyText(ev.deadlineDays)}
                                </span>
                            }
                            onClick={() => setFilters(prev => ({ ...prev, search: ev.evento || ev.nombreCompleto }))}
                            title="Filtrar por este congreso"
                        />
                    ))
                )}
            </InfoPanelSection>

            <ProtocolPanelSection />
        </>
    )

    return (
        <DashboardLayout
            activeModule="congresos"
            onNavigate={onNavigate}
            searchValue={filters.search}
            onSearchChange={(val) => setFilters(prev => ({ ...prev, search: val }))}
            searchPlaceholder="Buscar por congreso, disciplina o tema..."
            rightPanel={rightPanel}
            panelBadge={activeCount}
            panelDoneLabel={`Ver ${filteredEvents.length} ${filteredEvents.length === 1 ? 'congreso' : 'congresos'}`}
        >
            <div className="section-header">
                <div>
                    <h1 className="section-title">Congresos Científicos</h1>
                    <p className="section-subtitle">
                        Directorio verificado para la postulación informada de ponencias y papers
                    </p>
                </div>

                <div className="tabs">
                    <button
                        type="button"
                        className={`tab ${activeTab === 'cards' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cards')}
                    >
                        <SquaresFour size={16} />
                        Tarjetas
                    </button>
                    <button
                        type="button"
                        className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
                        onClick={() => setActiveTab('timeline')}
                    >
                        <Calendar size={16} />
                        Timeline
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loader">
                    <div className="spinner"></div>
                </div>
            ) : (
                <>
                    <CategoryFilter
                        categorias={filters.categorias}
                        selectedCareers={selectedCareers}
                        onSelectCategory={selectCategory}
                        onToggleCareer={toggleCareer}
                    />

                    <StatsStrip items={stats} />

                    {activeTab === 'cards'
                        ? <CongressList events={filteredEvents} />
                        : <Timeline events={filteredEvents} />}
                </>
            )}
        </DashboardLayout>
    )
}
