# Plan: Timeline jerárquico para reclutadores

Objetivo: que un reclutador vea en **pocos segundos** el recorrido completo y pueda **profundizar solo donde le interesa**, sin recorrer 62 ítems uno a uno.

---

## 1. Idea general

- **Nivel 0 (vista principal)**: Una sola línea con **hitos de años** (círculos) y entre ellos **resúmenes** (“X credentials here”).  
  Ejemplo: **1991** — *“2 courses”* — **1999** — *“…”* — **2003** — … — **2025**.
- **Zoom in**: Al hacer clic en un tramo (ej. “2 courses” entre 1991 y 1999), se abre **otro timeline** solo de ese periodo (primaria + plomería + electrónica). Ahí cada ítem es un nodo; clic en uno → **detalle completo** del curso.
- **Atrás / Adelante**: Flechas tipo navegador: **Back** = volver al nivel anterior (hasta salir al timeline principal). **Forward** = volver hacia adelante en el historial. No “siguiente nodo”, sino “vista anterior / siguiente” en la navegación.

Todo en **inglés** y pensado para uso rápido por reclutadores.

---

## 2. Niveles de vista (zoom)

| Nivel | Qué se ve | Acción clic |
|-------|-----------|-------------|
| **0 – Main timeline** | 7–10 hitos de años (ej. 1991, 1999, 2003, 2009, 2015, 2024, 2025). Entre hitos: texto/enlace tipo “2 courses taken here” (o “X credentials”). | Clic en el tramo / “X courses” → **zoom in** a ese periodo (nivel 1). |
| **1 – Segment timeline** | Timeline solo de ese periodo: nodos = credenciales (ej. Primary education, Plumbing, Electronics). Línea conectando nodos. | Clic en un nodo → **panel de detalle** con toda la info del curso. |
| **2 – Detail** | Un solo ítem: institución, fechas, ubicación, duración, notas, categorías. | Cerrar o “Back” → vuelve al segment timeline. |

Opcional: si en un segmento hay **muchos** cursos (ej. 15), se puede mostrar por **años**: clic en “2020” → sub-vista solo 2020; clic en un curso → detalle. Eso sería un nivel 1.5 (agrupar por año dentro del segmento).

---

## 3. Hitos principales (nivel 0)

Propuesta de círculos en la línea principal (ajustable):

| # | Año | Hito (label en inglés) |
|---|-----|------------------------|
| 1 | 1991 | Start of education |
| 2 | 1999 | End of primary / 9th grade |
| 3 | 2003 | Technical secondary diploma (Electrical Engineering) |
| 4 | 2009 | Bachelor’s degree (Electrical Engineering) |
| 5 | 2015 | Master’s (Management and Projects) |
| 6 | 2024 | English for Academic Purposes (EAP) |
| 7 | 2025 | Project Management (Graduate Certificate) |

Entre 1991 y 1999: “Primary education + 2 courses” (o “2 courses taken here”).  
Entre 1999 y 2003: “X credentials” (cursos en ese lapso).  
Y así para cada tramo. Cada tramo es **clicable** y lleva al timeline de ese periodo.

---

## 4. Navegación (flechas)

- **Back (←)**: Una vista hacia atrás en el historial (ej. de “segment 1991–1999” vuelve al main; de “detail” vuelve al segment). Si ya estás en main, deshabilitado.
- **Forward (→)**: Una vista hacia adelante en el historial (después de haber usado Back). Si no hay “adelante”, deshabilitado.
- Opcional: botón **“Main timeline”** o **“Zoom out all”** que vuelve directo al nivel 0 sin depender del historial.

Implementación: pila de vistas + índice actual (como historial del navegador). Al hacer clic en un tramo: se añade la nueva vista y se avanza el índice. Back: índice--; Forward: índice++.

---

## 5. Datos necesarios

- **Lista de hitos principales**: id, año (o año fin), label en inglés.
- **Segmentos**: para cada par de hitos consecutivos (A, B), lista de `credential_id` (o credenciales) con `year` entre A y B. Con eso se calcula el texto “X courses / credentials” y al hacer clic se filtran las credenciales para el timeline del segmento.
- **Credenciales**: las que ya tienes en `credentials.json` (id, title, year, institution, location, duration, categories, notes). Sin cambios de estructura.

Se puede añadir un `segments.json` o derivar segmentos en código a partir de los hitos y del array de credenciales.

---

## 6. ¿Es posible?

Sí. Resumen técnico:

1. **Vistas**: Tres tipos de “pantalla” (main, segment, detail). El estado de la app incluye `viewStack` y `currentIndex`. Lo que se pinta depende de `viewStack[currentIndex]`.
2. **Main**: React Flow (o SVG) con nodos = hitos y edges con un **componente de edge** o un **panel flotante** sobre el tramo que muestre “X credentials” y sea clicable. Clic → `pushView({ type: 'segment', fromYear, toYear })`.
3. **Segment**: Mismo React Flow pero con nodos = credenciales filtradas por `year >= fromYear && year <= toYear`. Clic en nodo → abrir panel de detalle (o `pushView({ type: 'detail', credentialId })` si quieres que Back desde detalle vuelva al segment).
4. **Detail**: Panel lateral o modal con todos los campos de la credencial. Botón “Back” o flecha Back global que hace `currentIndex--`.
5. **Back/Forward**: Barra o botones que llaman a `goBack()` / `goForward()` (cambiar `currentIndex` y re-renderizar la vista actual).

Dependencias: las que ya tienes (React, React Flow, Tailwind). Sin nuevas librerías críticas.

---

## 7. Fases sugeridas

| Fase | Entregable |
|------|------------|
| **1** | Definir hitos y segmentos en datos (JSON o código). Vista “main” con hitos y conteo por tramo (sin clic aún). |
| **2** | Tramos clicables: clic en “X credentials” → nueva vista “segment” con timeline de ese periodo (nodos = credenciales). |
| **3** | Clic en un nodo en segment → panel de detalle completo. |
| **4** | Barra Back/Forward (y opcional “Main timeline”) con historial de vistas. |
| **5** | Ajustes: textos en inglés, tooltips, agrupación por año si hay muchos ítems en un segmento. |

Si confirmas que este plan coincide con lo que quieres (sobre todo: main = hitos + “X courses” entre ellos, zoom in = timeline del periodo, clic = detalle, flechas = atrás/adelante en vistas), el siguiente paso es implementar la **Fase 1** (hitos + segmentos + vista main con conteos).
