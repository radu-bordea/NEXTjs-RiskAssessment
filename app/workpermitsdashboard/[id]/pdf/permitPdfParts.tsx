/**
 * permitPdfParts — building blocks for the Work Permit PDFs
 *
 * Location: app/workpermitsdashboard/[id]/pdf/permitPdfParts.tsx
 *
 * Same library as RiskPDF / ObservationPDF (@react-pdf/renderer), blue theme.
 * No "use client" — runs on the server in the route handler.
 *
 * Note: the built-in PDF font (Helvetica) has no ✓ ⚠ ₂ symbols,
 * so answers are written as YES / NO / N/A badges.
 */

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer"
import type { ReactNode } from "react"

// ─── Colours ─────────────────────────────────────────────────────────────────
const BLUE = "#1e3a8a"
const BLUE_LIGHT = "#eff6ff"
const BORDER = "#cbd5e1"
const MUTED = "#64748b"
const TEXT = "#0f172a"

export const s = StyleSheet.create({
  page: { paddingTop: 28, paddingBottom: 44, paddingHorizontal: 32, fontSize: 9, color: TEXT, fontFamily: "Helvetica" },

  // Header
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 2, borderBottomColor: BLUE, paddingBottom: 8, marginBottom: 10 },
  title: { fontSize: 15, fontFamily: "Helvetica-Bold", color: BLUE },
  subtitle: { fontSize: 8, color: MUTED, marginTop: 2 },
  permitNo: { fontSize: 13, fontFamily: "Helvetica-Bold", textAlign: "right" },
  stateBadge: { marginTop: 3, alignSelf: "flex-end", paddingVertical: 2, paddingHorizontal: 6, borderRadius: 3, fontSize: 8, fontFamily: "Helvetica-Bold" },

  // Summary box under the header
  summary: { flexDirection: "row", flexWrap: "wrap", backgroundColor: BLUE_LIGHT, borderRadius: 4, padding: 8, marginBottom: 10 },
  summaryItem: { width: "33.33%", paddingVertical: 2, paddingRight: 6 },

  // Sections
  section: { marginBottom: 9 },
  sectionTitle: { backgroundColor: BLUE, color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 9.5, paddingVertical: 3.5, paddingHorizontal: 6, borderRadius: 2, marginBottom: 4 },
  sectionNote: { fontSize: 7.5, color: MUTED, marginBottom: 4, fontFamily: "Helvetica-Oblique" },

  // Label / value fields
  fields: { flexDirection: "row", flexWrap: "wrap" },
  field: { width: "50%", paddingRight: 8, marginBottom: 5 },
  fieldFull: { width: "100%", marginBottom: 5 },
  label: { fontSize: 7, color: MUTED, textTransform: "uppercase", marginBottom: 1.5 },
  value: { fontSize: 9 },
  empty: { fontSize: 9, color: "#94a3b8" },

  // Question rows
  row: { flexDirection: "row", alignItems: "center", borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0", paddingVertical: 3 },
  rowNo: { width: 16, color: MUTED },
  rowLabel: { flex: 1, paddingRight: 8 },
  badge: { width: 34, textAlign: "center", paddingVertical: 1.5, borderRadius: 2, fontSize: 7.5, fontFamily: "Helvetica-Bold" },

  // Tables
  table: { borderWidth: 0.5, borderColor: BORDER, borderRadius: 2 },
  tr: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: BORDER },
  th: { backgroundColor: BLUE_LIGHT, fontFamily: "Helvetica-Bold", fontSize: 7.5, padding: 3 },
  td: { fontSize: 8, padding: 3 },

  // Lists
  listItem: { flexDirection: "row", marginBottom: 2 },
  bullet: { width: 12, color: MUTED },

  // Footer
  footer: { position: "absolute", bottom: 18, left: 32, right: 32, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: MUTED, borderTopWidth: 0.5, borderTopColor: BORDER, paddingTop: 4 },
})

// ─── Formatting ──────────────────────────────────────────────────────────────

/** Text with symbols the PDF font cannot draw replaced (H₂S → H2S, ✓ → removed …) */
export function pdfText(value: string) {
  return value.replace(/₂/g, "2").replace(/[✓✔⚠️⏱]/g, "").trim()
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/**
 * Formats the date strings the form saved, AS TYPED on the vessel (no time-zone change):
 * "2026-11-25" → "25 Nov 2026",  "2026-11-25T08:30" → "25 Nov 2026, 08:30"
 */
export function fmtLocal(value: string | null | undefined) {
  if (!value) return ""
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/)
  if (!m) return value
  const [, y, mo, d, h, mi] = m
  const date = `${d} ${MONTHS[Number(mo) - 1] ?? mo} ${y}`
  return h ? `${date}, ${h}:${mi}` : date
}

/** A real moment from the DB (closed-out time…) → "25 Nov 2026, 09:30" (Oslo, like the dashboard) */
export function fmtMoment(d: Date | null | undefined) {
  if (!d) return ""
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  })
}

