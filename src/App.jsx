import { useState } from 'react'
import { IconContext } from '@phosphor-icons/react'

import ModuleSelector from './core/components/ModuleSelector'
import CongresosModule from './modules/congresos/CongresosModule'
import RevistasModule from './modules/revistas/RevistasModule'

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

    return (
        <IconContext.Provider value={{ weight: 'bold' }}>
            {renderModule()}
        </IconContext.Provider>
    )
}

export default App
