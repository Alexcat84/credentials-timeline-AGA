# Diploma / Certificate image mapping

Use this list to map each diploma image to the correct credential **id** (and **correlative** when there are multiple images) for `imageUrls` in `data/credentials.json`.

---

## Códigos y correlativos

- **Un solo documento por credencial:** usa el **Code** tal cual (ej. `primary`, `9`, `28`).
- **Varios documentos (múltiples imágenes) para la misma credencial:** usa **correlativos al final**:  
  `{id}-1`, `{id}-2`, `{id}-3`, … en el **orden** en que deben mostrarse.

Ejemplos:
- Una imagen para "Introduction to Programming" → código `9` → en JSON: `"imageUrls": ["/images/diplomas/cred-9.jpg"]`
- Tres imágenes para "Bachelor's Degree" → códigos `16-1`, `16-2`, `16-3` → en JSON:  
  `"imageUrls": ["/images/diplomas/cred-16-1.jpg", "/images/diplomas/cred-16-2.jpg", "/images/diplomas/cred-16-3.jpg"]`

Puedes **mantener tus nombres externos** en los archivos (ej. los nombres que ya les pusiste). Cuando subas la lista de nombres de archivos o un pantallazo, se puede hacer el **match** con esta tabla y codificar todo en `credentials.json`.

---

## Tabla: Code | Correlativo | Año | Título | Nombre externo sugerido (para match)