/** Hours between two typed date-times, e.g. "8" or "6.5" */
export function hoursText(from: string, to: string) {
  if (!from || !to) return ""
  const h = (new Date(to).getTime() - new Date(from).getTime()) / 3_600_000
  if (!Number.isFinite(h)) return ""
  return `${Number.isInteger(h) ? h : h.toFixed(1)} hours`
}

// ─── Layout pieces ───────────────────────────────────────────────────────────

const STATE_PDF: Record<string, { label: string; bg: string; color: string }> = {
  DRAFT: { label: "DRAFT", bg: "#fef3c7", color: "#b45309" },
  COMPLETED: { label: "COMPLETED", bg: "#dbeafe", color: "#1d4ed8" },
  CLOSED_OUT: { label: "CLOSED-OUT", bg: "#d1fae5", color: "#047857" },
}

export type PdfPermitInfo = {
  permitNo: string
  state: string
  vessel: string
  projectVoyage: string | null
  issueDate: Date
  createdByName: string
  closedOutAt: Date | null
  closedOutByName: string | null
}

/** Whole document: header, summary box, your sections, footer with page numbers */
export function PermitPdfDocument({
  title,
  formRef,
  permit,
  children,
}: {
  title: string
  /** e.g. "Form 34 · Revision 001 · Last revised 20.05.25" */
  formRef: string
  permit: PdfPermitInfo
  children: ReactNode
}) {
  const state = STATE_PDF[permit.state] ?? STATE_PDF.COMPLETED
  const generated = fmtMoment(new Date())

  return (
    <Document title={`${permit.permitNo} — ${title}`} author={permit.vessel} subject={title}>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header} fixed>
          <View>
            <Text style={s.title}>{title.toUpperCase()}</Text>
            <Text style={s.subtitle}>{formRef}</Text>
          </View>
          <View>
            <Text style={s.permitNo}>{permit.permitNo}</Text>
            <Text style={[s.stateBadge, { backgroundColor: state.bg, color: state.color }]}>{state.label}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={s.summary}>
          <SummaryItem label="Vessel" value={permit.vessel} />
          <SummaryItem label="Project / Voyage" value={permit.projectVoyage ?? ""} />
          <SummaryItem label="Issue date" value={fmtMoment(permit.issueDate).split(",")[0]} />
          <SummaryItem label="Created by" value={permit.createdByName} />
          {permit.closedOutAt && <SummaryItem label="Closed out" value={fmtMoment(permit.closedOutAt)} />}
          {permit.closedOutByName && <SummaryItem label="Closed out by" value={permit.closedOutByName} />}
        </View>

        {children}

        {/* Footer on every page */}
        <View style={s.footer} fixed>
          <Text>
            {permit.permitNo} · {permit.vessel}
          </Text>
          <Text>Generated {generated}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.summaryItem}>
      <Text style={s.label}>{label}</Text>
      <Text style={value ? s.value : s.empty}>{value ? pdfText(value) : "—"}</Text>
    </View>
  )
}

/**
 * Section with a blue title bar. Kept on ONE page (moves to the next page if it does not fit),
 * so a title is never left alone at the bottom. Long tables use PdfTableSection instead.
 */
export function PdfSection({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <View style={s.section} wrap={false}>
      <Text style={s.sectionTitle}>{title}</Text>
      {note && <Text style={s.sectionNote}>{note}</Text>}
      {children}
    </View>
  )
}

/** Label + value. `full` = whole width (long text) */
export function PdfField({ label, value, full }: { label: string; value: string | null | undefined; full?: boolean }) {
  const v = value?.trim() ?? ""
  return (
    <View style={full ? s.fieldFull : s.field} wrap={false}>
      <Text style={s.label}>{label}</Text>
      <Text style={v ? s.value : s.empty}>{v ? pdfText(v) : "—"}</Text>
    </View>
  )
}

export function PdfFields({ children }: { children: ReactNode }) {
  return <View style={s.fields}>{children}</View>
}

const BADGE: Record<string, { text: string; bg: string; color: string }> = {
  YES: { text: "YES", bg: "#d1fae5", color: "#047857" },
  NO: { text: "NO", bg: "#fee2e2", color: "#b91c1c" },
  NA: { text: "N/A", bg: "#f1f5f9", color: "#475569" },
  "": { text: "—", bg: "#ffffff", color: "#94a3b8" },
}

export function AnswerBadge({ answer }: { answer: string }) {
  const b = BADGE[answer] ?? BADGE[""]
  return <Text style={[s.badge, { backgroundColor: b.bg, color: b.color }]}>{b.text}</Text>
}

