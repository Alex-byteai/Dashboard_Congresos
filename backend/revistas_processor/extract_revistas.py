import gspread
import pandas as pd

# Path to your service account key file
json_key_path = 'utility-cumulus-489121-p6-b2666eda463a.json'

# Authenticate with gspread using the service account key
gc = gspread.service_account(filename=json_key_path)

print('Authenticated successfully with Google Sheets.')

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
    display(df.head())
else:
    print('DataFrame is empty or not created.')


# Filter the DataFrame based on the specified conditions
filtered_df = df[(df['Estado'] == 'Vigente') & (df['Conclusión'].str.contains('No presenta indicios de malas prácticas', na=False))].copy()

def process_to_json(df_filtered):
    import json
    import os
    from datetime import datetime
    
    # Path relativo al archivo JSON del dashboard
    json_path = os.path.join('..', '..', 'public', 'revistas.json')
    
    # 1. Cargar datos existentes si existen
    existing_data = {"metadata": {}, "revistas": [], "facets": {}}
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        except Exception as e:
            print(f"Error loading existing JSON: {e}")
    
    # Preservar "Data Journals"
    data_journals = [r for r in existing_data.get('revistas', []) if r.get('tipo', 'Data Journal') == 'Data Journal']
    
    # 2. Procesar nuevos "Research Journals"
    research_journals = []
    start_id = max([r['id'] for r in data_journals], default=0) + 1
    
    for _, row in df_filtered.iterrows():
        # Mapeo exacto según las columnas proporcionadas por el usuario
        journal_name = row.get('Nombre de la revista / fuente', 'N/A')
        issn = row.get('ISSN', None)
        eissn = row.get('E-ISSN', None)
        publisher = row.get('Editorial', 'N/A')
        indexacion = row.get('Base de datos (Indexación)', '')
        
        # Procesar disciplinas/indexación como disciplinas para el dashboard
        disciplinas = [d.strip() for d in str(indexacion).split(',')] if indexacion else []
        
        journal_entry = {
            "id": start_id + len(research_journals),
            "journal": journal_name if pd.notna(journal_name) else 'N/A',
            "issn": issn if pd.notna(issn) and str(issn).strip() else None,
            "eissn": eissn if pd.notna(eissn) and str(eissn).strip() else None,
            "publisher": publisher if pd.notna(publisher) else 'N/A',
            "tipo": "Research Journal",
            "disciplinas": disciplinas,
            "sitioWeb": None # Esta columna no está en la lista proporcionada
        }
        research_journals.append(journal_entry)
    
    # 3. Combinar y actualizar metadatos y facetas
    all_revistas = data_journals + research_journals
    
    all_publishers = sorted(list(set([r['publisher'] for r in all_revistas if r.get('publisher') and r['publisher'] != 'N/A'])))
    all_disciplinas = sorted(list(set([d for r in all_revistas for d in r.get('disciplinas', []) if d])))
    
    new_json_data = {
        "metadata": {
            "totalRevistas": len(all_revistas),
            "publishers": len(all_publishers),
            "disciplinas": len(all_disciplinas),
            "lastUpdated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "version": "1.3"
        },
        "revistas": all_revistas,
        "facets": {
            "publishers": all_publishers,
            "tipos": ["Data Journal", "Research Journal"],
            "disciplinas": all_disciplinas
        }
    }
    
    # 4. Guardar archivo final
    try:
        os.makedirs(os.path.dirname(json_path), exist_ok=True)
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(new_json_data, f, indent=2, ensure_ascii=False)
        print(f'Done! Dashboard updated with {len(research_journals)} Research Journals.')
    except Exception as e:
        print(f"Error saving updated JSON: {e}")

if not filtered_df.empty:
    process_to_json(filtered_df)
else:
    print('No magazines matching criteria (Vigente + No malas prácticas) were found.')
