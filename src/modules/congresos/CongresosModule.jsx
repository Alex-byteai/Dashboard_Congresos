import { useEffect, useState } from 'react'
import { LayoutGrid, Table, Calendar, PieChart } from 'lucide-react'

import Header from '../../shared/components/Header'
import Stats from './components/StatsCards'
import Filters from './components/FilterPanel'
import CongressList from './components/CongressList'
import CongressTable from './components/CongressTable'
import Timeline from './components/Timeline'
import Charts from './components/Charts'
import CareerFilter, { CAREERS } from './components/CareerFilter'

export default function CongresosModule({ onBack }) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('cards')
    const [selectedCareers, setSelectedCareers] = useState([])
    const initialFilters = {
        search: '',
        country: '',
        categorias: [],
        linea: '',
        sublinea: '',
        modality: '',
        indexation: ''
    }
    const [filters, setFilters] = useState(initialFilters)
    const [taxonomy, setTaxonomy] = useState({})

    const handleCareerSelect = (careerId) => {
        if (!careerId) {
            setSelectedCareers([])
        } else {
            setSelectedCareers(prev =>
                prev.includes(careerId)
                    ? prev.filter(id => id !== careerId)
                    : [...prev, careerId]
            )
        }
    }

    useEffect(() => {
        fetch('/congresses.json')
            .then(res => res.json())
            .then(jsonData => {
                if (jsonData.taxonomy) {
                    setTaxonomy(jsonData.taxonomy)
                }

                const processed = jsonData.congresses.map(event => {
                    const daysRemaining = calculateDaysRemaining(event.deadline)
                    return {
                        ...event,
                        deadlineDays: daysRemaining,
                        isScopus: event.publicacion?.toLowerCase().includes('scopus') || false,
                        isIEEE: event.publicacion?.toLowerCase().includes('ieee') || false,
                        isWoS: event.publicacion?.toLowerCase().includes('wos') || false,
                        month: getMonthString(event.fechaInicio)
                    }
                })
                setData(processed)
                setLoading(false)
            })
            .catch(err => {
                console.error("Error loading data:", err)
                setLoading(false)
            })
    }, [])

    const calculateDaysRemaining = (deadline) => {
        if (!deadline) return null
        const today = new Date()
        const target = new Date(deadline)
        const diffTime = target - today
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const getUrgencyClass = (days) => {
        if (days === null) return 'urgency-tbd'
        if (days < 0) return 'urgency-passed'
        if (days <= 15) return 'urgency-high'
        if (days <= 30) return 'urgency-medium'
        return 'urgency-low'
    }

    const getUrgencyText = (days) => {
        if (days === null) return 'Fecha por definir'
        if (days < 0) return 'Vencido'
        if (days <= 7) return `${days}d`
        return `${days} días`
    }

    const getMonthString = (dateStr) => {
        if (!dateStr) return 'Fecha por confirmar'
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return 'Fecha por confirmar'
        return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    }

    const filteredEvents = data.filter(event => {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = !filters.search ||
            event.evento?.toLowerCase().includes(searchLower) ||
            event.nombreCompleto?.toLowerCase().includes(searchLower) ||
            event.disciplina?.toLowerCase().includes(searchLower)

        const matchesCountry = !filters.country || event.pais === filters.country

        const matchesCategoria = filters.categorias.length === 0 ||
            filters.categorias.some(cat => event.categoria?.includes(cat))
        const matchesLinea = !filters.linea || (event.linea && event.linea.includes(filters.linea))
        const matchesSublinea = !filters.sublinea || (event.sublinea && event.sublinea.includes(filters.sublinea))

        const matchesModality = !filters.modality || event.modalidad === filters.modality

        const matchesIndexation = !filters.indexation ||
            (filters.indexation === 'Scopus' && event.isScopus) ||
            (filters.indexation === 'IEEE' && event.isIEEE) ||
            (filters.indexation === 'WoS' && event.isWoS)

        const selectedCategories = selectedCareers
            .map(id => CAREERS.find(c => c.id === id)?.categoria)
            .filter(Boolean)
        const matchesCareer = selectedCategories.length === 0 ||
            selectedCategories.some(cat => event.categoria?.includes(cat))

        return matchesSearch && matchesCountry && matchesCategoria && matchesLinea && matchesSublinea && matchesModality && matchesIndexation && matchesCareer
    })

    const countries = [...new Set(data.map(e => e.pais).filter(Boolean))].sort()

    const uniqueCategorias = Object.keys(taxonomy).sort()

    const uniqueLineas = filters.categorias.length > 0
        ? [...new Set(filters.categorias.flatMap(cat => taxonomy[cat] ? Object.keys(taxonomy[cat]) : []))].sort()
        : []

    const uniqueSublineas = filters.linea
        ? [...new Set(filters.categorias.flatMap(cat => taxonomy[cat]?.[filters.linea] || []))]
        : []

    const stats = {
        total: filteredEvents.length,
        urgent: filteredEvents.filter(e => e.deadlineDays !== null && e.deadlineDays > 0 && e.deadlineDays <= 30).length,
        countries: new Set(filteredEvents.map(e => e.pais).filter(Boolean)).size,
        scopus: filteredEvents.filter(e => e.isScopus).length
    }

    if (loading) return <div className="loader"><div className="spinner"></div></div>

    return (
        <>
            <Header onBack={onBack} moduleName="Congresos Científicos" />
            <Stats stats={stats} />

            <div className="container">
                <CareerFilter
                    selectedCareers={selectedCareers}
                    onSelect={handleCareerSelect}
                />

                <Filters
                    filters={filters}
                    setFilters={(newFilters) => {
                        setFilters(newFilters)
                    }}
                    countries={countries}
                    categorias={uniqueCategorias}
                    lineas={uniqueLineas}
                    sublineas={uniqueSublineas}
                    onReset={() => { setFilters(initialFilters); setSelectedCareers([]) }}
                />

                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'cards' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cards')}
                    >
                        <LayoutGrid size={18} />
                        Tarjetas
                    </button>
                    <button
                        className={`tab ${activeTab === 'table' ? 'active' : ''}`}
                        onClick={() => setActiveTab('table')}
                    >
                        <Table size={18} />
                        Tabla
                    </button>
                    <button
                        className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
                        onClick={() => setActiveTab('timeline')}
                    >
                        <Calendar size={18} />
                        Timeline
                    </button>
                    <button
                        className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stats')}
                    >
                        <PieChart size={18} />
                        Estadísticas
                    </button>
                </div>

                {activeTab === 'cards' && (
                    <CongressList
                        events={filteredEvents}
                        getUrgencyClass={getUrgencyClass}
                        getUrgencyText={getUrgencyText}
                    />
                )}

                {activeTab === 'table' && (
                    <CongressTable
                        events={filteredEvents}
                        getUrgencyClass={getUrgencyClass}
                        getUrgencyText={getUrgencyText}
                    />
                )}

                {activeTab === 'timeline' && (
                    <Timeline
                        events={filteredEvents}
                        getUrgencyClass={getUrgencyClass}
                    />
                )}

                {activeTab === 'stats' && (
                    <Charts data={data} />
                )}
            </div>
        </>
    )
}
