import gspread
import pandas as pd

import os
# Path to your service account key file
script_dir = os.path.dirname(os.path.abspath(__file__))
json_key_path = os.path.join(script_dir, '..', 'key', 'google_key.json')

# Authenticate with gspread using the service account key
gc = gspread.service_account(filename=json_key_path)

# URL of the Google Sheet
sheet_url = 'https://docs.google.com/spreadsheets/d/1CjnN-TBH6R3VSQZQqSEqR2a8q1-1GOqjHPGzIkw2n7c/edit?gid=0#gid=0'

# Open the sheet by URL
try:
    spreadsheet = gc.open_by_url(sheet_url)
    print(f'Successfully opened spreadsheet: {spreadsheet.title}')

    # Select the 'Revistas' worksheet
    worksheet = spreadsheet.worksheet('Revistas')
    print(f'Successfully selected worksheet: {worksheet.title}')

    # Get all values from the worksheet as a list of lists
    data = worksheet.get_all_values()

    # Convert to pandas DataFrame
    if data:
        df = pd.DataFrame(data[1:], columns=data[0]) # First row as headers
        df.columns = df.columns.str.strip()
        print('Data loaded into pandas DataFrame.')
    else:
        df = pd.DataFrame()
        print('Worksheet is empty.')

except gspread.exceptions.SpreadsheetNotFound:
    print(f'Error: Spreadsheet not found at URL: {sheet_url}. Please check the URL and permissions.')
except gspread.exceptions.WorksheetNotFound:
    print(f"Error: Worksheet 'Revistas' not found. Please check the worksheet name.")
except Exception as e:
    print(f'An unexpected error occurred: {e}')

# Display the first 5 rows of the DataFrame
if 'df' in locals() and not df.empty:
    print(df.head())
else:
    print('DataFrame is empty or not created.')

# Filter the DataFrame based on the specified conditions
filtered_df = df[(df['Estado'] == 'Vigente') & (df['Conclusión'].str.contains('No presenta indicios de malas prácticas', na=False))]

def _journal_key(row):
    def normalize_identifier(value):
        if pd.isna(value) or str(value).strip() in ('', '-', 'nan'):
            return None
        return str(value).strip()

    e_issn = normalize_identifier(row.get('E-ISSN'))
    issn = normalize_identifier(row.get('ISSN'))
    if e_issn:
        return f'eissn:{e_issn}'
    if issn:
        return f'issn:{issn}'
    name = str(row.get('Nombre de la revista / fuente', '')).strip().casefold()
    return f'name:{name}'

def deduplicate_reviews(reviews):
    if reviews.empty:
        return reviews

    reviews = reviews.copy()
    reviews['_fecha_emision_sort'] = pd.to_datetime(
        reviews['Fecha de emisión'], dayfirst=True, errors='coerce'
    )
    reviews['_journal_key'] = reviews.apply(_journal_key, axis=1)
    duplicate_count = len(reviews) - reviews['_journal_key'].nunique()
    reviews = (
        reviews.sort_values('_fecha_emision_sort', ascending=False, na_position='last')
        .drop_duplicates('_journal_key', keep='first')
        .drop(columns=['_fecha_emision_sort', '_journal_key'])
    )
    if duplicate_count:
        print(f'Se descartaron {duplicate_count} revisiones antiguas de revistas duplicadas.')
    return reviews

filtered_df = deduplicate_reviews(filtered_df)

# Display the filtered DataFrame
if not filtered_df.empty:
    print(filtered_df)
else:
    print('No magazines match the specified criteria.')


# ══════════════════════════════════════════════════════════════════════════════
#  MAPEO SCOPUS → LÍNEAS PRIORITARIAS ULIMA
#  Cada subárea Scopus (ASJC) se traduce a uno o más códigos de sublínea
#  "línea.sublínea" (ver taxonomia_ulima.py):
#    1 Gobernanza, integridad, justicia y seguridad
#    2 Economía, finanzas, mercados y regulación
#    3 Transformación digital, datos e inteligencia tecnológica
#    4 Gestión, innovación y competitividad empresarial
#    5 Educación, desarrollo humano e inclusión social
#    6 Salud integral, bienestar e innovación sanitaria
#    7 Territorio, ciudades, infraestructura y movilidad sostenible
#    8 Ambiente, recursos naturales, energía y cambio climático
#    9 Agroindustria, alimentación y bioeconomía
#  AREA_TO_SUBLINEAS da el valor por defecto de cada área; SCOPUS_TO_SUBLINEAS
#  lo reemplaza para subáreas concretas ([] = sin línea). Humanidades, Química,
#  Física y Multidisciplinary no tienen equivalente: esas revistas solo quedan
#  clasificadas si alguna otra de sus subáreas sí lo tiene.
# ══════════════════════════════════════════════════════════════════════════════

from taxonomia_ulima import SUBLINEAS, TAXONOMIA, validar_codigos

AREA_TO_SUBLINEAS = {
    "Agricultural and Biological Sciences":          ["9.2"],
    "Biochemistry, Genetics and Molecular Biology":  ["9.1"],
    "Business, Management and Accounting":           ["4.1"],
    "Chemical Engineering":                          ["4.2"],
    "Computer Science":                              ["3.2"],
    "Decision Sciences":                             ["4.2"],
    "Dentistry":                                     ["6.1"],
    "Earth and Planetary Sciences":                  ["8.4"],
    "Economics, Econometrics and Finance":           ["2.1"],
    "Energy":                                        ["8.3"],
    "Engineering":                                   ["4.2"],
    "Environmental Science":                         ["8.1"],
    "Health Professions":                            ["6.1"],
    "Immunology and Microbiology":                   ["6.1"],
    "Materials Science":                             ["4.2"],
    "Mathematics":                                   ["3.3"],
    "Medicine":                                      ["6.1"],
    "Neuroscience":                                  ["5.4"],
    "Nursing":                                       ["6.1"],
    "Pharmacology, Toxicology and Pharmaceutics":    ["6.1"],
    "Psychology":                                    ["5.4"],
    "Social Sciences":                               ["5.1"],
    "Veterinary":                                    ["9.2"],
}

