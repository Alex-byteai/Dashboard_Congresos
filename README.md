# Portal de Integridad Científica — IDIC

Dashboard del Instituto de Investigación Científica (Universidad de Lima) para la postulación informada de ponencias y publicaciones. Tiene una página de inicio y dos módulos:

- **Congresos Científicos**: directorio de congresos con fechas límite, modalidad, indexación prevista y el dictamen de integridad del IDIC para cada evento.
- **Revistas Científicas**: catálogo de revistas evaluadas con política de APC, cuartiles Scopus, líneas de investigación ULima e informes de idoneidad, además del registro de revistas observadas.

## Inicio rápido

Requisitos: Node.js 18 o superior y Python 3 (solo para regenerar los datos).

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

`npm run build` genera la versión de producción en `frontend/dist/` y `npm run preview` la sirve localmente.

## Funcionalidades

**Inicio**
- Indicadores: congresos evaluados, revistas en catálogo y revistas observadas (se calculan a partir de los JSON).
- Acceso al Protocolo de Idoneidad (PDF), al registro de revistas observadas y a la consulta por ISSN.

**Congresos**
- Filtro rápido por categoría ULima y por carrera (cada carrera equivale a su categoría).
- Filtros de estado (solo convocatorias abiertas / ocultar finalizados), país, modalidad y líneas de investigación.
- Vista de tarjetas agrupadas por estado (los finalizados se muestran bajo demanda) o línea de tiempo por mes.
- Modal de integridad: revisión por pares, indexación, organizadores, comité científico, programa, conflicto de intereses y dictamen.
- Panel de próximos cierres.

**Revistas**
- Los mismos filtros de categoría, carrera y líneas, además de tipo de revista, APC y disciplina.
- Cuartiles Scopus por subcategoría, CiteScore e informe de evaluación.
- La búsqueda acepta ISSN con o sin guion; si coincide con una revista observada, muestra un aviso con su informe.
- Consulta por ISSN: indica si la revista está en el catálogo, si está observada o, si no figura, enlaza al formulario de solicitud de evaluación.

**Móvil y tablet**
- Hasta 1024 px el panel derecho (filtros, próximos cierres, protocolo) se abre desde el botón "Filtros" de la barra superior.
- Hasta 768 px se usa la barra de navegación inferior, las categorías y carreras se deslizan en una sola fila y los modales se abren como hoja inferior.

## Datos

La aplicación lee tres archivos estáticos de `frontend/public/`:

| Archivo | Generado por | Fuente |
|---|---|---|
| `congresses.json` | `backend/scripts/process_congresos.py` | Google Sheets |
| `revistas.json` | `backend/scripts/process_revistas.py` | Google Sheets + Scopus |
| `revistas_observadas.json` | `backend/scripts/process_revistas.py` | Google Sheets |

Para regenerarlos se necesita la clave de la cuenta de servicio de Google en `backend/key/google_key.json` (esta carpeta no se versiona).

```bash
pip install -r backend/requirements.txt
python backend/scripts/process_congresos.py
python backend/scripts/process_revistas.py
```

También se puede usar `./update_data.sh` (Linux/macOS) o `backend/automation/run_automation.bat` (Windows). Este último, además, revisa los vencimientos de las revistas y envía alertas por correo; las credenciales se configuran en `backend/config/.env` a partir de `backend/config/.env.example`.

Los días restantes, el estado "Finalizado" y los contadores de convocatorias abiertas se calculan en el navegador con la fecha del día, así que no hace falta regenerar los datos para que se actualicen.

## Estructura del frontend

```
frontend/src/
├── App.jsx                  # Navegación entre el inicio y los módulos
├── index.css                # Estilos y design tokens
├── core/
│   ├── components/ModuleSelector.jsx   # Página de inicio
│   └── services/
│       ├── data.js          # Carga (con caché) de los JSON de /public
│       └── analytics.js     # Envío de eventos (opcional)
├── shared/
│   ├── constants.js         # URLs del protocolo y del formulario de solicitud
│   ├── taxonomy.js          # Categorías ULima y carreras
│   ├── hooks/               # useCatalogFilters, useBodyScrollLock
│   └── components/          # DashboardLayout, Modal, CategoryFilter, SidebarFilter,
│                            # StatsStrip, InfoPanel, EmptyState
└── modules/
    ├── congresos/           # CongresosModule, utils.js (fechas, urgencia, dictamen) y componentes
    └── revistas/            # RevistasModule, utils.js (APC) y componentes
```

Los dos módulos comparten el layout, el panel de filtros, los chips de categoría y carrera, la franja de indicadores y el hook de estado de filtros. La lógica propia de cada módulo vive en su `utils.js`.

## Analítica

`index.html` incluye la etiqueta de Google Analytics. Además, los clics a sitios de congresos se envían a un servicio propio si se define la variable:

```
VITE_ANALYTICS_URL=https://TU-SERVICIO-ANALYTICS.onrender.com
```

Los eventos se envían por `POST` a `<VITE_ANALYTICS_URL>/collect`. Si la variable no está definida no se envía nada. El servicio receptor no forma parte de este repositorio.

## Despliegue (Render)

Configura `frontend` como **Root Directory**, `npm install && npm run build` como **Build Command** y `dist` como **Publish Directory**.
