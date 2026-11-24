# Colegio Santa Margarita de Escocia — sitio web

Versión programada del prototipo de Figma **Colegio_SME** (página «03 — Prototipo»), con sus 18 pantallas.
Hecha en HTML, CSS y JavaScript simples: no hay que instalar nada.

- Figma: `https://www.figma.com/design/zu6w3bJSkXpZvYi1t4PUOJ/Colegio_SME`

## Publicación

- Sitio en línea: https://lukasbarahona.github.io/colegio-sme/
- Repositorio: https://github.com/LukasBarahona/colegio-sme (público, publicado con GitHub Pages desde la rama `main`)

Para publicar cambios, desde esta carpeta:

```
python construir.py
git add -A
git commit -m "Describe el cambio"
git push
```

GitHub Pages actualiza el sitio en uno o dos minutos. Si el sitio se cambia a un dominio propio (por ejemplo www.colegiosme.cl), cambia `RUTA_PUBLICA` en `construir.py` a `"/"` y vuelve a construir.

## Cómo verlo en tu computador

Desde esta carpeta:

```
python -m http.server 8790
```

Después abre `http://localhost:8790`.

## Cómo editar

**No edites los `.html` de esta carpeta**: se generan solos. Edita los archivos de `_fuente/` y después corre:

```
python construir.py
```

| Quiero cambiar… | Archivo |
|---|---|
| Menú, encabezado, Accesos o pie de página (todas las páginas) | `_fuente/base.html` |
| El contenido de una página | `_fuente/paginas/<página>.html` |
| Título, descripción para Google, ruta de navegación o encabezado azul | El bloque `<!-- ... -->` al inicio de cada archivo de `_fuente/paginas/` |
| Colores, tipografías y medidas (base tomada de Figma) | `assets/css/styles.css` |
| Rediseño: encabezado azul translúcido, portada a pantalla completa, collage, animaciones | `assets/css/diseno.css` (se carga después y manda) |
| Foto de fondo del encabezado de una página | Línea `foto:` en el bloque de datos de la página |
| Menús, pestañas, filtros, galería, formulario y buscador | `assets/js/main.js` |

Al construir también se actualiza el índice del buscador (`assets/js/indice-busqueda.js`).

## Páginas

| Figma | Archivo | Funciones |
|---|---|---|
| P01 Inicio | index.html | Barra de admisión que se puede cerrar |
| P02 Conócenos | conocenos.html | — |
| P03 Nuestro Proyecto | nuestro-proyecto.html | Diagrama de 4 etapas (vertical en teléfono) |
| P04 Básica y Media | basica-y-media.html | Pestañas Básica / Media. Los horarios abren los PDF reales de colegiosme.cl |
| P05 Admisión | admision.html | Barra de admisión visible, como en Figma |
| P06 Comunidad | comunidad.html | Galería con giro automático |
| P07 Noticias | noticias.html | Filtros por año y categoría |
| P08 Detalle de noticia | noticia.html | — |
| P09 Calendario escolar | calendario-escolar.html | — |
| P10 Información útil | informacion-util.html | — |
| P11 Documentos | documentos.html | Filtros por año y categoría |
| P12 Contacto | contacto.html | Formulario con estados de error y éxito |
| P13 Resultados de búsqueda | busqueda.html | Buscador sobre todas las páginas |
| P14 Página no encontrada | 404.html | Se muestra sola en Firebase, Netlify o Cloudflare Pages |
| P15 Sin resultados | busqueda.html | Aparece cuando la búsqueda no encuentra nada |
| P16 Misión y visión | mision-y-vision.html | — |
| P17 Matrícula 2026 | matricula-2026.html | Tablas que en teléfono pasan a fichas |
| P18 Estudiantes · Reglamentos y Becas | estudiantes.html | — |
| Estados del encabezado | todas | Menú Conócenos, panel Accesos, búsqueda abierta y menú del teléfono |

## Contenido pendiente (viene así desde Figma)

