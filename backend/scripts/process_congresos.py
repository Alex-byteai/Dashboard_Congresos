import os
import re
import json
import gspread
import pandas as pd
from datetime import datetime
from pathlib import Path

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    HAS_ML = True
except ImportError:
    HAS_ML = False
    print("WARNING: scikit-learn not installed. Please install it with 'pip install scikit-learn'")

# Path to your service account key file
script_dir = os.path.dirname(os.path.abspath(__file__))
json_key_path = os.path.join(script_dir, '..', 'key', 'google_key.json')

# URL of the Google Sheet
SHEET_URL = 'https://docs.google.com/spreadsheets/d/16EQjwWFqkAoW4Y7moGEsEljkskgtSMhS-1TrFtaAU48/edit?pli=1&gid=2063995054#gid=2063995054'


def parse_date(date_val):
    """Parse various date formats to ISO format."""
    if pd.isna(date_val) or date_val is None or date_val == '':
        return None

    if isinstance(date_val, datetime):
        return date_val.strftime('%Y-%m-%d')

    date_str = str(date_val).strip()

    if '/' in date_str:
        try:
            parts = date_str.split('/')
            if len(parts) == 3:
                day, month, year = parts
                # Some sheets might have MM/DD/YYYY or DD/MM/YYYY. Assuming DD/MM/YYYY.
                return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
        except:
            pass

    if '-' in date_str and len(date_str) >= 10:
        return date_str[:10]

    return date_str

def get_deadline_status(deadline_str):
    """Calculate deadline urgency status"""
    if not deadline_str:
        return 'unknown'
    
    try:
        if isinstance(deadline_str, datetime):
            deadline_date = deadline_str
        else:
            deadline_date = datetime.fromisoformat(deadline_str)
        
        today = datetime.now()
        days_until = (deadline_date - today).days
        
        if days_until < 0:
            return 'passed'
        elif days_until <= 30:
            return 'urgent'
        elif days_until <= 90:
            return 'upcoming'
        else:
            return 'future'
    except:
        return 'unknown'

# ══════════════════════════════════════════════════════════════════════════════
#  CLASIFICACIÓN EN LÍNEAS PRIORITARIAS ULIMA (ver taxonomia_ulima.py)
#  Cada temática del congreso se compara (TF-IDF de n-gramas de caracteres) con el
#  nombre oficial de cada sublínea y con sus DESCRIPTORES: frases cortas tal como
#  suelen aparecer en los call for papers. Las sublíneas que acumulan más temáticas
#  son las del congreso.
# ══════════════════════════════════════════════════════════════════════════════

from taxonomia_ulima import SUBLINEAS, TAXONOMIA, validar_codigos

