"""
Líneas prioritarias de investigación de la Universidad de Lima.

Fuente única: frontend/src/shared/lineas_investigacion.json (también la usa el dashboard).
Las sublíneas se referencian con el código "línea.sublínea" según su orden oficial,
p. ej. "3.3" = Transformación digital… > Inteligencia artificial: gobernanza y aplicaciones.
"""
import json
import os

_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    '..', '..', 'frontend', 'src', 'shared', 'lineas_investigacion.json'
)

with open(_PATH, encoding='utf-8') as _f:
    LINEAS = json.load(_f)['lineas']

# {línea: [sublíneas]} en el orden oficial
TAXONOMIA = {linea['nombre']: linea['sublineas'] for linea in LINEAS}

# {"3.3": ("Transformación digital, datos e inteligencia tecnológica",
#          "Inteligencia artificial: gobernanza y aplicaciones")}
SUBLINEAS = {
    f'{i}.{j}': (linea['nombre'], sublinea)
    for i, linea in enumerate(LINEAS, start=1)
    for j, sublinea in enumerate(linea['sublineas'], start=1)
}


def validar_codigos(nombre_tabla, codigos):
    """Falla al iniciar si una tabla usa un código que no existe en la taxonomía."""
    invalidos = sorted(set(codigos) - set(SUBLINEAS))
    if invalidos:
        raise ValueError(f'{nombre_tabla}: códigos de sublínea inexistentes {invalidos}')