/** One question with a YES / NO / N/A answer */
export function AnswerRow({ no, label, answer }: { no?: number; label: string; answer: string }) {
  return (
    <View style={s.row} wrap={false}>
      {no !== undefined && <Text style={s.rowNo}>{no}.</Text>}
      <Text style={s.rowLabel}>{pdfText(label)}</Text>
      <AnswerBadge answer={answer} />
    </View>
  )
}

/** Checklist item (checkbox in the form) → YES / NO */
export function CheckRow({ label, checked }: { label: string; checked: boolean }) {
  return <AnswerRow label={label} answer={checked ? "YES" : "NO"} />
}

/** Questions with YES / NO / N/A answers, from an options list */
export function AnswerList({
  items,
  answers,
  numbered,
}: {
  items: readonly { id: string; label: string }[]
  answers: Record<string, string>
  numbered?: boolean
}) {
  return (
    <View>
      {items.map((item, i) => (
        <AnswerRow key={item.id} no={numbered ? i + 1 : undefined} label={item.label} answer={answers[item.id] ?? ""} />
      ))}
    </View>
  )
}

/** Checkbox list from an options list */
export function CheckList({ items, checks }: { items: readonly { id: string; label: string }[]; checks: Record<string, boolean> }) {
  return (
    <View>
      {items.map((item) => (
        <CheckRow key={item.id} label={item.label} checked={checks[item.id] === true} />
      ))}
    </View>
  )
}

/** Simple list of names / items */
export function NameList({ label, names }: { label?: string; names: string[] }) {
  const list = names.map((n) => n.trim()).filter(Boolean)
  return (
    <View style={s.fieldFull} wrap={false}>
      {label && <Text style={s.label}>{label}</Text>}
      {list.length === 0 ? (
        <Text style={s.empty}>—</Text>
      ) : (
        list.map((n, i) => (
          <View key={`${n}-${i}`} style={s.listItem}>
            <Text style={s.bullet}>{i + 1}.</Text>
            <Text style={{ flex: 1 }}>{pdfText(n)}</Text>
          </View>
        ))
      )}
    </View>
  )
}

/** Cell text: "UNSAFE" is shown in bold red */
function Cell({ text, flex }: { text: string; flex: number }) {
  const unsafe = text === "UNSAFE"
  return (
    <Text style={[s.td, { flex }, unsafe ? { color: "#b91c1c", fontFamily: "Helvetica-Bold" } : {}]}>
      {text ? pdfText(text) : "—"}
    </Text>
  )
}

function TableHead({ columns, widths }: { columns: string[]; widths: number[] }) {
  return (
    <View style={s.tr}>
      {columns.map((c, i) => (
        <Text key={c} style={[s.th, { flex: widths[i] ?? 1 }]}>
          {c}
        </Text>
      ))}
    </View>
  )
}

function TableRow({ row, widths, last }: { row: string[]; widths: number[]; last: boolean }) {
  return (
    <View style={[s.tr, last ? { borderBottomWidth: 0 } : {}]} wrap={false}>
      {row.map((cell, ci) => (
        <Cell key={ci} text={cell} flex={widths[ci] ?? 1} />
      ))}
    </View>
  )
}

/** Small table (a few rows) — use inside a PdfSection. widths = flex weights per column */
export function PdfTable({
  columns,
  widths,
  rows,
  empty = "None recorded",
}: {
  columns: string[]
  widths: number[]
  rows: string[][]
  empty?: string
}) {
  if (rows.length === 0) return <Text style={s.empty}>{empty}</Text>
  return (
    <View style={s.table}>
      <TableHead columns={columns} widths={widths} />
      {rows.map((r, i) => (
        <TableRow key={i} row={r} widths={widths} last={i === rows.length - 1} />
      ))}
    </View>
  )
}

/**
 * Section with a table that can be LONG (entry log, atmosphere readings).
 * It may continue on the next page; the title always stays with the first rows.
 */
export function PdfTableSection({
  title,
  columns,
  widths,
  rows,
  empty = "None recorded",
}: {
  title: string
  columns: string[]
  widths: number[]
  rows: string[][]
  empty?: string
}) {
  const [first, ...rest] = rows
  return (
    <View style={s.section}>
      <View wrap={false}>
        <Text style={s.sectionTitle}>{title}</Text>
        {rows.length === 0 ? (
          <Text style={s.empty}>{empty}</Text>
        ) : (
          <View style={[s.table, { borderBottomWidth: rest.length ? 0 : 0.5 }]}>
            <TableHead columns={columns} widths={widths} />
            <TableRow row={first} widths={widths} last={rest.length === 0} />
          </View>
        )}
      </View>
      {rest.length > 0 && (
        <View style={[s.table, { borderTopWidth: 0 }]}>
          {rest.map((r, i) => (
            <TableRow key={i} row={r} widths={widths} last={i === rest.length - 1} />
          ))}
        </View>
      )}
    </View>
  )
}

/** "Yes" / "No" text for confirmations */
export const yesNo = (v: boolean) => (v ? "Yes — confirmed" : "No")