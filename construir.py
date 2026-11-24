"""
Arma las páginas del sitio del Colegio Santa Margarita de Escocia.

Uso (desde esta carpeta):
    python construir.py

- La plantilla común (encabezado, menú y pie de página) está en _fuente/base.html.
- El contenido de cada página está en _fuente/paginas/<archivo>.html.
  Cada archivo empieza con un bloque de datos entre <!-- y -->:

      titulo: Conócenos
      descripcion: Texto para Google (1 o 2 frases).
      menu: conocenos            (conocenos | proyecto | basica | admision | comunidad)
      aviso: si                  (muestra la barra de Admisión 2027)
      migas: Inicio=index.html > Conócenos
      h1: Conócenos
      bajada: Historia, identidad institucional, equipo e infraestructura.
      buscar: no                 (no incluir esta página en el buscador)

- El resultado son archivos .html normales en esta carpeta. No editar esos
  archivos a mano: los cambios se pierden la próxima vez que se construye.
- También genera assets/js/indice-busqueda.js para el buscador del sitio.
"""

import html
import io
import json
import os
import re

RAIZ = os.path.dirname(os.path.abspath(__file__))
FUENTE = os.path.join(RAIZ, "_fuente")
PAGINAS = os.path.join(FUENTE, "paginas")
NOMBRE = "Colegio Santa Margarita de Escocia"
MENUS = ["conocenos", "proyecto", "basica", "admision", "comunidad"]

# Carpeta donde queda publicado el sitio. La usa la página 404 para encontrar
# sus estilos e imágenes desde cualquier dirección.
#   GitHub Pages (usuario.github.io/colegio-sme/) -> "/colegio-sme/"
#   Dominio propio (www.colegiosme.cl/)          -> "/"
RUTA_PUBLICA = "/colegio-sme/"

AVISO = """    <div class="announcement" id="announcement">
      <span class="announcement__spacer" aria-hidden="true"></span>
      <a class="announcement__link" href="admision.html">
        <span>Admisión 2027 abierta · Revisa fechas y Requisitos</span>
        <img class="announcement__arrow" src="assets/img/link-indicator.svg" width="48" height="7" alt="">
      </a>
      <button class="announcement__close" type="button" id="announcement-close" aria-label="Cerrar aviso de admisión">X</button>
    </div>
"""


def leer(ruta):
    with io.open(ruta, encoding="utf-8") as f:
        return f.read()


def escribir(ruta, texto):
    with io.open(ruta, "w", encoding="utf-8", newline="\n") as f:
        f.write(texto)


def separar(texto):
    """Devuelve (datos, contenido) a partir del bloque <!-- ... --> inicial."""
    m = re.match(r"\s*<!--(.*?)-->\s*\n?", texto, re.S)
    if not m:
        raise ValueError("Falta el bloque de datos <!-- ... --> al inicio")
    datos = {}
    for linea in m.group(1).splitlines():
        if ":" in linea:
            clave, valor = linea.split(":", 1)
            datos[clave.strip()] = valor.strip()
    return datos, texto[m.end():]


def migas(texto):
    if not texto:
        return ""
    items = []
    for parte in [p.strip() for p in texto.split(">")]:
        if "=" in parte:
            nombre, href = parte.split("=", 1)
            items.append(f'<li><a href="{href.strip()}">{html.escape(nombre.strip())}</a></li>')
        else:
            items.append(f'<li aria-current="page">{html.escape(parte)}</li>')
    filas = "\n        ".join(items)
    return (
        '    <nav class="breadcrumb" aria-label="Ruta de navegación">\n'
        "      <ol>\n"
        f"        {filas}\n"
        "      </ol>\n"
        "    </nav>\n\n"
    )


def encabezado(h1, bajada):
    if not h1:
        return ""
    return (
        '    <section class="page-header">\n'
        '      <div class="page-header__inner">\n'
        f'        <h1 class="page-header__title">{h1}</h1>\n'
        f'        <p class="page-header__lead">{bajada}</p>\n'
        "      </div>\n"
        "    </section>\n"
    )


def texto_plano(contenido):
    sin_scripts = re.sub(r"<(script|style)\b.*?</\1>", " ", contenido, flags=re.S)
    sin_comentarios = re.sub(r"<!--.*?-->", " ", sin_scripts, flags=re.S)
    plano = html.unescape(re.sub(r"<[^>]+>", " ", sin_comentarios))
    return re.sub(r"\s+", " ", plano).strip()


def construir():
    base = leer(os.path.join(FUENTE, "base.html"))
    indice = []
    hechas = []

    for archivo in sorted(os.listdir(PAGINAS)):
        if not archivo.endswith(".html"):
            continue
        datos, contenido = separar(leer(os.path.join(PAGINAS, archivo)))
        titulo = datos.get("titulo", NOMBRE)
        es_inicio = archivo == "index.html"
        titulo_completo = f"{NOMBRE} · Ñuñoa" if es_inicio else f"{titulo} · {NOMBRE}"

        pagina = base
        reemplazos = {
            "{{titulo_completo}}": html.escape(titulo_completo, quote=False),
            "{{descripcion}}": html.escape(datos.get("descripcion", ""), quote=True),
            "{{base}}": f'  <base href="{RUTA_PUBLICA}">\n' if datos.get("base") == "raiz" else "",
            "{{robots}}": '  <meta name="robots" content="noindex">\n' if datos.get("buscar") == "no" else "",
            "{{aviso}}": AVISO if datos.get("aviso") == "si" else "",
            "{{migas}}": migas(datos.get("migas", "")),
            "{{encabezado_pagina}}": encabezado(datos.get("h1", ""), datos.get("bajada", "")),
            "{{contenido}}": contenido.rstrip("\n"),
            "{{scripts}}": '  <script src="assets/js/indice-busqueda.js" defer></script>\n'
            if datos.get("indice") == "si" else "",
        }
        for clave, valor in reemplazos.items():
            pagina = pagina.replace(clave, valor)
        for menu in MENUS:
            pagina = pagina.replace("{{actual:" + menu + "}}", " is-current" if datos.get("menu") == menu else "")

        sobrantes = re.findall(r"\{\{[^}]+\}\}", pagina)
        if sobrantes:
            raise ValueError(f"{archivo}: marcadores sin reemplazar {sobrantes}")

        escribir(os.path.join(RAIZ, archivo), pagina)
        hechas.append(archivo)

        if datos.get("buscar") != "no":
            plano = texto_plano(datos.get("h1", "") + " " + datos.get("bajada", "") + " " + contenido)
            indice.append({
                "titulo": titulo,
                "url": archivo,
                "descripcion": datos.get("descripcion", ""),
                "texto": plano,
            })

    escribir(
        os.path.join(RAIZ, "assets", "js", "indice-busqueda.js"),
        "/* Generado por construir.py: no editar a mano. */\n"
        "window.SME_INDICE = " + json.dumps(indice, ensure_ascii=False, indent=1) + ";\n",
    )
    print(f"Listo: {len(hechas)} páginas")
    for nombre in hechas:
        print("  -", nombre)


if __name__ == "__main__":
    construir()