SCOPUS_TO_SUBLINEAS = {
    # ── Agricultural and Biological Sciences ──────────────────────────────────
    "Aquatic Science":                                    ["8.1"],
    "Ecology, Evolution, Behavior and Systematics":       ["8.1"],
    "Food Science":                                       ["9.3"],
    "Forestry":                                           ["8.1"],

    # ── Arts and Humanities ───────────────────────────────────────────────────
    "Language and Linguistics":                           ["5.2"],

    # ── Biochemistry, Genetics and Molecular Biology ──────────────────────────
    "Ageing":                                             ["6.1"],
    "Cancer Research":                                    ["6.1"],
    "Clinical Biochemistry":                              ["6.1"],
    "Endocrinology":                                      ["6.1"],
    "Molecular Medicine":                                 ["6.1"],
    "Physiology":                                         ["6.1"],

    # ── Business, Management and Accounting ───────────────────────────────────
    "Accounting":                                         ["2.3"],
    "Business and International Management":              ["4.1", "2.2"],
    "Management Information Systems":                     ["3.2"],
    "Management of Technology and Innovation":            ["4.2"],
    "Marketing":                                          ["4.4"],
    "Tourism, Leisure and Hospitality Management":        ["7.3"],

    # ── Chemical Engineering ──────────────────────────────────────────────────
    "Bioengineering":                                     ["9.1"],

    # ── Computer Science ──────────────────────────────────────────────────────
    "Artificial Intelligence":                            ["3.3"],
    "Computational Theory and Mathematics":               ["3.3"],
    "Computer Graphics and Computer-Aided Design":        ["3.1"],
    "Computer Vision and Pattern Recognition":            ["3.3"],
    "Hardware and Architecture":                          ["3.4"],
    "Human-Computer Interaction":                         ["3.1"],
    "Signal Processing":                                  ["3.4"],

    # ── Decision Sciences ─────────────────────────────────────────────────────
    "Information Systems and Management":                 ["3.2"],
    "Management Science and Operations Research":         ["4.5"],
    "Statistics, Probability and Uncertainty":            ["3.3"],

    # ── Earth and Planetary Sciences ──────────────────────────────────────────
    "Economic Geology":                                   ["8.3"],
    "Geotechnical Engineering and Engineering Geology":   ["7.1"],
    "Oceanography":                                       ["8.1"],
    "Paleontology":                                       [],
    "Space and Planetary Science":                        [],

    # ── Economics, Econometrics and Finance ───────────────────────────────────
    "Finance":                                            ["2.3"],

    # ── Engineering ───────────────────────────────────────────────────────────
    "Architecture":                                       ["7.1"],
    "Automotive Engineering":                             ["7.1"],
    "Biomedical Engineering":                             ["6.1"],
    "Building and Construction":                          ["7.1"],
    "Civil and Structural Engineering":                   ["7.1"],
    "Electrical and Electronic Engineering":              ["3.4"],
    "Media Technology":                                   ["3.1"],
    "Ocean Engineering":                                  ["7.1"],
    "Safety, Risk, Reliability and Quality":              ["4.4"],

    # ── Environmental Science ─────────────────────────────────────────────────
    "Global and Planetary Change":                        ["8.4"],
    "Waste Management and Disposal":                      ["8.4"],
    "Water Science and Technology":                       ["8.2"],

    # ── Health Professions ────────────────────────────────────────────────────
    "Health Information Management":                      ["6.3"],

    # ── Materials Science ─────────────────────────────────────────────────────
    "Biomaterials":                                       ["9.1"],

    # ── Mathematics ───────────────────────────────────────────────────────────
    "Control and Optimization":                           ["4.2"],
    "Mathematical Physics":                               [],

    # ── Medicine ──────────────────────────────────────────────────────────────
    "Health Informatics":                                 ["6.3"],
    "Health Policy":                                      ["6.3"],
    "Psychiatry and Mental health":                       ["6.2"],

    # ── Neuroscience ──────────────────────────────────────────────────────────
    "Biological Psychiatry":                              ["6.2"],

    # ── Nursing ───────────────────────────────────────────────────────────────
    "Leadership and Management":                          ["6.3"],
    "Nutrition and Dietetics":                            ["9.3"],
    "Psychiatric Mental Health":                          ["6.2"],

    # ── Psychology ────────────────────────────────────────────────────────────
    "Clinical Psychology":                                ["6.2"],
    "Developmental and Educational Psychology":           ["5.3", "5.2"],

    # ── Social Sciences ───────────────────────────────────────────────────────
    "Communication":                                      ["3.1"],
    "Education":                                          ["5.2"],
    "Geography, Planning and Development":                ["7.1"],
    "Health (social science)":                            ["6.1"],
    "Human Factors and Ergonomics":                       ["3.1"],
    "Law":                                                ["1.3"],
    "Library and Information Sciences":                   ["3.2"],
    "Life-span and Life-course Studies":                  ["5.3"],
    "Linguistics and Language":                           ["5.2"],
    "Political Science and International Relations":      ["1.1"],
    "Public Administration":                              ["1.1"],
    "Safety Research":                                    ["1.4"],
    "Transportation":                                     ["7.1", "7.2"],
    "Urban Studies":                                      ["7.1"],
}

# Clasificación a mano, por ISSN o E-ISSN, para revistas que Scopus no clasifica
# (p. ej. indexadas solo en WoS). Solo se usa si la revista quedó sin línea.
CLASIFICACION_MANUAL = {
    "2221-4135": ["1.1"],  # Revista Andina de Estudios Políticos (RAEP)
}

validar_codigos('AREA_TO_SUBLINEAS', [c for cs in AREA_TO_SUBLINEAS.values() for c in cs])
validar_codigos('SCOPUS_TO_SUBLINEAS', [c for cs in SCOPUS_TO_SUBLINEAS.values() for c in cs])
validar_codigos('CLASIFICACION_MANUAL', [c for cs in CLASIFICACION_MANUAL.values() for c in cs])


def classify_manual(issn, e_issn) -> list:
    codigos = CLASIFICACION_MANUAL.get(issn or "") or CLASIFICACION_MANUAL.get(e_issn or "") or []
    return [
        {"Linea": SUBLINEAS[c][0], "Sublinea": SUBLINEAS[c][1], "Origen_Scopus": "Clasificación manual"}
        for c in codigos
    ]


def classify_journal_ulima(categorias_scopus: list) -> list:
    """
    Clasifica una revista en las líneas prioritarias ULima según sus subáreas Scopus.
    Retorna [{Linea, Sublinea, Origen_Scopus}] sin repetir sublíneas, en el orden de
    las subáreas (la primera define el enfoque de la revista).
    """
    seen, result = set(), []
    for cat in categorias_scopus:
        area, subarea = cat.get("Categoria", ""), cat.get("Subcategoria", "")
        codigos = SCOPUS_TO_SUBLINEAS.get(subarea)
        if codigos is None:
            codigos = AREA_TO_SUBLINEAS.get(area, [])
        for codigo in codigos:
            if codigo in seen:
                continue
            seen.add(codigo)
            linea, sublinea = SUBLINEAS[codigo]
            result.append({
                "Linea":         linea,
                "Sublinea":      sublinea,
                # Subárea Scopus que originó esta clasificación
                "Origen_Scopus": f"{area} > {subarea}",
            })
    return result


import requests
import json
import pandas as pd
from difflib import SequenceMatcher

# ══════════════════════════════════════════════════════════════════════════════
#  MAPEO ASJC: código → (Categoría, Subárea)
# ══════════════════════════════════════════════════════════════════════════════