DESCRIPTORES = {
    # 1 Gobernanza, integridad, justicia y seguridad
    "1.1": ["gestión pública", "administración pública", "políticas públicas", "gobierno digital",
            "gobierno basado en datos", "gobierno electrónico", "calidad regulatoria",
            "evaluación de políticas", "instituciones y gobernanza"],
    "1.2": ["integridad", "transparencia", "anticorrupción", "control gubernamental", "fiscalización",
            "auditoría", "rendición de cuentas", "ética pública"],
    "1.3": ["justicia", "derecho", "sistema judicial", "justicia digital", "acceso a la justicia",
            "derechos humanos", "legislación", "derecho y tecnología"],
    "1.4": ["seguridad ciudadana", "crimen organizado", "criminología", "cibercrimen", "delito informático",
            "ciberdelincuencia", "forense digital", "inteligencia criminal", "fraude", "seguridad nacional"],

    # 2 Economía, finanzas, mercados y regulación
    "2.1": ["política económica", "política fiscal", "tributación", "impuestos", "informalidad",
            "formalización", "macroeconomía", "desarrollo económico", "economía"],
    "2.2": ["comercio exterior", "comercio internacional", "mercados", "cadenas globales de valor",
            "exportaciones", "globalización", "negocios internacionales"],
    "2.3": ["finanzas", "financiamiento", "inversión", "inclusión financiera", "banca", "fintech",
            "mercados financieros", "intermediación financiera", "contabilidad"],
    "2.4": ["gestión de riesgos", "regulación", "protección al consumidor", "competencia económica",
            "riesgo financiero", "cumplimiento normativo"],

    # 3 Transformación digital, datos e inteligencia tecnológica
    "3.1": ["cultura digital", "inclusión digital", "interacción humano-computadora", "interacción persona-computadora",
            "HCI", "experiencia de usuario", "UX y usabilidad", "diseño de interacción", "interfaces de usuario",
            "accesibilidad", "medios digitales", "realidad virtual", "realidad aumentada", "videojuegos",
            "juegos serios", "redes sociales", "comunicación digital", "multimedia"],
    "3.2": ["plataformas digitales", "interoperabilidad", "datos abiertos", "sistemas de información",
            "ingeniería de software", "arquitectura de software", "desarrollo de software", "computación en la nube",
            "big data", "bases de datos", "internet de las cosas", "IoT", "gestión de la información",
            "transformación digital", "blockchain", "redes de comunicaciones", "tecnologías de la información"],
    "3.3": ["inteligencia artificial", "aprendizaje automático", "machine learning", "aprendizaje profundo",
            "deep learning", "redes neuronales", "procesamiento del lenguaje natural", "visión por computadora",
            "visión computacional", "modelos generativos", "agentes inteligentes", "sistemas multiagente",
            "robótica", "ciencia de datos", "analítica de datos", "minería de datos", "ética en inteligencia artificial",
            "gobernanza de la inteligencia artificial", "MLOps"],
    "3.4": ["ciberseguridad", "seguridad informática", "seguridad de la información", "protección de datos",
            "privacidad", "criptografía", "detección de amenazas", "tecnologías avanzadas", "computación cuántica",
            "edge computing", "sistemas embebidos", "5G", "identidad digital", "confianza digital",
            "circuitos y dispositivos electrónicos", "telecomunicaciones"],

    # 4 Gestión, innovación y competitividad empresarial
    "4.1": ["gestión", "administración de empresas", "gestión del talento", "recursos humanos", "liderazgo",
            "gestión del conocimiento", "comportamiento organizacional", "responsabilidad social empresarial",
            "gobierno corporativo", "gestión organizacional", "gestión de proyectos", "dirección de proyectos",
            "gestión estratégica"],
    "4.2": ["productividad", "innovación", "automatización", "manufactura avanzada", "industria 4.0",
            "industria 5.0", "manufactura", "sistemas de control", "control de procesos", "mecatrónica",
            "ingeniería industrial", "optimización de procesos", "investigación de operaciones",
            "gestión de la innovación", "gemelos digitales", "materiales", "nuevos materiales", "ciencia de materiales"],
    "4.3": ["emprendimiento", "mipyme", "pymes", "startups", "escalamiento", "articulación productiva",
            "modelos de negocio", "innovación empresarial"],
    "4.4": ["marketing", "comportamiento del consumidor", "calidad", "competitividad", "gestión de la calidad",
            "marketing digital", "branding"],
    "4.5": ["cadena de suministro", "cadenas de suministro", "gestión de operaciones", "infraestructura productiva",
            "abastecimiento"],

    # 5 Educación, desarrollo humano e inclusión social
    "5.1": ["desigualdad", "vulnerabilidad", "inclusión social", "integración social", "pobreza", "género",
            "migración", "diversidad", "equidad", "sociedad"],
    "5.2": ["educación", "formación", "competencias", "desarrollo del talento", "educación en ingeniería",
            "currículo", "acreditación", "evaluación educativa", "enseñanza", "aprendizaje en línea",
            "tecnología educativa", "educación superior", "docencia"],
    "5.3": ["desarrollo humano", "curso de vida", "aprendizaje", "convivencia", "infancia", "adolescencia",
            "familia", "envejecimiento"],
    "5.4": ["neurociencia", "cognición", "comportamiento", "ciencias cognitivas", "psicología",
            "arquitecturas cognitivas", "razonamiento", "percepción"],

    # 6 Salud integral, bienestar e innovación sanitaria
    "6.1": ["salud", "prevención", "diagnóstico", "vigilancia epidemiológica", "innovación en salud",
            "salud pública", "medicina", "biomedicina", "dispositivos médicos", "ensayos clínicos", "bioinformática",
            "bioseñales", "imagenología médica"],
    "6.2": ["salud mental", "bienestar", "bienestar psicosocial", "calidad de vida", "estrés", "psicología clínica"],
    "6.3": ["servicios de salud", "salud digital", "telemedicina", "gestión hospitalaria", "acceso a la salud",
            "informática médica", "interoperabilidad clínica", "sistemas de información en salud",
            "seguridad del paciente"],

    # 7 Territorio, ciudades, infraestructura y movilidad sostenible
    "7.1": ["territorio", "infraestructura", "desarrollo urbano", "urbanismo", "ciudades inteligentes",
            "ciudades sostenibles", "movilidad", "transporte", "vivienda", "espacio público", "ingeniería civil",
            "construcción", "estructuras", "arquitectura", "planificación urbana", "geotecnia"],
    "7.2": ["logística", "distribución", "transporte de carga", "última milla"],
    "7.3": ["turismo", "turismo sostenible", "hospitalidad", "patrimonio"],

    # 8 Ambiente, recursos naturales, energía y cambio climático
    "8.1": ["biodiversidad", "calidad ambiental", "contaminación", "ecología", "conservación", "medio ambiente",
            "gestión ambiental", "ingeniería ambiental", "teledetección", "recursos naturales"],
    "8.2": ["agua", "saneamiento", "recursos hídricos", "hidrología", "tratamiento de aguas", "gestión de cuencas",
            "riego"],
    "8.3": ["energía", "energías renovables", "minería", "transición energética", "eficiencia energética",
            "sistemas productivos sostenibles", "manufactura verde", "energía solar", "redes eléctricas inteligentes",
            "generación distribuida", "microrredes", "sistemas eléctricos de potencia"],
    "8.4": ["economía circular", "cambio climático", "resiliencia", "gestión del riesgo de desastres",
            "adaptación climática", "residuos", "reciclaje", "sostenibilidad", "modelos climáticos"],

    # 9 Agroindustria, alimentación y bioeconomía
    "9.1": ["bioeconomía", "biotecnología", "bioprocesos", "biomateriales", "genética"],
    "9.2": ["agricultura", "agroindustria", "productividad rural", "agricultura de precisión", "agronomía",
            "desarrollo rural"],
    "9.3": ["nutrición", "seguridad alimentaria", "alimentos", "alimentación", "ciencia de los alimentos"],
}