| Code | Correlativo | Year | Title | Nombre externo sugerido |
|------|-------------|------|-------|-------------------------|
| primary | — | 1997 | Primary Education | Primaria / Pbro. Leopoldo Nuñez / Ciudad de los Niños |
| 1 | — | 1997 | Plumbing | Plumbing / Plomería / HABIL 97 / Ciudad de los Niños |
| 2 | — | 1999 | Electronics | Electronics / Electrónica / Ciudad de los Niños / Eduardo Hill |
| 3 | — | 2000 | Swimming and Aquatic Rescue | Swimming / Natación / Cruz Roja / Aquatic Rescue |
| 4 | — | 2003 | Vocational Technical High School Diploma - Electrical Engineering | Thomas Jefferson / INTJ / Bachillerato Técnico / Electrical |
| 5 | 5-1, 5-2, … | 2003 | Preparation for Youth Productive Integration | País Joven / Youth Productive Integration / Familia |
| 6 | — | 2003 | Technical Management and Business Training | TechnoServe / Technical Management / Business Training |
| 7 | — | 2003 | Information Technology Training | ITCA-FEPADE / Information Technology Training |
| 8 | — | 2003 | Skills and Abilities to Strengthen Entrepreneurial Capacity | UPES / Entrepreneurial Capacity / Habilidades emprendedoras |
| 9 | — | 2003 | Introduction to Programming | AGAPE / Introducción a la Programación / Microsoft |
| 10 | — | 2003 | Hardware and Software Maintenance | AGAPE / Hardware Software Maintenance / Mantenimiento |
| 11 | — | 2003 | Visual Fox Pro I | AGAPE / Visual Fox Pro |
| 12 | — | 2003 | Corrective and Preventive Maintenance | AGAPE / Corrective Preventive Maintenance |
| 13 | — | 2003 | Networks | AGAPE / Networks / Redes |
| 14 | — | 2007 | Flood Rescue Techniques - TREPI Level I | TREPI / Flood Rescue / Cruz Roja / Técnicas rescate |
| 15 | — | 2008 | Swimming and Aquatic Rescue - Class of 2007 | Cruz Roja / Swimming 2007 / Instructor |
| 16 | 16-1, 16-2, … | 2009 | Bachelor's Degree in Electrical Engineering | Universidad de Sonsonate / Licenciatura / Electrical Engineering |
| 17 | — | 2011 | Principles of Metrology | Don Bosco / Metrology / Metrología |
| 18 | — | 2011 | Non-Destructive Testing - Liquid Penetrant (PT) Level II | NDT / Liquid Penetrant / PT Level II |
| 19 | — | 2012 | Non-Destructive Testing - Ultrasonic Testing Level II | NDT / Ultrasonic / UT Level II |
| 20 | — | 2012 | Non-Destructive Testing - Magnetic Particle Testing Level II | NDT / Magnetic Particle / MT Level II |
| 21 | — | 2013 | Professional Presentations for Trainers | Corposol / Professional Presentations / Presentaciones |
| 22 | — | 2013 | National Course on Radiological Protection | CIAN / Radiological Protection / Protección radiológica |
| 23 | — | 2013 | HCVM High-Energy Cargo and Vehicle Inspection - Train-The-Trainer | Smiths / HCVM / Cargo Vehicle Inspection |
| 24 | — | 2013 | HCVP High-Energy Cargo and Vehicle Inspection - Train-The-Trainer | Smiths / HCVP / Cargo Vehicle Inspection |
| 25 | — | 2013 | HCVL High-Energy Cargo and Vehicle Inspection - Train-The-Trainer | Smiths / HCVL / Cargo Vehicle Inspection |
| 26 | — | 2013 | Operation and Maintenance: HCVP, HCVM, HCVL, HI-SCAN, SABRE 5000 | Smiths / Operation Maintenance / SABRE 5000 |
| 27 | — | 2014 | Basic Orphan Source Search and Secure Training | US Department of Energy / Orphan Source / Basic Search Secure |
| 28 | 28-1, 28-2, … | 2015 | Master's in Management and Projects | La Salle / Vértice / Master Management Projects / Madrid |
| 29 | — | 2016 | New Management Trends for Human Resource Administration | Contrataciones Empresariales / Human Resource / Management Trends |
| 30 | — | 2016 | Fundamentals of Quality Control and ISO 9001:2008 | COTECNA / Quality Control / ISO 9001 2008 |
| 31 | — | 2016 | Quality Management Systems ISO 9001:2015 - Requirements Interpretation | V&M Quality / ISO 9001 2015 / Requirements |
| 32 | — | 2016 | Occupational Health and Safety | V&M Quality / Occupational Health Safety |
| 33 | — | 2016 | Planning of Health and Safety Services | V&M Quality / Planning Health Safety Services |
| 34 | — | 2016 | 48-Hour Occupational Health and Safety Course | MINTRAB / 48 Hour / Occupational Health Safety |
| 35 | — | 2016 | Diploma in Quality Management ISO 9001:2015 | FEPADE / Diploma Quality Management ISO 9001 2015 |
| 36 | — | 2017 | Quality Management Competency Unit - ISO 9001:2015 | COTECNA Certificadora / Quality Management / Bogotá |
| 37 | — | 2017 | Environmental Management Competency Unit - ISO 14001:2015 | COTECNA Certificadora / Environmental ISO 14001 / Bogotá |
| 38 | — | 2017 | Occupational Health and Safety Management - OHSAS 18001:2007 | COTECNA Certificadora / OHSAS 18001 / Bogotá |
| 39 | — | 2017 | Audit Competency Unit - ISO 19011:2011 | COTECNA Certificadora / Audit ISO 19011 / Bogotá |
| 40 | — | 2017 | Team Leader Competency Unit - ISO 19011:2011 | COTECNA Certificadora / Team Leader ISO 19011 / Bogotá |
| 41 | — | 2018 | Quality Management System According to ISO 9001:2015 - Update | V&M Quality / ISO 9001 2015 Update |
| 42 | — | 2018 | Business Ethics & Compliance Code E-Learning for Employees | Cotecna / Business Ethics Compliance / E-Learning |
| 43 | — | 2019 | Operations Development Program 2018 | COTECNA / Operations Development Program 2018 |
| 44 | — | 2019 | Interpretation of the Standard in Management System ISO 45001:2018 | V&M Quality / ISO 45001 2018 |
| 45 | — | 2019 | Environmental Management System According to ISO 14001:2015 | V&M Quality / Environmental ISO 14001 2015 |
| 46 | — | 2019 | Diploma in Logistics and Supply | Grupo Talento Humano / Diploma Logistics Supply |
| 47 | — | 2020 | Diploma in Formulation, Evaluation and Management of International Cooperation Projects | UFG INSAFORP / Formulation Evaluation Cooperation Projects |
| 48 | — | 2020 | Microsoft Project 2016 Course Series (11 Courses) | Skillsoft / INSAFORP / Microsoft Project 2016 |
| 49 | — | 2021 | Introduction to Economics | Carlos Slim / Fundación Carlos Slim / Introducción a la economía / Capacítate |
| 50 | — | 2021 | Economic Culture Introduction | Carlos Slim / Economic Culture / Capacítate |
| 51 | — | 2022 | Microcontroller Programmer - CERTIFIED | Carlos Slim / Microcontroller Programmer / Capacítate |
| 52 | — | 2023 | Negotiation Skills | Carlos Slim / Negotiation Skills / Capacítate |
| 53 | — | 2024 | English for Academic Purposes (EAP) | Algonquin / EAP / English Academic Purposes / Ontario |
| 54 | — | 2025 | Ontario Worker Health & Safety Awareness (OHSA) | YOW Canada / OHSA / Health Safety Awareness |
| 55 | — | 2025 | Workplace Hazardous Materials Information System (WHMIS) | YOW Canada / WHMIS |
| 56 | 56-1, 56-2, … | 2025 | Project Management - Ontario College Graduate Certificate | Algonquin / Project Management / Graduate Certificate / Ontario |
| 57 | — | 2025 | Pathways to ICI: Upskilling Toolkit - Communication | OGCA / Pathways ICI / Communication |
| 58 | — | 2025 | Pathways to ICI: Upskilling Toolkit - Planning, Organization and Time Management | OGCA / Pathways ICI / Planning Organization Time |
| 59 | — | 2025 | Pathways to ICI: Upskilling Toolkit - Conflict Resolution | OGCA / Pathways ICI / Conflict Resolution |
| 60 | — | 2025 | Pathways to ICI: Upskilling Toolkit - Problem Solving | OGCA / Pathways ICI / Problem Solving |
| 61 | — | 2025 | Pathways to ICI: Upskilling Toolkit - Relationship Building | OGCA / Pathways ICI / Relationship Building |