ASJC = {
    # ── Multidisciplinary ─────────────────────────────────────────────────────
    "10": ("Multidisciplinary", "Multidisciplinary"),
    "1000": ("Multidisciplinary", "Multidisciplinary"),

    # ── Agricultural and Biological Sciences ─────────────────────────────────
    "11": ("Agricultural and Biological Sciences", "General"),
    "1100": ("Agricultural and Biological Sciences", "General Agricultural and Biological Sciences"),
    "1101": ("Agricultural and Biological Sciences", "Agricultural and Biological Sciences (miscellaneous)"),
    "1102": ("Agricultural and Biological Sciences", "Agronomy and Crop Science"),
    "1103": ("Agricultural and Biological Sciences", "Animal Science and Zoology"),
    "1104": ("Agricultural and Biological Sciences", "Aquatic Science"),
    "1105": ("Agricultural and Biological Sciences", "Ecology, Evolution, Behavior and Systematics"),
    "1106": ("Agricultural and Biological Sciences", "Food Science"),
    "1107": ("Agricultural and Biological Sciences", "Forestry"),
    "1108": ("Agricultural and Biological Sciences", "Horticulture"),
    "1109": ("Agricultural and Biological Sciences", "Insect Science"),
    "1110": ("Agricultural and Biological Sciences", "Plant Science"),
    "1111": ("Agricultural and Biological Sciences", "Soil Science"),

    # ── Arts and Humanities ──────────────────────────────────────────────────
    "12": ("Arts and Humanities", "General"),
    "1200": ("Arts and Humanities", "General Arts and Humanities"),
    "1201": ("Arts and Humanities", "Arts and Humanities (miscellaneous)"),
    "1202": ("Arts and Humanities", "History"),
    "1203": ("Arts and Humanities", "Language and Linguistics"),
    "1204": ("Arts and Humanities", "Archaeology"),
    "1205": ("Arts and Humanities", "Classics"),
    "1206": ("Arts and Humanities", "Conservation"),
    "1207": ("Arts and Humanities", "History and Philosophy of Science"),
    "1208": ("Arts and Humanities", "Literature and Literary Theory"),
    "1209": ("Arts and Humanities", "Museology"),
    "1210": ("Arts and Humanities", "Music"),
    "1211": ("Arts and Humanities", "Philosophy"),
    "1212": ("Arts and Humanities", "Religious studies"),
    "1213": ("Arts and Humanities", "Visual Arts and Performing Arts"),

    # ── Biochemistry, Genetics and Molecular Biology ──────────────────────────
    "13": ("Biochemistry, Genetics and Molecular Biology", "General"),
    "1300": ("Biochemistry, Genetics and Molecular Biology", "General Biochemistry, Genetics and Molecular Biology"),
    "1301": ("Biochemistry, Genetics and Molecular Biology", "Biochemistry, Genetics and Molecular Biology (miscellaneous)"),
    "1302": ("Biochemistry, Genetics and Molecular Biology", "Ageing"),
    "1303": ("Biochemistry, Genetics and Molecular Biology", "Biochemistry"),
    "1304": ("Biochemistry, Genetics and Molecular Biology", "Biophysics"),
    "1305": ("Biochemistry, Genetics and Molecular Biology", "Biotechnology"),
    "1306": ("Biochemistry, Genetics and Molecular Biology", "Cancer Research"),
    "1307": ("Biochemistry, Genetics and Molecular Biology", "Cell Biology"),
    "1308": ("Biochemistry, Genetics and Molecular Biology", "Clinical Biochemistry"),
    "1309": ("Biochemistry, Genetics and Molecular Biology", "Developmental Biology"),
    "1310": ("Biochemistry, Genetics and Molecular Biology", "Endocrinology"),
    "1311": ("Biochemistry, Genetics and Molecular Biology", "Genetics"),
    "1312": ("Biochemistry, Genetics and Molecular Biology", "Molecular Biology"),
    "1313": ("Biochemistry, Genetics and Molecular Biology", "Molecular Medicine"),
    "1314": ("Biochemistry, Genetics and Molecular Biology", "Physiology"),
    "1315": ("Biochemistry, Genetics and Molecular Biology", "Structural Biology"),

    # ── Business, Management and Accounting ──────────────────────────────────
    "14": ("Business, Management and Accounting", "General"),
    "1400": ("Business, Management and Accounting", "General Business, Management and Accounting"),
    "1401": ("Business, Management and Accounting", "Business, Management and Accounting (miscellaneous)"),
    "1402": ("Business, Management and Accounting", "Accounting"),
    "1403": ("Business, Management and Accounting", "Business and International Management"),
    "1404": ("Business, Management and Accounting", "Management Information Systems"),
    "1405": ("Business, Management and Accounting", "Management of Technology and Innovation"),
    "1406": ("Business, Management and Accounting", "Marketing"),
    "1407": ("Business, Management and Accounting", "Organizational Behavior and Human Resource Management"),
    "1408": ("Business, Management and Accounting", "Strategy and Management"),
    "1409": ("Business, Management and Accounting", "Tourism, Leisure and Hospitality Management"),
    "1410": ("Business, Management and Accounting", "Industrial Relations"),

    # ── Chemical Engineering ──────────────────────────────────────────────────
    "15": ("Chemical Engineering", "General"),
    "1500": ("Chemical Engineering", "General Chemical Engineering"),
    "1501": ("Chemical Engineering", "Chemical Engineering (miscellaneous)"),
    "1502": ("Chemical Engineering", "Bioengineering"),
    "1503": ("Chemical Engineering", "Catalysis"),
    "1504": ("Chemical Engineering", "Chemical Health and Safety"),
    "1505": ("Chemical Engineering", "Colloid and Surface Chemistry"),
    "1506": ("Chemical Engineering", "Filtration and Separation"),
    "1507": ("Chemical Engineering", "Fluid Flow and Transfer Processes"),
    "1508": ("Chemical Engineering", "Process Chemistry and Technology"),

    # ── Chemistry ──────────────────────────────────────────────────────────
    "16": ("Chemistry", "General"),
    "1600": ("Chemistry", "General Chemistry"),
    "1601": ("Chemistry", "Chemistry (miscellaneous)"),
    "1602": ("Chemistry", "Analytical Chemistry"),
    "1603": ("Chemistry", "Electrochemistry"),
    "1604": ("Chemistry", "Inorganic Chemistry"),
    "1605": ("Chemistry", "Organic Chemistry"),
    "1606": ("Chemistry", "Physical and Theoretical Chemistry"),
    "1607": ("Chemistry", "Spectroscopy"),

    # ── Computer Science ──────────────────────────────────────────────────────
    "17": ("Computer Science", "General"),
    "1700": ("Computer Science", "General Computer Science"),
    "1701": ("Computer Science", "Computer Science (miscellaneous)"),
    "1702": ("Computer Science", "Artificial Intelligence"),
    "1703": ("Computer Science", "Computational Theory and Mathematics"),
    "1704": ("Computer Science", "Computer Graphics and Computer-Aided Design"),
    "1705": ("Computer Science", "Computer Networks and Communications"),
    "1706": ("Computer Science", "Computer Science Applications"),
    "1707": ("Computer Science", "Computer Vision and Pattern Recognition"),
    "1708": ("Computer Science", "Hardware and Architecture"),
    "1709": ("Computer Science", "Human-Computer Interaction"),
    "1710": ("Computer Science", "Information Systems"),
    "1711": ("Computer Science", "Signal Processing"),
    "1712": ("Computer Science", "Software"),

    # ── Decision Sciences ──────────────────────────────────────────────────────
    "18": ("Decision Sciences", "General"),
    "1800": ("Decision Sciences", "General Decision Sciences"),
    "1801": ("Decision Sciences", "Decision Sciences (miscellaneous)"),
    "1802": ("Decision Sciences", "Information Systems and Management"),
    "1803": ("Decision Sciences", "Management Science and Operations Research"),
    "1804": ("Decision Sciences", "Statistics, Probability and Uncertainty"),

    # ── Earth and Planetary Sciences ──────────────────────────────────────────
    "19": ("Earth and Planetary Sciences", "General"),
    "1900": ("Earth and Planetary Sciences", "General Earth and Planetary Sciences"),
    "1901": ("Earth and Planetary Sciences", "Earth and Planetary Sciences (miscellaneous)"),
    "1902": ("Earth and Planetary Sciences", "Atmospheric Science"),
    "1903": ("Earth and Planetary Sciences", "Computers in Earth Sciences"),
    "1904": ("Earth and Planetary Sciences", "Earth-Surface Processes"),
    "1905": ("Earth and Planetary Sciences", "Economic Geology"),
    "1906": ("Earth and Planetary Sciences", "Geochemistry and Petrology"),
    "1907": ("Earth and Planetary Sciences", "Geology"),
    "1908": ("Earth and Planetary Sciences", "Geophysics"),
    "1909": ("Earth and Planetary Sciences", "Geotechnical Engineering and Engineering Geology"),
    "1910": ("Earth and Planetary Sciences", "Oceanography"),
    "1911": ("Earth and Planetary Sciences", "Paleontology"),
    "1912": ("Earth and Planetary Sciences", "Space and Planetary Science"),
    "1913": ("Earth and Planetary Sciences", "Stratigraphy"),

    # ── Economics, Econometrics and Finance ──────────────────────────────────
    "20": ("Economics, Econometrics and Finance", "General"),
    "2000": ("Economics, Econometrics and Finance", "General Economics, Econometrics and Finance"),
    "2001": ("Economics, Econometrics and Finance", "Economics, Econometrics and Finance (miscellaneous)"),
    "2002": ("Economics, Econometrics and Finance", "Economics and Econometrics"),
    "2003": ("Economics, Econometrics and Finance", "Finance"),

    # ── Energy ──────────────────────────────────────────────────────────────
    "21": ("Energy", "General"),
    "2100": ("Energy", "General Energy"),
    "2101": ("Energy", "Energy (miscellaneous)"),
    "2102": ("Energy", "Energy Engineering and Power Technology"),
    "2103": ("Energy", "Fuel Technology"),
    "2104": ("Energy", "Nuclear Energy and Engineering"),
    "2105": ("Energy", "Renewable Energy, Sustainability and the Environment"),

    # ── Engineering ──────────────────────────────────────────────────────────
    "22": ("Engineering", "General"),
    "2200": ("Engineering", "General Engineering"),
    "2201": ("Engineering", "Engineering (miscellaneous)"),
    "2202": ("Engineering", "Aerospace Engineering"),
    "2203": ("Engineering", "Automotive Engineering"),
    "2204": ("Engineering", "Biomedical Engineering"),
    "2205": ("Engineering", "Civil and Structural Engineering"),
    "2206": ("Engineering", "Computational Mechanics"),
    "2207": ("Engineering", "Control and Systems Engineering"),
    "2208": ("Engineering", "Electrical and Electronic Engineering"),
    "2209": ("Engineering", "Industrial and Manufacturing Engineering"),
    "2210": ("Engineering", "Mechanical Engineering"),
    "2211": ("Engineering", "Mechanics of Materials"),
    "2212": ("Engineering", "Ocean Engineering"),
    "2213": ("Engineering", "Safety, Risk, Reliability and Quality"),
    "2214": ("Engineering", "Media Technology"),
    "2215": ("Engineering", "Building and Construction"),
    "2216": ("Engineering", "Architecture"),

    # ── Environmental Science ──────────────────────────────────────────────────
    "23": ("Environmental Science", "General"),
    "2300": ("Environmental Science", "General Environmental Science"),
    "2301": ("Environmental Science", "Environmental Science (miscellaneous)"),
    "2302": ("Environmental Science", "Ecological Modeling"),
    "2303": ("Environmental Science", "Ecology"),
    "2304": ("Environmental Science", "Environmental Chemistry"),
    "2305": ("Environmental Science", "Environmental Engineering"),
    "2306": ("Environmental Science", "Global and Planetary Change"),
    "2307": ("Environmental Science", "Health, Toxicology and Mutagenesis"),
    "2308": ("Environmental Science", "Management, Monitoring, Policy and Law"),
    "2309": ("Environmental Science", "Nature and Landscape Conservation"),
    "2310": ("Environmental Science", "Pollution"),
    "2311": ("Environmental Science", "Waste Management and Disposal"),
    "2312": ("Environmental Science", "Water Science and Technology"),

    # ── Immunology and Microbiology ──────────────────────────────────────────
    "24": ("Immunology and Microbiology", "General"),
    "2400": ("Immunology and Microbiology", "General Immunology and Microbiology"),
    "2401": ("Immunology and Microbiology", "Immunology and Microbiology (miscellaneous)"),
    "2402": ("Immunology and Microbiology", "Applied Microbiology and Biotechnology"),
    "2403": ("Immunology and Microbiology", "Immunology"),
    "2404": ("Immunology and Microbiology", "Microbiology"),
    "2405": ("Immunology and Microbiology", "Parasitology"),
    "2406": ("Immunology and Microbiology", "Virology"),

    # ── Materials Science ──────────────────────────────────────────────────────
    "25": ("Materials Science", "General"),
    "2500": ("Materials Science", "General Materials Science"),
    "2501": ("Materials Science", "Materials Science (miscellaneous)"),
    "2502": ("Materials Science", "Biomaterials"),
    "2503": ("Materials Science", "Ceramics and Composites"),
    "2504": ("Materials Science", "Electronic, Optical and Magnetic Materials"),
    "2505": ("Materials Science", "Materials Chemistry"),
    "2506": ("Materials Science", "Metals and Alloys"),
    "2507": ("Materials Science", "Polymers and Plastics"),
    "2508": ("Materials Science", "Surfaces, Coatings and Films"),

    # ── Mathematics ──────────────────────────────────────────────────────────
    "26": ("Mathematics", "General"),
    "2600": ("Mathematics", "General Mathematics"),
    "2601": ("Mathematics", "Mathematics (miscellaneous)"),
    "2602": ("Mathematics", "Algebra and Number Theory"),
    "2603": ("Mathematics", "Analysis"),
    "2604": ("Mathematics", "Applied Mathematics"),
    "2605": ("Mathematics", "Computational Mathematics"),
    "2606": ("Mathematics", "Control and Optimization"),
    "2607": ("Mathematics", "Discrete Mathematics and Combinatorics"),
    "2608": ("Mathematics", "Geometry and Topology"),
    "2609": ("Mathematics", "Logic"),
    "2610": ("Mathematics", "Mathematical Physics"),
    "2611": ("Mathematics", "Modelling and Simulation"),
    "2612": ("Mathematics", "Numerical Analysis"),
    "2613": ("Mathematics", "Statistics and Probability"),
    "2614": ("Mathematics", "Theoretical Computer Science"),

    # ── Medicine ──────────────────────────────────────────────────────────────
    "27": ("Medicine", "General"),
    "2700": ("Medicine", "General Medicine"),
    "2701": ("Medicine", "Medicine (miscellaneous)"),
    "2702": ("Medicine", "Anatomy"),
    "2703": ("Medicine", "Anesthesiology and Pain Medicine"),
    "2704": ("Medicine", "Biochemistry, medical"),
    "2705": ("Medicine", "Cardiology and Cardiovascular Medicine"),
    "2706": ("Medicine", "Critical Care and Intensive Care Medicine"),
    "2707": ("Medicine", "Complementary and alternative medicine"),
    "2708": ("Medicine", "Dermatology"),
    "2709": ("Medicine", "Drug guides"),
    "2710": ("Medicine", "Embryology"),
    "2711": ("Medicine", "Emergency Medicine"),
    "2712": ("Medicine", "Endocrinology, Diabetes and Metabolism"),
    "2713": ("Medicine", "Epidemiology"),
    "2714": ("Medicine", "Family Practice"),
    "2715": ("Medicine", "Gastroenterology"),
    "2716": ("Medicine", "Genetics(clinical)"),
    "2717": ("Medicine", "Geriatrics and Gerontology"),
    "2718": ("Medicine", "Health Informatics"),
    "2719": ("Medicine", "Health Policy"),
    "2720": ("Medicine", "Hematology"),
    "2721": ("Medicine", "Hepatology"),
    "2722": ("Medicine", "Histology"),
    "2723": ("Medicine", "Immunology and Allergy"),
    "2724": ("Medicine", "Internal Medicine"),
    "2725": ("Medicine", "Infectious Diseases"),
    "2726": ("Medicine", "Microbiology (medical)"),
    "2727": ("Medicine", "Nephrology"),
    "2728": ("Medicine", "Clinical Neurology"),
    "2729": ("Medicine", "Obstetrics and Gynaecology"),
    "2730": ("Medicine", "Oncology"),
    "2731": ("Medicine", "Ophthalmology"),
    "2732": ("Medicine", "Orthopedics and Sports Medicine"),
    "2733": ("Medicine", "Otorhinolaryngology"),
    "2734": ("Medicine", "Pathology and Forensic Medicine"),
    "2735": ("Medicine", "Pediatrics, Perinatology, and Child Health"),
    "2736": ("Medicine", "Pharmacology (medical)"),
    "2737": ("Medicine", "Physiology (medical)"),
    "2738": ("Medicine", "Psychiatry and Mental health"),
    "2739": ("Medicine", "Public Health, Environmental and Occupational Health"),
    "2740": ("Medicine", "Pulmonary and Respiratory Medicine"),
    "2741": ("Medicine", "Radiology Nuclear Medicine and imaging"),
    "2742": ("Medicine", "Rehabilitation"),
    "2743": ("Medicine", "Reproductive Medicine"),
    "2744": ("Medicine", "Reviews and References, Medical"),
    "2745": ("Medicine", "Rheumatology"),
    "2746": ("Medicine", "Surgery"),
    "2747": ("Medicine", "Transplantation"),
    "2748": ("Medicine", "Urology"),

    # ── Neuroscience ──────────────────────────────────────────────────────────
    "28": ("Neuroscience", "General"),
    "2800": ("Neuroscience", "General Neuroscience"),
    "2801": ("Neuroscience", "Neuroscience (miscellaneous)"),
    "2802": ("Neuroscience", "Behavioral Neuroscience"),
    "2803": ("Neuroscience", "Biological Psychiatry"),
    "2804": ("Neuroscience", "Cellular and Molecular Neuroscience"),
    "2805": ("Neuroscience", "Cognitive Neuroscience"),
    "2806": ("Neuroscience", "Developmental Neuroscience"),
    "2807": ("Neuroscience", "Endocrine and Autonomic Systems"),
    "2808": ("Neuroscience", "Neurology"),
    "2809": ("Neuroscience", "Sensory Systems"),

    # ── Nursing ──────────────────────────────────────────────────────────────
    "29": ("Nursing", "General"),
    "2900": ("Nursing", "General Nursing"),
    "2901": ("Nursing", "Nursing (miscellaneous)"),
    "2902": ("Nursing", "Advanced and Specialised Nursing"),
    "2903": ("Nursing", "Assessment and Diagnosis"),
    "2904": ("Nursing", "Care Planning"),
    "2905": ("Nursing", "Community and Home Care"),
    "2906": ("Nursing", "Critical Care"),
    "2907": ("Nursing", "Emergency"),
    "2908": ("Nursing", "Fundamentals and skills"),
    "2909": ("Nursing", "Gerontology"),
    "2910": ("Nursing", "Issues, ethics and legal aspects"),
    "2911": ("Nursing", "Leadership and Management"),
    "2912": ("Nursing", "LPN and LVN"),
    "2913": ("Nursing", "Maternity and Midwifery"),
    "2914": ("Nursing", "Medical-Surgical"),
    "2915": ("Nursing", "Nurse Assisting"),
    "2916": ("Nursing", "Nutrition and Dietetics"),
    "2917": ("Nursing", "Oncology (nursing)"),
    "2918": ("Nursing", "Pathophysiology"),
    "2919": ("Nursing", "Pediatrics"),
    "2920": ("Nursing", "Pharmacology (nursing)"),
    "2921": ("Nursing", "Psychiatric Mental Health"),
    "2922": ("Nursing", "Research and Theory"),
    "2923": ("Nursing", "Review and Exam Preparation"),

    # ── Pharmacology, Toxicology and Pharmaceutics ──────────────────────────
    "30": ("Pharmacology, Toxicology and Pharmaceutics", "General"),
    "3000": ("Pharmacology, Toxicology and Pharmaceutics", "General Pharmacology, Toxicology and Pharmaceutics"),
    "3001": ("Pharmacology, Toxicology and Pharmaceutics", "Pharmacology, Toxicology and Pharmaceutics (miscellaneous)"),
    "3002": ("Pharmacology, Toxicology and Pharmaceutics", "Drug Discovery"),
    "3003": ("Pharmacology, Toxicology and Pharmaceutics", "Pharmaceutical Science"),
    "3004": ("Pharmacology, Toxicology and Pharmaceutics", "Pharmacology"),
    "3005": ("Pharmacology, Toxicology and Pharmaceutics", "Toxicology"),

    # ── Physics and Astronomy ──────────────────────────────────────────────────
    "31": ("Physics and Astronomy", "General"),
    "3100": ("Physics and Astronomy", "General Physics and Astronomy"),
    "3101": ("Physics and Astronomy", "Physics and Astronomy (miscellaneous)"),
    "3102": ("Physics and Astronomy", "Acoustics and Ultrasonics"),
    "3103": ("Physics and Astronomy", "Astronomy and Astrophysics"),
    "3104": ("Physics and Astronomy", "Condensed Matter Physics"),
    "3105": ("Physics and Astronomy", "Instrumentation"),
    "3106": ("Physics and Astronomy", "Nuclear and High Energy Physics"),
    "3107": ("Physics and Astronomy", "Atomic and Molecular Physics, and Optics"),
    "3108": ("Physics and Astronomy", "Radiation"),
    "3109": ("Physics and Astronomy", "Statistical and Nonlinear Physics"),
    "3110": ("Physics and Astronomy", "Surfaces and Interfaces"),

    # ── Psychology ──────────────────────────────────────────────────────────
    "32": ("Psychology", "General"),
    "3200": ("Psychology", "General Psychology"),
    "3201": ("Psychology", "Psychology (miscellaneous)"),
    "3202": ("Psychology", "Applied Psychology"),
    "3203": ("Psychology", "Clinical Psychology"),
    "3204": ("Psychology", "Developmental and Educational Psychology"),
    "3205": ("Psychology", "Experimental and Cognitive Psychology"),
    "3206": ("Psychology", "Neuropsychology and Physiological Psychology"),
    "3207": ("Psychology", "Social Psychology"),

    # ── Social Sciences ──────────────────────────────────────────────────────
    "33": ("Social Sciences", "General"),
    "3300": ("Social Sciences", "General Social Sciences"),
    "3301": ("Social Sciences", "Social Sciences (miscellaneous)"),
    "3302": ("Social Sciences", "Archaeology"),
    "3303": ("Social Sciences", "Development"),
    "3304": ("Social Sciences", "Education"),
    "3305": ("Social Sciences", "Geography, Planning and Development"),
    "3306": ("Social Sciences", "Health (social science)"),
    "3307": ("Social Sciences", "Human Factors and Ergonomics"),
    "3308": ("Social Sciences", "Law"),
    "3309": ("Social Sciences", "Library and Information Sciences"),
    "3310": ("Social Sciences", "Linguistics and Language"),
    "3311": ("Social Sciences", "Safety Research"),
    "3312": ("Social Sciences", "Sociology and Political Science"),
    "3313": ("Social Sciences", "Transportation"),
    "3314": ("Social Sciences", "Anthropology"),
    "3315": ("Social Sciences", "Communication"),
    "3316": ("Social Sciences", "Cultural Studies"),
    "3317": ("Social Sciences", "Demography"),
    "3318": ("Social Sciences", "Gender Studies"),
    "3319": ("Social Sciences", "Life-span and Life-course Studies"),
    "3320": ("Social Sciences", "Political Science and International Relations"),
    "3321": ("Social Sciences", "Public Administration"),
    "3322": ("Social Sciences", "Urban Studies"),

    # ── Veterinary ──────────────────────────────────────────────────────────
    "34": ("Veterinary", "General"),
    "3400": ("Veterinary", "General Veterinary"),
    "3401": ("Veterinary", "Veterinary (miscellaneous)"),
    "3402": ("Veterinary", "Equine"),
    "3403": ("Veterinary", "Food Animals"),
    "3404": ("Veterinary", "Small Animals"),

    # ── Dentistry ──────────────────────────────────────────────────────────
    "35": ("Dentistry", "General"),
    "3500": ("Dentistry", "General Dentistry"),
    "3501": ("Dentistry", "Dentistry (miscellaneous)"),
    "3502": ("Dentistry", "Dental Assisting"),
    "3503": ("Dentistry", "Dental Hygiene"),
    "3504": ("Dentistry", "Oral Surgery"),
    "3505": ("Dentistry", "Orthodontics"),
    "3506": ("Dentistry", "Periodontics"),

    # ── Health Professions ──────────────────────────────────────────────────
    "36": ("Health Professions", "General"),
    "3600": ("Health Professions", "General Health Professions"),
    "3601": ("Health Professions", "Health Professions (miscellaneous)"),
    "3602": ("Health Professions", "Chiropractics"),
    "3603": ("Health Professions", "Complementary and Manual Therapy"),
    "3604": ("Health Professions", "Emergency Medical Services"),
    "3605": ("Health Professions", "Health Information Management"),
    "3606": ("Health Professions", "Medical Assisting and Transcription"),
    "3607": ("Health Professions", "Medical Laboratory Technology"),
    "3608": ("Health Professions", "Medical Terminology"),
    "3609": ("Health Professions", "Occupational Therapy"),
    "3610": ("Health Professions", "Optometry"),
    "3611": ("Health Professions", "Pharmacy"),
    "3612": ("Health Professions", "Physical Therapy, Sports Therapy and Rehabilitation"),
    "3613": ("Health Professions", "Podiatry"),
    "3614": ("Health Professions", "Radiological and Ultrasound Technology"),
    "3615": ("Health Professions", "Respiratory Care"),
    "3616": ("Health Professions", "Speech and Hearing"),
}

