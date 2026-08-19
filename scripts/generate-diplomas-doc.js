/**
 * Generates a markdown document with all diplomas/credentials organized by category
 * (same structure as "Diplomas by category" in the app).
 * Run: node scripts/generate-diplomas-doc.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const credentialsPath = path.join(__dirname, '../public/data/credentials.json');
const categoriesPath = path.join(__dirname, '../public/data/categories.json');
const outPath = path.join(__dirname, '../Diplomas-by-Category.md');

const credentialsData = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

const { profile, credentials } = credentialsData;
const categories = categoriesData.categories;

const topicCategories = categories.filter((c) => c.type === 'topic');
const geoCategories = categories.filter((c) => c.type === 'geographic');

function formatCredential(c) {
  const parts = [];
  parts.push(`**${c.title}**`);
  parts.push(`- *${c.institution}*`);
  parts.push(`- ${c.location}`);
  parts.push(`- ${c.year}${c.date ? ` · ${c.date}` : ''}`);
  if (c.duration) parts.push(`- Duración: ${c.duration}`);
  if (c.notes) parts.push(`- ${c.notes}`);
  return parts.join('\n  ');
}

const lines = [];

lines.push('# Diplomas por categoría');
lines.push('');
lines.push(`**${profile.shortName || profile.name}**  \n${profile.title}  \nPeríodo: ${profile.recordPeriod}`);
lines.push('');
lines.push('---');
lines.push('');

// By topic category (as in the app "Diplomas by category")
lines.push('## Por categoría temática');
lines.push('');

for (const cat of topicCategories) {
  const creds = credentials
    .filter((c) => c.categories.includes(cat.id))
    .sort((a, b) => a.year - b.year || a.numericId - b.numericId);
  if (creds.length === 0) continue;
  lines.push(`### ${cat.label} (${creds.length})`);
  lines.push('');
  for (const c of creds) {
    lines.push(formatCredential(c));
    lines.push('');
  }
  lines.push('');
}

lines.push('---');
lines.push('');
lines.push('## Por ubicación geográfica');
lines.push('');

for (const cat of geoCategories) {
  const creds = credentials
    .filter((c) => c.categories.includes(cat.id))
    .sort((a, b) => a.year - b.year || a.numericId - b.numericId);
  if (creds.length === 0) continue;
  lines.push(`### ${cat.label} (${creds.length})`);
  lines.push('');
  for (const c of creds) {
    lines.push(formatCredential(c));
    lines.push('');
  }
  lines.push('');
}

lines.push('---');
lines.push('');
lines.push(`*Documento generado a partir de los datos de Diplomas by Category. Total: ${credentials.length} credenciales.*`);

fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log('Written:', outPath);
