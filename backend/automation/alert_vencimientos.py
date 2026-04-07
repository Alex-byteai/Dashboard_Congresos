import json
import smtplib
import os
from email.message import EmailMessage
from datetime import datetime
from dateutil.relativedelta import relativedelta

# pip install python-dateutil python-dotenv
from dotenv import load_dotenv

script_dir = os.path.dirname(os.path.abspath(__file__))
# Cargar variables de entorno (credenciales seguras)
load_dotenv(os.path.join(script_dir, '..', 'config', '.env'))

SENDER_EMAIL = os.environ.get("ALERT_EMAIL")
SENDER_PASSWORD = os.environ.get("ALERT_PASSWORD")
RECEIVERS = os.environ.get("ALERT_RECEIVERS") # separadas por coma

def check_and_send_alerts():
    if not SENDER_EMAIL or not SENDER_PASSWORD or not RECEIVERS:
        print("⚠️ Credenciales de correo no encontradas en el archivo .env. No se mandarán alertas.")
        return

    json_path = os.path.join(script_dir, '..', '..', 'public', 'revistas.json')
    if not os.path.exists(json_path):
        print("⚠️ Archivo revistas.json no encontrado.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    revistas = data.get('revistas', [])
    hoy = datetime.now()
    alertas = []

    for r in revistas:
        fecha_str = r.get('fecha_emision')
        if not fecha_str or fecha_str == "N/A":
            continue
        
        try:
            # Soportar formatos que vienen del Excel (ej. 23/01/2026 o 2026-01-23)
            if '/' in fecha_str:
                fecha_emision = datetime.strptime(fecha_str.strip(), '%d/%m/%Y')
            else:
                fecha_emision = datetime.strptime(fecha_str.strip()[:10], '%Y-%m-%d')
            
            # Vencimiento = Fecha de emisión + 3 meses exactos
            fecha_vencimiento = fecha_emision + relativedelta(months=3)
            dias_restantes = (fecha_vencimiento - hoy).days

            # Alerta: si faltan 30 días o menos para el vencimiento (o si ya venció)
            if dias_restantes <= 30:
                alertas.append({
                    "nombre": r.get('journal', 'Sin nombre'),
                    "emision": fecha_emision.strftime('%d/%m/%Y'),
                    "vencimiento": fecha_vencimiento.strftime('%d/%m/%Y'),
                    "dias": dias_restantes,
                    "enlace": r.get('enlace_informe', '#')
                })
        except Exception as e:
            print(f"Error parseando fecha '{fecha_str}' para {r.get('journal')}: {e}")

    if not alertas:
        print("✅ No hay revistas próximas a vencer en los próximos 30 días.")
        return

    # Ordenar desde el más urgente hacia abajo
    alertas.sort(key=lambda x: x['dias'])

    # Preparar el cuerpo del correo en HTML
    html_content = """
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; color: #333; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f77f00; color: white; }
            .urgent { color: #d62828; font-weight: bold; }
            .warning { color: #f77f00; font-weight: bold; }
        </style>
    </head>
    <body>
        <h2>Sistema de Control de Integridad - IDIC</h2>
        <p>Este es un aviso automático de los informes de revistas que requieren revisión o han vencido (dentro de los 3 meses posteriores a su fecha de emisión).</p>
        <table>
            <tr>
                <th>Revista / Fuente</th>
                <th>F. Emisión</th>
                <th>Vencimiento</th>
                <th>Días Restantes</th>
                <th>Informe</th>
            </tr>
    """
    
    for a in alertas:
        estado_css = "urgent" if a["dias"] < 0 else "warning"
        texto_dias = "¡Vencido!" if a["dias"] < 0 else f"{a['dias']} días"
        
        html_content += f"""
            <tr>
                <td>{a["nombre"]}</td>
                <td>{a["emision"]}</td>
                <td>{a["vencimiento"]}</td>
                <td class="{estado_css}">{texto_dias}</td>
                <td><a href="{a["enlace"]}">Ver Documento</a></td>
            </tr>
        """
        
    html_content += """
        </table>
        <br>
        <p><i>Este correo fue generado automáticamente por el panel de control.</i></p>
    </body>
    </html>
    """

    # Enviar correo electrónico
    msg = EmailMessage()
    msg['Subject'] = f"🔔 Alerta IDIC: {len(alertas)} Informes Próximos a Vencer"
    msg['From'] = f"Notificación IDIC <{SENDER_EMAIL}>"
    msg['To'] = RECEIVERS
    msg.set_content("Tu cliente de correo requiere compatibilidad HTML para visualizar las alertas.")
    msg.add_alternative(html_content, subtype='html')

    try:
        # Usando Gmail SMTP por defecto
        print("📤 Enviando correo alerta...")
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(SENDER_EMAIL, SENDER_PASSWORD)
            smtp.send_message(msg)
        print("✅ Alertas enviadas correctamente por correo.")
    except Exception as e:
        print(f"❌ Error al enviar el correo electrónico: {e}")

if __name__ == "__main__":
    check_and_send_alerts()