# ══════════════════════════════════════════════════════════════════════════════
#  CONFIGURACIÓN API
# ══════════════════════════════════════════════════════════════════════════════

API_KEY = '03ac1926f2ad4e2160adc0856690189d'

SCOPUS_HEADERS = {
    "X-ELS-APIKey": API_KEY,
    "Accept":       "application/json"
}


# ══════════════════════════════════════════════════════════════════════════════
#  FUNCIONES AUXILIARES
# ══════════════════════════════════════════════════════════════════════════════

def get_asjc_names(code_str: str) -> tuple:
    code = str(code_str).strip()
    if code in ASJC:
        return ASJC[code]
    prefix = code[:2]
    if prefix in ASJC:
        return (ASJC[prefix][0], f"Subárea {code}")
    return (f"Código {code}", f"Subárea {code}")


def percentile_to_quartile(percentile_str: str) -> str:
    try:
        p = float(percentile_str)
        if p >= 75: return "Q1"
        if p >= 50: return "Q2"
        if p >= 25: return "Q3"
        return "Q4"
    except (ValueError, TypeError):
        return "N/A"


def resolve_category_from_sr(sr: dict) -> tuple:
    code = str(sr.get("subjectCode", "")).strip()
    if code and code.isdigit():
        return get_asjc_names(code)
    label = f"Código desconocido ({code})" if code else "Sin clasificación"
    return (label, label)