validar_codigos('DESCRIPTORES', DESCRIPTORES)

# Texto de referencia → código de sublínea
TAXONOMY_FLAT = [
    {'codigo': codigo, 'text': texto}
    for codigo, (_, sublinea) in SUBLINEAS.items()
    for texto in [sublinea, *DESCRIPTORES.get(codigo, [])]
]

MIN_SCORE = 0.5       # similitud mínima para que una temática cuente
MAX_SUBLINEAS = 4     # sublíneas por congreso
MIN_SHARE = 0.25      # una sublínea debe sumar al menos este % del puntaje de la mejor

vectorizer = None
taxonomy_tfidf = None

def init_ml_model():
    global vectorizer, taxonomy_tfidf
    if not HAS_ML:
        return
    if vectorizer is None:
        print("Inicializando modelo de Machine Learning (TF-IDF Ligero)...")
        # Usamos character n-grams para ser robustos ante variaciones de palabras y morfología
        vectorizer = TfidfVectorizer(analyzer='char_wb', ngram_range=(3, 5))
        taxonomy_tfidf = vectorizer.fit_transform([item['text'].lower() for item in TAXONOMY_FLAT])

def split_tematicas(tematicas_raw):
    """Separa por ';' o saltos de línea; si queda un solo texto, también por comas."""
    partes = [t.strip() for t in re.split(r'[;\n]', str(tematicas_raw)) if t.strip()]
    if len(partes) == 1 and ',' in partes[0]:
        partes = [t.strip() for t in partes[0].split(',') if t.strip()]
    # Quita numeraciones del tipo "1. " y el cierre "entre otras."
    partes = [re.sub(r'^\d+[.)]\s*|\s*(y\s+)?entre otr[oa]s\.?$', '', t, flags=re.IGNORECASE) for t in partes]
    return [t.lower() for t in partes if t]

def classify_theme_with_ml(tematicas_raw):
    """
    Toma un string de temáticas (separadas por ';', saltos de línea o comas) y devuelve
    (lineas, sublineas) en el orden oficial, según las sublíneas que más temáticas acumulan.
    """
    if not tematicas_raw or pd.isna(tematicas_raw) or str(tematicas_raw).strip() in ('', 'nan', 'None'):
        return [], []

    tematicas = split_tematicas(tematicas_raw)
    if not tematicas or not HAS_ML or vectorizer is None:
        return [], []

    cosine_scores = cosine_similarity(vectorizer.transform(tematicas), taxonomy_tfidf)

    # Cada temática vota por la sublínea de su mejor coincidencia
    puntaje = {}
    for scores in cosine_scores:
        best = scores.argmax()
        if scores[best] >= MIN_SCORE:
            codigo = TAXONOMY_FLAT[best]['codigo']
            puntaje[codigo] = puntaje.get(codigo, 0) + scores[best]

    if not puntaje:
        return [], []

    tope = max(puntaje.values())
    elegidas = [c for c, p in sorted(puntaje.items(), key=lambda x: x[1], reverse=True)
                if p >= tope * MIN_SHARE][:MAX_SUBLINEAS]

    orden = list(SUBLINEAS)
    elegidas.sort(key=orden.index)
    lineas = list(dict.fromkeys(SUBLINEAS[c][0] for c in elegidas))
    return lineas, [SUBLINEAS[c][1] for c in elegidas]


