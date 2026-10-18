/**
 * Splits neon_dump_sqlite_ignore.sql (or neon_dump.sql) into per-table,
 * size-limited batch files that Cloudflare D1 can import:
 *   - one directory per table
 *   - batches of N statements, never exceeding MAX_BATCH_BYTES
 *   - reports statements that individually exceed D1's max statement size
 *
 * Usage:
 *   node scripts/d1-split-dump.mjs [path/to/dump.sql] [outDir]
 */
import fs from 'node:fs'
import path from 'node:path'

const MAX_BATCH_BYTES = 900_000 // keep well under D1 request limits
const MAX_STATEMENT_BYTES = 95_000 // D1 rejects single statements above ~100KB

const dumpPath = process.argv[2] || 'D:/Downloads/Preptio - Cloudflare/neon_dump.sql'
const outDir = process.argv[3] || '.d1-import'

if (!fs.existsSync(dumpPath)) {
  console.error(`Dump not found: ${dumpPath}`)
  process.exit(1)
}

const sql = fs.readFileSync(dumpPath, 'utf8')

// Split on ";" at end of a statement. Statements are single-line INSERTs in this
// dump, but values can contain ";" inside quoted strings, so only split on a
// semicolon that is followed by newline/EOF and is not inside a string.
function splitStatements(text) {
  const statements = []
  let current = ''
  let inString = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      current += ch
      if (ch === "'") {
        // '' is an escaped quote inside SQL strings
        if (text[i + 1] === "'") {
          current += text[++i]
        } else {
          inString = false
        }
      }
      continue
    }
    if (ch === "'") {
      inString = true
      current += ch
      continue
    }
    if (ch === ';') {
      const trimmed = current.trim()
      if (trimmed) statements.push(trimmed)
      current = ''
      continue
    }
    current += ch
  }
  const trimmed = current.trim()
  if (trimmed) statements.push(trimmed)
  return statements
}

const tableRe = /^INSERT\s+INTO\s+"([^"]+)"/i

const byTable = new Map()
let skipped = 0

for (const statement of splitStatements(sql)) {
  const match = statement.match(tableRe)
  if (!match) {
    skipped++
    continue
  }
  const table = match[1]
  if (!byTable.has(table)) byTable.set(table, [])
  byTable.get(table).push(statement + ';')
}

fs.rmSync(outDir, { recursive: true, force: true })

const summary = []
for (const [table, statements] of byTable) {
  const dir = path.join(outDir, table)
  fs.mkdirSync(dir, { recursive: true })

  const oversized = statements.filter((s) => Buffer.byteLength(s, 'utf8') > MAX_STATEMENT_BYTES)
  const usable = statements.filter((s) => Buffer.byteLength(s, 'utf8') <= MAX_STATEMENT_BYTES)

  let batch = []
  let batchBytes = 0
  let fileIndex = 0

  const flush = () => {
    if (!batch.length) return
    fileIndex++
    fs.writeFileSync(path.join(dir, `${String(fileIndex).padStart(3, '0')}.sql`), batch.join('\n'))
    batch = []
    batchBytes = 0
  }

  for (const statement of usable) {
    const bytes = Buffer.byteLength(statement, 'utf8')
    if (batchBytes + bytes > MAX_BATCH_BYTES) flush()
    batch.push(statement)
    batchBytes += bytes
  }
  flush()

  summary.push({
    table,
    statements: statements.length,
    batches: fileIndex,
    oversized: oversized.length,
  })
}

summary.sort((a, b) => a.table.localeCompare(b.table))
console.log('table'.padEnd(34), 'rows'.padStart(7), 'batches'.padStart(9), 'too-big'.padStart(9))
for (const row of summary) {
  console.log(
    row.table.padEnd(34),
    String(row.statements).padStart(7),
    String(row.batches).padStart(9),
    String(row.oversized).padStart(9)
  )
}
if (skipped) console.log(`\nNon-INSERT statements skipped: ${skipped}`)
console.log(`\nBatch files written to: ${path.resolve(outDir)}`)

const big = summary.filter((r) => r.oversized > 0)
if (big.length) {
  console.log('\nStatements too large for D1 (need column truncation or skipping):')
  for (const row of big) console.log(`  ${row.table}: ${row.oversized}`)
}