# ══════════════════════════════════════════════════════════════════════════════
#  ÍNDICE DEL EXCEL PARA ENRIQUECIMIENTO
#  Se construye UNA sola vez antes del loop principal
# ══════════════════════════════════════════════════════════════════════════════

def _norm_issn(val):
    """Normaliza un valor ISSN: devuelve None si está vacío o es '-'."""
    if pd.isna(val) or str(val).strip() in ('', '-', 'nan'):
        return None
    return str(val).strip()

def _safe_val(val):
    """Convierte un valor del DataFrame a string limpio o None."""
    import pandas as pd
    # Si hay columnas duplicadas, row['col'] devuelve una Series.
    if isinstance(val, pd.Series):
        # Tomar el primer valor no nulo, o el primero por defecto
        val_clean = val.dropna()
        val = val_clean.iloc[0] if not val_clean.empty else val.iloc[0]

    if pd.isna(val) or str(val).strip() in ('nan', '-', ''):
        return None
    if hasattr(val, 'strftime'):
        return val.strftime('%Y-%m-%d')
    return str(val).strip()

def _name_sim(a: str, b: str) -> float:
    from difflib import SequenceMatcher
    return SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()

# Construir índices ISSN → lista de filas (soporta ISSNs compartidos entre revistas)
_df_issn   = {}
_df_e_issn = {}
for _, _row in filtered_df.iterrows():
    _i  = _norm_issn(_row['ISSN'])
    _ei = _norm_issn(_row['E-ISSN'])
    if _i:  _df_issn.setdefault(_i, []).append(_row)
    if _ei: _df_e_issn.setdefault(_ei, []).append(_row)