def get_named(row, col_name):
    """Helper to get a value safely from a pandas series (row)"""
    if col_name in row.index:
        val = row[col_name]
        return None if pd.isna(val) else val
    return None

def process_google_sheet_to_json(output_path):
    """Main processing function using Google Sheets API via gspread"""
    
    print(f"Authenticating and accessing Google Sheet...")
    if not os.path.exists(json_key_path):
        raise FileNotFoundError(f"Google key file not found at {json_key_path}")
        
    gc = gspread.service_account(filename=json_key_path)
    
    try:
        spreadsheet = gc.open_by_url(SHEET_URL)
        worksheet = spreadsheet.worksheet('Registro de congresos_validación de integridad')
        data = worksheet.get_all_values()
        
        if not data:
            raise ValueError("Worksheet is empty")
            
        df = pd.DataFrame(data[1:], columns=data[0])
        df.columns = df.columns.str.strip()
        print(f"Data loaded successfully. Found {len(df)} rows.")
        
    except Exception as e:
        print(f"Error reading Google Sheet: {e}")
        return
        
    init_ml_model()
    
    congresses = []
    countries = set()
    modalities = {}

    for idx, row in df.iterrows():
        evento = get_named(row, 'Evento')
        nombre = get_named(row, 'Nombre Completo')

        if not evento and not nombre:
            continue

        fecha_inicio = parse_date(get_named(row, 'Fecha inicio'))
        fecha_fin    = parse_date(get_named(row, 'Fecha fin'))
        deadline     = parse_date(get_named(row, 'Deadline'))

        ciudad    = str(get_named(row, 'Ciudad') or '')
        pais      = str(get_named(row, 'Pais') or '')
        modalidad = str(get_named(row, 'Modalidad') or '').strip()
        if modalidad.lower() in ('hibrido', 'híbrido'):
            modalidad = 'Híbrido'

        if pais: countries.add(pais)
        if modalidad: modalities[modalidad] = modalities.get(modalidad, 0) + 1

        # MACHINE LEARNING CLASSIFICATION
        tematica_text = get_named(row, 'Tematica')
        if not tematica_text:
             tematica_text = get_named(row, 'Temática')

        lineas, sublineas = classify_theme_with_ml(tematica_text)

        # Integrity Parameters
        integridad = {
            'organizadores': str(get_named(row, 'Organizadores | Patrocinadores') or ''),
            'comite_cientifico': str(get_named(row, 'Comité científico') or ''),
            'programa_temas': str(get_named(row, 'Programa | Temas') or ''),
            'revision_pares': str(get_named(row, 'Revisión por pares') or ''),
            'indexacion_bd': str(get_named(row, 'Indexación en BD') or ''),
            'conflicto_intereses': str(get_named(row, 'Conflicto de intereses') or ''),
            'observaciones': str(get_named(row, 'Observaciones') or ''),
            'conclusiones': str(get_named(row, 'Conclusiones') or '')
        }

        congress = {
            'id': idx + 1,
            'evento': str(evento or ''),
            'nombreCompleto': str(nombre or ''),
            'disciplina': str(get_named(row, 'Disciplina') or ''),
            'linea': lineas,
            'sublinea': sublineas,
            'fechaInicio': fecha_inicio,
            'fechaFin': fecha_fin,
            'lugar': str(get_named(row, 'Lugar') or ''),
            'ciudad': ciudad,
            'pais': pais,
            'modalidad': modalidad,
            'deadline': deadline,
            'deadlineStatus': get_deadline_status(deadline),
            'publicacion': str(get_named(row, 'Publicación') or ''),
            'enlace': str(get_named(row, 'Enlace') or ''),
            'integridad': integridad
        }

        congresses.append(congress)

    
    print(f"Processed {len(congresses)} congresses")
    
    # Create output structure
    output_data = {
        'metadata': {
            'totalCongresses': len(congresses),
            'lastUpdated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'version': '2.2'
        },
        'taxonomy': TAXONOMIA,
        'congresses': congresses
    }
    
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully created: {output_path}")
    print(f"Statistics:")
    print(f"   - Total congresses: {len(congresses)}")
    print(f"   - Countries: {len(countries)}")
    print(f"   - Modalities: {modalities}")
    
    return output_data

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.join(script_dir, '..', '..')
    json_file = os.path.join(root_dir, 'frontend', 'public', 'congresses.json')
    
    try:
        process_google_sheet_to_json(json_file)
        print("\nData processing complete!")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