- [PENDIENTE] Textos marcados como `[CONTENIDO POR VALIDAR]`, `[TÍTULO POR VALIDAR]`, `[FECHA POR CONFIRMAR]`, `[DATO POR VALIDAR]`, `[EVENTO POR VALIDAR]`, `[ACTIVIDAD POR VALIDAR]`, `[DOCUMENTO VIGENTE PENDIENTE]`, `[FECHAS POR CONFIRMAR]` y `[DIRECCIÓN, HORARIO, TELÉFONO Y CORREO POR VALIDAR]`. Figma indica que no se publiquen así.
- [PENDIENTE] Algunas frases de Figma parecen notas internas y no textos para el público. Hay que decidir si se borran: «Usar solo cifras institucionales validadas», «Diagrama editable para explicar el proceso institucional», «Los campos incluyen estados de error y éxito en el sistema» y «Vacantes, becas, matrícula y requisitos deben validarse antes de publicar».
- [PENDIENTE] Admisión usa el mismo diagrama que Nuestro Proyecto («Necesidad identificada → … → Seguimiento y mejora»), igual que en Figma. Probablemente falta escribir las etapas reales de admisión.
- [PENDIENTE] Faltan los enlaces de todos los PDF, salvo los horarios: útiles, electivos, ficha de matrícula, reglamentos, becas y documentos. Mientras tanto se ven, pero no se pueden abrir, y al pasar el mouse dicen «por confirmar».
- [PENDIENTE] El acceso «Docentes» y las páginas «Privacidad» y «Accesibilidad» no tienen destino.
- [PENDIENTE] Las noticias usan la foto de la fachada como imagen de relleno.
- [PENDIENTE] Las fotos de Misión y visión (522×573 px) y de la galería (cerca de 900 px de ancho) vienen de Figma en baja resolución. Conviene pedir los originales.
- [PENDIENTE] El mapa del Inicio es un enlace a Google Maps.

## Rediseño visual (24-11-2026)

Pedido por Lukas después de la primera versión fiel a Figma:

- **Encabezado:** azul del colegio y translúcido (se ve el fondo detrás), más bajo (76 px; 64 px al bajar). Se vuelve más sólido al pasar la portada. En tablet y teléfono es azul sólido, sin vidrio.
- **Portada:** a pantalla completa, con botones «Admisión 2027» y «Conoce el colegio». En computador queda quieta y las secciones suben sobre ella.
- **Páginas internas:** encabezado con foto de fondo, con la ruta de navegación y el título encima.
- **Collage en el Inicio:** reemplaza la foto suelta de la comunidad; las fotos se descubren en cascada.
- **Animaciones:** títulos, tarjetas y bloques aparecen al llegar a la vista, una sola vez, y luego quedan quietos. Las barras de cifras crecen, «+250» cuenta hacia arriba y los conectores del diagrama se dibujan. Nada se anima si la persona pidió reducir el movimiento.
- **Estética:** todos los botones en forma de píldora, títulos con acento dorado, fondos alternos blanco y gris azulado, paneles azules con degradado y tarjetas con sombra suave.
- [PROPUESTA] Los textos nuevos del collage («Vida escolar» y «Una comunidad que se construye cada día») y el rótulo sobre el título de la portada no están en Figma: hay que validarlos con el colegio.

## Decisiones de la programación

- **Formulario de contacto:** no hay servidor. Al enviar, revisa los campos y abre el programa de correo de la persona con el mensaje listo para info@colegiosme.cl. [PROPUESTA] Más adelante se puede conectar a un servicio de formularios o a Firebase.
- **Filtros de Noticias y Documentos:** las opciones salen de los datos de cada tarjeta (`data-anio` y `data-categoria`). Hoy están vacíos, así que solo aparece «Filtrar por…». Al cargar noticias reales, completa esos datos y los filtros se llenan solos.
- **Buscador:** busca en el texto de todas las páginas, sin servidor. [INFERENCIA] Figma muestra el estado «Búsqueda abierta», pero el encabezado no tiene botón de búsqueda. Se agregó una lupa junto a ACCESOS.
- **Galería:** las cuatro fotos giran en cascada cada 5 segundos, así nunca se repite una. Se detiene al pasar el mouse y no gira si la persona pidió reducir el movimiento.
- **Barra de admisión:** se muestra en Inicio y en Admisión, como en Figma. En las demás páginas aparece cerrada.
- **Rutas de navegación:** Figma dice «Inicio › Sección › …». Se usaron rutas reales, por ejemplo «Inicio › Admisión › Matrícula 2026».
- **Menú completo:** se muestra desde 1360 px de ancho. Bajo eso aparece el botón de menú, como en el diseño de teléfono. Con la lupa agregada, el menú completo ya no cabe en 1280 px.
- [INFERENCIA] Figma no define los efectos al pasar el mouse, la portada en tablet ni los colores de error y éxito del formulario. Se eligieron valores sobrios, coherentes con el diseño.
- [INFERENCIA] En Misión y visión, el bloque se alineó a 80 px del borde, como las demás secciones. En Figma estaba a 30 px.
- El campo «Mensaje» es un recuadro de varias líneas. En Figma es de una línea.