def find_excel_row(nombre: str, issn: str, e_issn: str):
    """
    Busca la fila del filtered_df que corresponde a la revista.
    Si hay múltiples candidatos con el mismo ISSN (ej. REVESCO vs CIRIEC),
    desambigua por similitud de nombre.
    """
    candidates = []
    if e_issn and e_issn in _df_e_issn:
        candidates = _df_e_issn[e_issn]
    elif issn and issn in _df_issn:
        candidates = _df_issn[issn]
    elif e_issn and e_issn in _df_issn:
        candidates = _df_issn[e_issn]

    if not candidates:
        return None
    if len(candidates) == 1:
        return candidates[0]

    # Múltiples filas con el mismo ISSN → elegir la más similar por nombre
    return max(candidates,
               key=lambda r: _name_sim(nombre, str(r['Nombre de la revista / fuente'])))

def enrich_with_excel(journal_entry: dict, excel_row) -> dict:
    """
    Agrega los campos del Excel al dict de Scopus.
    Preferencia: si Scopus ya tiene Editor válido, lo conserva;
    si es 'N/A' o vacío, usa el del Excel.
    """
    if excel_row is None:
        return journal_entry
    
    # Enlace del informe de integridad de la revista
    excel_link_informe = _safe_val(excel_row.get('Enlace del informe'))
    if excel_link_informe:
        journal_entry['enlace_informe'] = excel_link_informe

    # Editor: completar solo si Scopus no lo tiene
    if journal_entry.get('publisher') in ('N/A', None, ''):
        journal_entry['publisher'] = _safe_val(excel_row.get('Editorial')) or 'N/A'

    # Sitio Web: el del Excel tiene prioridad
    excel_link = _safe_val(excel_row.get('Enlace'))
    if excel_link:
        journal_entry['sitioWeb'] = excel_link

    # Tipo de revista
    excel_tipo = _safe_val(excel_row.get('Tipo de revista'))
    if excel_tipo:
        journal_entry['tipo'] = excel_tipo
    
    # Tipo de APC
    excel_apc = _safe_val(excel_row.get('Tipo APC'))
    if excel_apc:
        journal_entry['tipo_apc'] = excel_apc

    # Fecha de emision
    excel_fecha_emision = _safe_val(excel_row.get('Fecha de emisión'))
    if excel_fecha_emision:
        journal_entry['fecha_emision'] = excel_fecha_emision

    # Indexación declarada en la hoja ('Scopus, WoS' → ['Scopus', 'WoS']) y colección WoS
    excel_indexacion = _safe_val(excel_row.get('Base de datos (Indexación)'))
    journal_entry['indexacion'] = [b.strip() for b in excel_indexacion.split(',')] if excel_indexacion else []
    journal_entry['coleccion_wos'] = _safe_val(excel_row.get('Colección WoS'))

    # Agregamos categorías adicionales que podrían ser útiles
    # pero filtramos lo que NO es relevante para el dashboard final
    return journal_entry


