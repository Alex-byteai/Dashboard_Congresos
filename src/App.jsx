import { useState } from 'react'
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

import ModuleSelector from './app/components/ModuleSelector'
import CongresosModule from './modules/congresos/CongresosModule'
import RevistasModule from './modules/revistas/RevistasModule'

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

// ─── App Root: Hub de Módulos ─────────────────────────────────────────────────
function App() {
    const [activeModule, setActiveModule] = useState(null) // null = Hub selector

    // Para añadir un nuevo módulo en el futuro:
    // 1. Crea su componente (ej: RevistasModule)
    // 2. Agrega un objeto a MODULES en ModuleSelector.jsx
    // 3. Agrega un case aquí abajo
    const renderModule = () => {
        const handleBack = () => setActiveModule(null)
        switch (activeModule) {
            case 'congresos':
                return <CongresosModule onBack={handleBack} />
            case 'revistas':
                return <RevistasModule onBack={handleBack} />
            default:
                return <ModuleSelector onSelectModule={setActiveModule} />
        }
    }

    return renderModule()
}

export default App
