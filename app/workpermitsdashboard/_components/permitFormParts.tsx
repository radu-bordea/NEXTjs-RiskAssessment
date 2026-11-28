"use client"

/**
 * permitFormParts — pieces shared by the 3 permit forms for VIEW / EDIT
 *
 * Location: app/workpermitsdashboard/_components/permitFormParts.tsx
 *
 * Each form runs in one of 4 modes:
 *  - "create"  → new permit                 → Save Draft + Issue Permit
 *  - "edit"    → existing DRAFT             → Save Draft + Issue Permit
 *  - "correct" → issued permit, Admin only  → Save Changes (full validation)
 *  - "view"    → read-only (👁)              → Back + Edit (if allowed)
 *                 + 📄 Download PDF link in the status bar (not for drafts)
 */

import Link from "next/link"
import { FORM_WIDTH } from "./permitFormUI"
import { STATE_LABEL, STATE_STYLE, WORK_PERMITS_BASE, type ExistingPermit } from "./permitTypes"

export type PermitFormMode = "create" | "edit" | "correct" | "view"

export function permitFormMode(permit: ExistingPermit<unknown> | undefined, readOnly: boolean): PermitFormMode {
  if (!permit) return "create"
  if (readOnly) return "view"
  return permit.state === "DRAFT" ? "edit" : "correct"
}

/** "2026-11-25T08:30:00.000Z" → "25 Nov 2026, 09:30" in the browser's time zone */
function formatWhen(iso: string | null | undefined) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

// ─── Status bar under the title (existing permits only) ──────────────────────
export function PermitStatusBar({
  permit,
  mode,
}: {
  permit: ExistingPermit<unknown> | undefined
  mode: PermitFormMode
}) {
  if (!permit) return null

  const closedAt = formatWhen(permit.closedOutAt)
  const modeText =
    mode === "edit" ? "Editing draft" : mode === "correct" ? "Admin correction — permit already issued" : null

  return (
    <div className="mb-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">{permit.permitNo}</span>
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATE_STYLE[permit.state]}`}>
          {STATE_LABEL[permit.state]}
        </span>
        {modeText && (
          <span
            className={`text-xs font-medium ${
              mode === "correct" ? "text-amber-700 dark:text-amber-400" : "text-blue-700 dark:text-blue-400"
            }`}
          >
            ✏️ {modeText}
          </span>
        )}
        {mode === "view" && permit.state !== "DRAFT" && (
          // <a>, not <Link>: the route returns a file download
          <a
            href={`${WORK_PERMITS_BASE}/${permit.id}/pdf`}
            className="ml-auto inline-flex items-center gap-1 rounded-md border border-blue-300 dark:border-blue-800 px-3 py-1.5 text-xs font-semibold text-blue-900 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
          >
            📄 Download PDF
          </a>
        )}
      </div>
      {(permit.createdByName || closedAt) && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {permit.createdByName && <>Created by {permit.createdByName}</>}
          {closedAt && (
            <>
              {permit.createdByName && " · "}Closed out {closedAt}
              {permit.closedOutByName && ` by ${permit.closedOutByName}`}
            </>
          )}
        </p>
      )}
    </div>
  )
}

// ─── Sticky bottom bar ───────────────────────────────────────────────────────
const outlineBtn =
  "px-4 py-2.5 rounded-lg border border-blue-300 dark:border-blue-800 text-sm font-medium text-blue-900 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
const solidBtn =
  "px-5 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-sm font-semibold text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"

export function PermitActionBar({
  mode,
  permitId,
  canEdit,
  saving,
  onSaveDraft,
  onIssue,
}: {
  mode: PermitFormMode
  permitId?: string
  /** View mode only: show the ✏️ Edit button */
  canEdit?: boolean
  saving: "draft" | "issue" | null
  onSaveDraft: () => void
  onIssue: () => void
}) {
  const busy = saving !== null

  return (
    <div className="fixed bottom-0 inset-x-0 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur">
      <div className={`${FORM_WIDTH} mx-auto px-4 sm:px-6 py-3 flex items-center justify-end gap-3`}>
        {mode === "view" && (
          <>
            <Link href={WORK_PERMITS_BASE} className={outlineBtn}>
              Back to list
            </Link>
            {canEdit && permitId && (
              <Link href={`${WORK_PERMITS_BASE}/${permitId}/edit`} className={solidBtn}>
                ✏️ Edit
              </Link>
            )}
          </>
        )}

        {(mode === "create" || mode === "edit") && (
          <>
            <button type="button" onClick={onSaveDraft} disabled={busy} className={outlineBtn}>
              {saving === "draft" ? "Saving…" : "Save Draft"}
            </button>
            <button type="button" onClick={onIssue} disabled={busy} className={solidBtn}>
              {saving === "issue" ? "Issuing…" : "Issue Permit"}
            </button>
          </>
        )}

        {mode === "correct" && (
          <>
            {permitId && (
              <Link href={`${WORK_PERMITS_BASE}/${permitId}`} className={outlineBtn}>
                Cancel
              </Link>
            )}
            <button type="button" onClick={onIssue} disabled={busy} className={solidBtn}>
              {saving === "issue" ? "Saving…" : "Save Changes"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}