# ══════════════════════════════════════════════════════════════════════════════
#  FUNCIÓN PRINCIPAL: consulta Scopus Serial Title API
# ══════════════════════════════════════════════════════════════════════════════

import time

NOT_IN_SCOPUS = "ISSN no encontrado en Scopus"

def sheet_only_entry(nombre: str, issn, e_issn) -> dict:
    """
    Ficha base para una revista aprobada que no está indexada en Scopus (p. ej. solo
    en WoS). Sin cuartiles ni CiteScore; enrich_with_excel completa el resto.
    """
    return {
        "journal":     nombre,
        "issn":        issn or "",
        "eissn":       e_issn or "",
        "publisher":   "N/A",
        "disciplinas": [],
        "cobertura":   "N/A",
        "citeScore":   None,
        "sitioWeb":    "",
        "scopusLink":  "",
    }

def get_journal_metadata(issn_query: str, max_retries: int = 3) -> tuple:
    """
    Consulta Scopus Serial Title API (view=CITESCORE) por ISSN o E-ISSN.
    Reintenta automáticamente hasta max_retries veces ante timeouts o errores 5xx.
    Retorna (base_dict, subject_ranks_list) o (None, error_msg).
    """
    url    = f"https://api.elsevier.com/content/serial/title/issn/{issn_query}"
    params = {"view": "CITESCORE"}

    for attempt in range(1, max_retries + 1):
        try:
            resp = requests.get(url, headers=SCOPUS_HEADERS, params=params, timeout=30)

        except requests.exceptions.ReadTimeout:
            wait = 2 ** attempt  # 2s, 4s, 8s
            if attempt < max_retries:
                print(f"  ⏱ Timeout (intento {attempt}/{max_retries}). Reintentando en {wait}s...")
                time.sleep(wait)
                continue
            return None, f"Timeout tras {max_retries} intentos"

        except requests.exceptions.ConnectionError as e:
            wait = 2 ** attempt
            if attempt < max_retries:
                print(f"  🔌 Error de conexión (intento {attempt}/{max_retries}). Reintentando en {wait}s...")
                time.sleep(wait)
                continue
            return None, f"Error de conexión: {str(e)}"

        except requests.RequestException as e:
            return None, str(e)

        # ── Respuesta recibida ────────────────────────────────────────────────
        if resp.status_code == 429:
            # Rate limit: espera más tiempo
            wait = 10 * attempt
            if attempt < max_retries:
                print(f"  🚦 Rate limit (intento {attempt}/{max_retries}). Esperando {wait}s...")
                time.sleep(wait)
                continue
            return None, "Rate limit excedido"

        if resp.status_code in (500, 502, 503, 504):
            wait = 2 ** attempt
            if attempt < max_retries:
                print(f"  ⚠ Error servidor {resp.status_code} (intento {attempt}/{max_retries}). Reintentando en {wait}s...")
                time.sleep(wait)
                continue
            return None, f"Error servidor HTTP {resp.status_code}"

        if resp.status_code == 404:
            return None, NOT_IN_SCOPUS

        if resp.status_code != 200:
            return None, f"HTTP {resp.status_code}"

        # ── Procesamiento normal (sin cambios) ───────────────────────────────
        data  = resp.json().get("serial-metadata-response", {})
        entry = data.get("entry", [{}])[0]

        issn_print = entry.get("prism:issn", "")

        homepage = scopus_link = ""
        for link in entry.get("link", []):
            ref = link.get("@ref", "")
            if ref == "homepage":
                homepage = link.get("@href", "")
            elif ref == "scopus-source":
                scopus_link = link.get("@href", "")

        subject_areas = entry.get("subject-area", [])
        if isinstance(subject_areas, dict):
            subject_areas = [subject_areas]
        seen_cats, cat_names = set(), []
        for s in subject_areas:
            code = str(s.get("@code", ""))
            cat, _ = get_asjc_names(code)
            if cat not in seen_cats:
                seen_cats.add(cat)
                cat_names.append(cat)
        disciplinas = "; ".join(cat_names)

        cobertura = (f"{entry.get('coverageStartYear', 'N/A')} - "
                     f"{entry.get('coverageEndYear', 'present')}")

        cs_block     = entry.get("citeScoreYearInfoList", {})
        cs_value     = cs_block.get("citeScoreCurrentMetric", "N/A")
        cs_year      = cs_block.get("citeScoreCurrentMetricYear", "")
        cs_year_list = cs_block.get("citeScoreYearInfo", [])
        if isinstance(cs_year_list, dict):
            cs_year_list = [cs_year_list]

        target = None
        for y in cs_year_list:
            if y.get("@year") == cs_year and y.get("@status") == "Complete":
                target = y
                break
        if not target:
            for y in cs_year_list:
                if y.get("@status") == "Complete":
                    target = y
                    break

        subject_ranks = []
        if target:
            try:
                subject_ranks = (
                    target["citeScoreInformationList"][0]
                          ["citeScoreInfo"][0]
                          ["citeScoreSubjectRank"]
                )
                if isinstance(subject_ranks, dict):
                    subject_ranks = [subject_ranks]
            except (KeyError, IndexError, TypeError):
                subject_ranks = []

        subject_ranks_list = []
        for sr in subject_ranks:
            percentile = sr.get("percentile", "N/A")
            quartile   = percentile_to_quartile(percentile)
            category, subcategory = resolve_category_from_sr(sr)
            subject_ranks_list.append({
                "Categoria":    category,
                "Subcategoria": subcategory,
                "Percentil":    percentile,
                "Cuartil":      quartile
            })

        base_dict = {
            "journal":          entry.get("dc:title", "N/A"),
            "issn":             issn_print,
            # El identificador consultado puede ser el ISSN impreso: no usarlo como E-ISSN
            "eissn":            entry.get("prism:eIssn") or "",
            "publisher":        entry.get("publisher", "N/A"),
            "disciplinas":      cat_names, # Lista de disciplinas
            "cobertura":        cobertura,
            "citeScore":        cs_value,
            "sitioWeb":         homepage,
            "scopusLink":       scopus_link
        }

        return base_dict, subject_ranks_list

    return None, f"Falló tras {max_retries} intentos"


