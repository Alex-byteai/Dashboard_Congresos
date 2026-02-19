# Dashboard de Congresos - Guía de Usuario

## 📋 Descripción

Dashboard profesional e interactivo para la visualización y gestión de congresos académicos. Incluye filtros avanzados, visualizaciones de datos, y una innovadora vista de globo 3D interactivo.

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js (v16 o superior)
- Python 3.x
- npm o yarn

### Instalación

```bash
# 1. Instalar dependencias de Node.js
npm install

# 2. Instalar dependencias de Python
pip3 install openpyxl

# 3. Procesar datos del Excel
python3 backend/data_processor.py

# 4. Iniciar el servidor de desarrollo
npm run dev
```

El dashboard estará disponible en `http://localhost:3000`

## 📊 Características Principales

### 1. **Filtros Interactivos**
- **Búsqueda por texto**: Busca por nombre, ciudad, país, o disciplina
- **Filtro por país**: Selecciona uno o múltiples países
- **Filtro por modalidad**: Presencial, Híbrido, o Virtual
- Los filtros se pueden combinar y limpiar fácilmente

### 2. **Tarjetas de Estadísticas**
- Total de congresos
- Deadlines urgentes (<30 días)
- Próximos deadlines (30-90 días)
- Número de países
- Distribución por modalidad

### 3. **Globo 3D Interactivo** 🌍 (WOW Feature)
- Visualización geográfica de todos los congresos
- Marcadores interactivos con código de colores:
  - 🔴 Rojo: Deadline urgente
  - 🟡 Amarillo: Deadline próximo
  - 🟢 Verde: Deadline futuro
- Rotación automática
- Zoom y navegación con el mouse
- Tooltips al pasar el cursor
- Panel de detalles al hacer clic en un marcador

### 4. **Gráficos Analíticos**
- **Top 10 Países**: Gráfico de barras con los países con más congresos
- **Distribución por Modalidad**: Gráfico circular
- **Estado de Deadlines**: Gráfico circular con urgencia de deadlines

### 5. **Tabla de Congresos**
- Ordenamiento por columnas (clic en encabezados)
- Filas expandibles con información detallada
- Enlaces directos a sitios web de congresos
- Badges de estado visual

## 🔄 Actualización de Datos

### Método Simple (Recomendado)

1. Reemplaza el archivo `List_congreso.xlsx` con tu nueva versión
2. Ejecuta el script de actualización:

```bash
./update_data.sh
```

O manualmente:

```bash
python3 backend/data_processor.py
```

3. Recarga el navegador (F5)

### Agregar Nuevos Congresos

Simplemente agrega nuevas filas al archivo Excel `List_congreso.xlsx` manteniendo el mismo formato:

- **Evento**: Nombre corto del congreso
- **Nombre Completo**: Nombre completo del evento
- **Disciplina**: Área de conocimiento
- **Area**: Área específica
- **Subarea**: Subárea
- **Etiquetas**: Palabras clave separadas por comas
- **Fecha inicio**: Formato DD/MM/YYYY
- **Fecha fin**: Formato DD/MM/YYYY
- **Lugar**: Ubicación completa
- **Ciudad**: Ciudad
- **Pais**: País
- **Modalidad**: Presencial, Hibrido, o Virtual
- **Deadline**: Fecha límite de envío
- **Publicación**: Tipo de publicación
- **Enlace**: URL del congreso

## 🎨 Características de Diseño

- **Tema oscuro premium** con efectos glassmorphic
- **Animaciones suaves** en todas las interacciones
- **Diseño responsive** para presentaciones en diferentes pantallas
- **Gradientes vibrantes** y efectos de iluminación
- **Tipografía moderna** (Inter y Outfit)

## 💡 Consejos para Presentaciones

1. **Modo pantalla completa**: Presiona F11 en el navegador
2. **Interacción con el globo**: 
   - Arrastra para rotar
   - Scroll para zoom
   - Clic en marcadores para ver detalles
3. **Demostración de filtros**: Muestra cómo los filtros actualizan todas las visualizaciones en tiempo real
4. **Tabla expandible**: Haz clic en cualquier fila para mostrar información detallada

## 🛠️ Solución de Problemas

### El globo 3D no se muestra
- Asegúrate de que tu navegador soporte WebGL
- Prueba en Chrome o Firefox (recomendado)
- Verifica la consola del navegador para errores

### Los datos no se actualizan
- Verifica que el archivo `public/congresses.json` existe
- Ejecuta nuevamente `python3 backend/data_processor.py`
- Limpia la caché del navegador (Ctrl+Shift+R)

### Error al instalar dependencias
- Verifica que tienes Node.js v16 o superior: `node --version`
- Intenta eliminar `node_modules` y ejecutar `npm install` nuevamente

## 📁 Estructura del Proyecto

```
dashboard_lcr/
├── backend/
│   ├── data_processor.py      # Procesador de Excel a JSON
│   └── requirements.txt        # Dependencias Python
├── public/
│   └── congresses.json         # Datos procesados (generado)
├── src/
│   ├── components/             # Componentes React
│   │   ├── Header.jsx
│   │   ├── FilterPanel.jsx
│   │   ├── StatsCards.jsx
│   │   ├── CongressTable.jsx
│   │   ├── Charts.jsx
│   │   └── GlobeVisualization.jsx
│   ├── App.jsx                 # Componente principal
│   ├── main.jsx                # Punto de entrada
│   └── index.css               # Estilos globales
├── List_congreso.xlsx          # Datos fuente
├── update_data.sh              # Script de actualización
├── package.json                # Dependencias Node.js
└── README.md                   # Esta guía

```

## 🎯 Próximos Pasos

Para mejorar aún más el dashboard, considera:

1. **Exportar datos**: Agregar botón para exportar datos filtrados a Excel/PDF
2. **Notificaciones**: Alertas para deadlines próximos
3. **Favoritos**: Marcar congresos de interés
4. **Calendario**: Vista de calendario con todos los eventos
5. **Comparación**: Comparar múltiples congresos lado a lado

## 📞 Soporte

Para cualquier problema o sugerencia, contacta al equipo de desarrollo.

---

**Versión**: 1.0  
**Última actualización**: Febrero 2026
