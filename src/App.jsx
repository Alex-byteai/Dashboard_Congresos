import { useState, useEffect } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
} from 'chart.js'
import { LayoutGrid, Table, Calendar, PieChart } from 'lucide-react'

// Components
import Header from './components/Header'
import Stats from './components/StatsCards'
import Filters from './components/FilterPanel'
import CongressList from './components/CongressList'
import CongressTable from './components/CongressTable'
import Timeline from './components/Timeline'
import Charts from './components/Charts'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
)

function App() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('cards')
    const initialFilters = {
        search: '',
        country: '',
        categoria: '',
        linea: '',
        sublinea: '',
        modality: '',
        indexation: ''
    }
    const [filters, setFilters] = useState(initialFilters)
    const [taxonomy, setTaxonomy] = useState({})

    // Load Data
    useEffect(() => {
        fetch('/congresses.json')
            .then(res => res.json())
            .then(jsonData => {
                if (jsonData.taxonomy) {
                    setTaxonomy(jsonData.taxonomy)
                }

                // Process data
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

    // Helpers
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


    // Filter Logic
    const filteredEvents = data.filter(event => {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = !filters.search ||
            event.evento?.toLowerCase().includes(searchLower) ||
            event.nombreCompleto?.toLowerCase().includes(searchLower) ||
            event.disciplina?.toLowerCase().includes(searchLower)

        const matchesCountry = !filters.country || event.pais === filters.country

        const matchesCategoria = !filters.categoria || (event.categoria && event.categoria.includes(filters.categoria))
        const matchesLinea = !filters.linea || (event.linea && event.linea.includes(filters.linea))
        const matchesSublinea = !filters.sublinea || (event.sublinea && event.sublinea.includes(filters.sublinea))

        const matchesModality = !filters.modality || event.modalidad === filters.modality

        const matchesIndexation = !filters.indexation ||
            (filters.indexation === 'Scopus' && event.isScopus) ||
            (filters.indexation === 'IEEE' && event.isIEEE) ||
            (filters.indexation === 'WoS' && event.isWoS)

        return matchesSearch && matchesCountry && matchesCategoria && matchesLinea && matchesSublinea && matchesModality && matchesIndexation
    })


    // Unique values for select options
    const countries = [...new Set(data.map(e => e.pais).filter(Boolean))].sort()

    // Categorias: all top-level keys from taxonomy
    const uniqueCategorias = Object.keys(taxonomy).sort()

    // Lineas: strictly from taxonomy[categoria] if selected
    const uniqueLineas = filters.categoria && taxonomy[filters.categoria]
        ? Object.keys(taxonomy[filters.categoria]).sort()
        : []

    // Sublineas: strictly from taxonomy[categoria][linea] if both selected
    const uniqueSublineas = filters.categoria && filters.linea && taxonomy[filters.categoria]?.[filters.linea]
        ? taxonomy[filters.categoria][filters.linea]
        : []

    // Stats
    const stats = {
        total: filteredEvents.length,
        urgent: filteredEvents.filter(e => e.deadlineDays !== null && e.deadlineDays > 0 && e.deadlineDays <= 30).length,
        countries: new Set(filteredEvents.map(e => e.pais).filter(Boolean)).size,
        scopus: filteredEvents.filter(e => e.isScopus).length
    }

    const handleResetFilters = () => {
        setFilters(initialFilters);
    }

    if (loading) return <div className="loader"><div className="spinner"></div></div>

    return (
        <>
            <Header />
            <Stats stats={stats} />

            <div className="container">
                <Filters
                    filters={filters}
                    setFilters={setFilters}
                    countries={countries}
                    categorias={uniqueCategorias}
                    lineas={uniqueLineas}
                    sublineas={uniqueSublineas}
                    onReset={handleResetFilters}
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

                {/* Content */}
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

export default App