En la columna **Correlativo**, "—" significa una sola imagen; "5-1, 5-2, …" significa que esa credencial puede tener varias imágenes en ese orden (usa los códigos 5-1, 5-2, etc. al nombrar archivos o al hacer el match).

---

## Cómo usar

1. **Si usas nombres de archivo con código:**  
   Un documento: `cred-9.jpg` → credencial `9`.  
   Varios documentos (orden 1, 2, 3): `cred-16-1.jpg`, `cred-16-2.jpg`, `cred-16-3.jpg` → credencial `16` con `imageUrls` en ese orden.

2. **Si mantienes tus nombres externos:**  
   Envía el listado de tus documentos (nombres que les pusiste). Con la columna "Nombre externo sugerido" y el título de cada credencial se hace el **match** y se te devuelve el código y, si aplica, el correlativo (ej. 16-1, 16-2). Luego se pueden añadir los `imageUrls` en `credentials.json` en el orden correcto.

3. **En `credentials.json`:**  
   Para una credencial con varias imágenes, el array va en el orden de visualización:
   ```json
   "imageUrls": [
     "/images/diplomas/tu-archivo-pagina-1.jpg",
     "/images/diplomas/tu-archivo-pagina-2.jpg"
   ]
   ```

Cuando tengas la lista de tus diplomas (con los nombres externos que uses) o las imágenes listas para subir, se puede hacer el match y dejar codificado todo en los datos.
