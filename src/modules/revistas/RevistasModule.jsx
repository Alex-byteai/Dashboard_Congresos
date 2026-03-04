import { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, PieChart, Table } from 'lucide-react'

import Header from '../../shared/components/Header'
import RevistasStatsCards from './components/RevistasStatsCards'
import RevistasFilterPanel from './components/RevistasFilterPanel'
import RevistasList from './components/RevistasList'
import RevistasTable from './components/RevistasTable'
import RevistasCharts from './components/RevistasCharts'

export default function RevistasModule({ onBack }) {
    const [loading, setLoading] = useState(true)
    const [revistas, setRevistas] = useState([])
    const [facets, setFacets] = useState({ publishers: [], enfoques: [], disciplinas: [] })
    const [activeTab, setActiveTab] = useState('cards')

    const initialFilters = {
        search: '',
        publisher: '',
        enfoque: '',
        disciplina: ''
    }
    const [filters, setFilters] = useState(initialFilters)

    useEffect(() => {
        fetch('/revistas.json')
            .then(res => res.json())
            .then(jsonData => {
                setRevistas(jsonData.revistas || [])
                setFacets(jsonData.facets || { publishers: [], enfoques: [], disciplinas: [] })
                setLoading(false)
            })
            .catch(err => {
                console.error('Error loading revistas:', err)
                setLoading(false)
            })
    }, [])

    const filtered = useMemo(() => {
        const q = filters.search.toLowerCase().trim()
        return revistas.filter(r => {
            const matchesSearch = !q ||
                r.journal?.toLowerCase().includes(q) ||
                r.publisher?.toLowerCase().includes(q) ||
                r.issn?.toLowerCase().includes(q) ||
                r.eissn?.toLowerCase().includes(q) ||
                r.enfoque?.toLowerCase().includes(q)

            const matchesPublisher = !filters.publisher || r.publisher === filters.publisher
            const matchesEnfoque = !filters.enfoque || r.enfoque === filters.enfoque
            const matchesDisciplina = !filters.disciplina || (r.disciplinas || []).includes(filters.disciplina)

            return matchesSearch && matchesPublisher && matchesEnfoque && matchesDisciplina
        })
    }, [filters, revistas])

    const stats = useMemo(() => {
        return {
            total: filtered.length,
            publishers: new Set(filtered.map(r => r.publisher).filter(Boolean)).size,
            disciplinas: new Set(filtered.flatMap(r => r.disciplinas || []).filter(Boolean)).size
        }
    }, [filtered])

    if (loading) return <div className="loader"><div className="spinner"></div></div>

    return (
        <>
            <Header onBack={onBack} moduleName="Revistas" />
            <RevistasStatsCards stats={stats} />

            <div className="container">
                <RevistasFilterPanel
                    filters={filters}
                    setFilters={setFilters}
                    publishers={facets.publishers || []}
                    enfoques={facets.enfoques || []}
                    disciplinas={facets.disciplinas || []}
                    onReset={() => setFilters(initialFilters)}
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
                        className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stats')}
                    >
                        <PieChart size={18} />
                        Estadísticas
                    </button>
                </div>

                {activeTab === 'cards' && (
                    <RevistasList revistas={filtered} />
                )}

                {activeTab === 'table' && (
                    <RevistasTable revistas={filtered} />
                )}

                {activeTab === 'stats' && (
                    <RevistasCharts revistas={filtered} />
                )}
            </div>
        </>
    )
}