# ══════════════════════════════════════════════════════════════════════════════
#  LOOP PRINCIPAL
# ══════════════════════════════════════════════════════════════════════════════

journal_json_list = []
id_counter = 1

for index, row in filtered_df.iterrows():
    issn   = row['ISSN']   if pd.notna(row['ISSN'])   else None
    e_issn = row['E-ISSN'] if pd.notna(row['E-ISSN']) else None

    # Normalizar '-' a None
    issn   = None if issn   in ('-', '') else issn
    e_issn = None if e_issn in ('-', '') else e_issn

    target_issn = e_issn if e_issn else issn
    nombre      = row['Nombre de la revista / fuente']

    if target_issn:
        print(f"Fetching: {nombre} (ISSN: {target_issn})")
        base_data, scopus_categories = get_journal_metadata(target_issn)

        # Scopus a veces solo reconoce el ISSN impreso (p. ej. EURASIP JASMP)
        if not base_data and e_issn and issn and issn != e_issn:
            print(f"  ↻ Reintentando con el ISSN impreso: {issn}")
            base_data, scopus_categories = get_journal_metadata(issn)

        # Aprobada pero no indexada en Scopus: se publica con los datos de la hoja.
        # Solo ante un 404; un timeout o error del servidor no debe degradar la ficha.
        if not base_data and scopus_categories == NOT_IN_SCOPUS:
            print(f"  ↳ No está en Scopus: se publica con los datos de la hoja")
            base_data, scopus_categories = sheet_only_entry(nombre, issn, e_issn), []

        if base_data:
            # El E-ISSN registrado en la hoja tiene prioridad sobre el de Scopus
            if e_issn:
                base_data["eissn"] = e_issn
            base_data["id"] = id_counter
            id_counter += 1
            base_data["categorias_scopus"] = scopus_categories

            # ── ENRIQUECIMIENTO CON EXCEL ─────────────────────────────────
            excel_row = find_excel_row(
                nombre = nombre,
                issn   = str(issn)   if issn   else "",
                e_issn = str(e_issn) if e_issn else ""
            )
            base_data = enrich_with_excel(base_data, excel_row)

            # ── CLASIFICACIÓN TAXONOMÍA ULIMA ─────────────────────────────
            base_data["clasificacion_ulima"] = classify_journal_ulima(
                base_data.get("categorias_scopus", [])
            ) or classify_manual(issn, e_issn)

            # Enfoque: la primera línea prioritaria de la revista
            if base_data["clasificacion_ulima"]:
                base_data["enfoque"] = base_data["clasificacion_ulima"][0]["Linea"]
            else:
                base_data["enfoque"] = "General"

            if excel_row is None:
                print(f"  ⚠ Sin match en Excel: {nombre}")

            journal_json_list.append(base_data)
        else:
            print(f"  ✗ Error Scopus: {scopus_categories}")
    else:
        print(f"  ✗ Sin ISSN válido: {nombre}")

    time.sleep(0.5)

# ── CONSTRUCCIÓN ESTRUCTURA FINAL ─────────────────────────────────────────────
from datetime import datetime

# Facetas
publishers_facets = sorted(list(set(r['publisher'] for r in journal_json_list if r.get('publisher'))))
disciplinas_facets = sorted(list(set(d for r in journal_json_list for d in r.get('disciplinas', []))))
tipos_facets = ["Data Journal", "Research Journal"]

# Líneas prioritarias presentes en el catálogo, en el orden oficial
lineas_presentes = {c['Linea'] for r in journal_json_list for c in r.get('clasificacion_ulima', [])}
lineas_facets = [linea for linea in TAXONOMIA if linea in lineas_presentes]

final_output = {
    "metadata": {
        "totalRevistas": len(journal_json_list),
        "publishers": len(publishers_facets),
        "disciplinas": len(disciplinas_facets),
        "lineas": len(lineas_facets),
        "lastUpdated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "version": "2.0"
    },
    "taxonomy": TAXONOMIA,
    "revistas": journal_json_list,
    "facets": {
        "publishers": publishers_facets,
        "tipos": tipos_facets,
        "disciplinas": disciplinas_facets,
        "lineas": lineas_facets
    }
}

sin_linea = [r['journal'] for r in journal_json_list if not r.get('clasificacion_ulima')]
print(f"\nRevistas publicadas: {len(journal_json_list)} | sin línea prioritaria: {len(sin_linea)}")
for journal in sin_linea:
    print(f"  · {journal}")

# Guardar en archivo
root_dir = os.path.join(script_dir, '..', '..')
output_path = os.path.join(root_dir, 'frontend', 'public', 'revistas.json')
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(final_output, f, indent=2, ensure_ascii=False)

# ── CONTRUCCIÓN ESTRUCTURA FINAL DE REVISTAS OBSERVADAS (MALAS PRÁCTICAS) ────
try:
    df_malas = df[
        (df['Estado'] == 'Vigente') & 
        (df['Conclusión'].str.contains('Posibles indicios de malas prácticas', na=False))
    ]
    df_malas = deduplicate_reviews(df_malas)
    
    malas_json_list = []
    
    for _, row in df_malas.iterrows():
        # Get data safely to avoid NaNs
        def get_val(col):
            val = row[col] if col in df_malas.columns else ""
            return "" if pd.isna(val) else str(val).strip()

        malas_json_list.append({
            "journal": get_val('Nombre de la revista / fuente'),
            "issn": get_val('ISSN'),
            "eissn": get_val('E-ISSN'),
            "enlace_informe": get_val('Enlace del informe'),
            "conclusion": get_val('Conclusión')
        })

    # Save to file
    observadas_output_path = os.path.join(root_dir, 'frontend', 'public', 'revistas_observadas.json')
    with open(observadas_output_path, 'w', encoding='utf-8') as f:
        json.dump({"revistas_observadas": malas_json_list}, f, indent=2, ensure_ascii=False)
    
    print(f"Se guardaron {len(malas_json_list)} revistas observadas en: {observadas_output_path}")

except Exception as e:
    print(f"Hubo un error procesando las revistas observadas: {e}")

print(f"\nProceso completado general. Archivo generado en: {output_path}")

