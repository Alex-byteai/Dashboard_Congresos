import os
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


# Full taxonomy: Categoría → Línea → [Sublíneas]
FULL_TAXONOMY = {
    'INNOVACIÓN Y TECNOLOGÍA DIGITAL': {
        'Inteligencia artificial y computación avanzada': [
            'Machine learning y deep learning',
            'Procesamiento de lenguaje natural',
            'Visión computacional',
            'Sistemas autónomos y robótica',
        ],
        'Transformación digital': [
            'Tecnologías emergentes',
            'Ciberseguridad y privacidad',
            'Internet de las cosas (IoT)',
            'Computación cuántica',
            'Diseño y construcción virtual',
        ],
        'Experiencia digital humana': [
            'Interacción humano-computadora',
            'Realidad virtual y aumentada',
            'Diseño de interfaces adaptativas',
        ],
    },
    'DESARROLLO SOSTENIBLE Y MEDIOAMBIENTE': {
        'Sostenibilidad y cambio climático': [
            'Energías renovables',
            'Economía circular',
            'Gestión sostenible de recursos',
            'Adaptación al cambio climático',
        ],
        'Ciudades inteligentes y sostenibles': [
            'Urbanismo sostenible',
            'Movilidad urbana',
            'Infraestructura sostenible',
            'Gestión inteligente de recursos',
        ],
        'Tecnología y ecosistemas': [
            'Tecnologías limpias',
            'Biodiversidad y conservación',
            'Gestión de residuos',
            'Materiales avanzados',
        ],
    },
    'SOCIEDAD Y COMPORTAMIENTO HUMANO': {
        'Bienestar y desarrollo humano': [
            'Salud mental y bienestar',
            'Educación, desarrollo cognitivo y socioafectivo',
            'Comportamiento social',
            'Mujer, cultura y sociedad',
            'Pobreza e informalidad',
        ],
        'Comunicación y cultura digital': [
            'Medios digitales y sociedad',
            'Comunicación intercultural',
            'Narrativas transmedia',
            'Comportamiento digital',
        ],
        'Ética, gobernanza y responsabilidad social': [
            'Ética y gobernanza',
            'Responsabilidad social',
            'Derechos humanos y tecnología',
        ],
    },
    'GESTIÓN Y ECONOMÍA DEL CONOCIMIENTO': {
        'Innovación empresarial': [
            'Modelos de negocio digitales',
            'Emprendimiento tecnológico',
            'Gestión de la innovación',
            'Transformación organizacional',
        ],
        'Economía digital': [
            'Fintech y servicios financieros',
            'Mercados globales',
            'Análisis de datos económicos',
            'Economía de plataformas',
        ],
        'Gestión del conocimiento': [
            'Gestión del capital intelectual',
            'Aprendizaje organizacional',
            'Transferencia de conocimiento',
            'Inteligencia de negocios',
        ],
    },
}

# --- ML SETUP ---
# Flatten taxonomy for embeddings
TAXONOMY_FLAT = []
for cat, lineas in FULL_TAXONOMY.items():
    for linea, sublineas in lineas.items():
        for sublinea in sublineas:
            TAXONOMY_FLAT.append({
                'categoria': cat,
                'linea': linea,
                'sublinea': sublinea,
                'text': f"{linea} {sublinea}"
            })

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
        
        taxonomy_texts = [item['text'] for item in TAXONOMY_FLAT]
        taxonomy_tfidf = vectorizer.fit_transform(taxonomy_texts)

def classify_theme_with_ml(tematicas_raw):
    """
    Toma un string de temáticas (e.g. "Ingeniería de Software; Ciencia de Datos")
    y devuelve listas únicas de categorias, lineas y sublineas usando TF-IDF + Similitud del Coseno.
    """
    if not tematicas_raw or pd.isna(tematicas_raw) or str(tematicas_raw).strip() in ('', 'nan', 'None'):
        return [], [], []
    
    tematicas = [t.strip() for t in str(tematicas_raw).split(';') if t.strip()]
    
    if not tematicas or not HAS_ML or vectorizer is None:
        return [], [], []
        
    categorias_set = set()
    lineas_set = set()
    sublineas_set = set()
    
    # Predecir todo el bloque de temáticas juntas
    tematicas_tfidf = vectorizer.transform(tematicas)
    cosine_scores = cosine_similarity(tematicas_tfidf, taxonomy_tfidf)
    
    matches = []
    
    for i in range(len(tematicas)):
        # Encontrar la mejor coincidencia para la temática actual
        best_match_idx = cosine_scores[i].argmax()
        best_score = cosine_scores[i][best_match_idx]
        
        # Opcional: solo agregar si el score de similitud es mayor a cierto umbral
        if best_score > 0.35: # AUMENTADO LA RIGUROSIDAD: de 0.05 a 0.35
            best_taxonomy = TAXONOMY_FLAT[best_match_idx]
            matches.append((best_score, best_taxonomy))
            
    # Ordenar los matches por score (mayor similitud primero)
    matches.sort(key=lambda x: x[0], reverse=True)
    
    # Limitar el número máximo de sublíneas únicas a asignar (ej. top 4 más relevantes)
    MAX_CATEGORIES = 4
    added_sublineas = set()
    
    for score, taxonomy in matches:
        if taxonomy['sublinea'] not in added_sublineas:
            categorias_set.add(taxonomy['categoria'])
            lineas_set.add(taxonomy['linea'])
            sublineas_set.add(taxonomy['sublinea'])
            added_sublineas.add(taxonomy['sublinea'])
            
            if len(added_sublineas) >= MAX_CATEGORIES:
                break
        
    return sorted(list(categorias_set)), sorted(list(lineas_set)), sorted(list(sublineas_set))


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
        modalidad = str(get_named(row, 'Modalidad') or '')

        if pais: countries.add(pais)
        if modalidad: modalities[modalidad] = modalities.get(modalidad, 0) + 1

        # MACHINE LEARNING CLASSIFICATION
        tematica_text = get_named(row, 'Tematica')
        if not tematica_text:
             tematica_text = get_named(row, 'Temática')

        categorias, lineas, sublineas = classify_theme_with_ml(tematica_text)

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
            'categoria': categorias,
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
        'taxonomy': FULL_TAXONOMY,
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
    json_file = os.path.join(root_dir, 'public', 'congresses.json')
    
    try:
        process_google_sheet_to_json(json_file)
        print("\nData processing complete!")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
