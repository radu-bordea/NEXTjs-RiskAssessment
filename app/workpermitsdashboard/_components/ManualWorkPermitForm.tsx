"use client"

/**
 * ManualWorkPermitForm — upload an existing paper permit as a PDF
 *
 * Location: app/workpermitsdashboard/_components/ManualWorkPermitForm.tsx
 *
 * How it saves (2 steps):
 *  1. The browser uploads the PDF straight to Vercel Blob
 *     (/api/workpermits/upload checks login + PDF only + max 10 MB)
 *  2. createManualWorkPermit saves the record: the server adds the
 *     permit number (e.g. HW-2026-004), the vessel and the state.
 *
 * Saved as source MANUAL, state CLOSED_OUT. All roles can upload.
 */

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { upload } from "@vercel/blob/client"
import { toast } from "sonner"
import { createManualWorkPermit } from "@/app/actions/workPermit.actions"
import { MAX_PDF_SIZE_BYTES, MAX_PDF_SIZE_MB } from "@/lib/validations/workPermit.schema"
import {
  MANUAL_PERMIT_CARD,
  PERMIT_TYPES,
  WORK_PERMITS_BASE,
  type PermitType,
} from "./permitTypes"
import {
  FORM_WIDTH,
  Field,
  ReadOnlyField,
  Section,
  inputCls,
} from "./permitFormUI"

type Status = "idle" | "uploading" | "saving"

/** Today as "YYYY-MM-DD" (local date) for <input type="date"> */
function todayInputValue() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** "My Permit (2).PDF" → "my-permit-2-.pdf" — safe for a storage path */
function safeFileName(name: string) {
  const base = name.toLowerCase().replace(/\.pdf$/i, "").replace(/[^a-z0-9-_]+/g, "-")
  return `${base || "permit"}.pdf`
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ManualWorkPermitForm({ vessel }: { vessel: string }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState("")
  const [type, setType] = useState<PermitType | "">("")
  const [issueDate, setIssueDate] = useState(todayInputValue())
  const [projectVoyage, setProjectVoyage] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const [errors, setErrors] = useState<string[]>([])
  const [status, setStatus] = useState<Status>("idle")
  const [progress, setProgress] = useState(0)

  const busy = status !== "idle"

  // ── File picked ──
  function handleFileChange(f: File | null) {
    setErrors([])
    if (!f) {
      setFile(null)
      return
    }
    const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    if (!isPdf) {
      setErrors(["Only PDF files can be uploaded"])
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }
    if (f.size > MAX_PDF_SIZE_BYTES) {
      setErrors([`The PDF is ${formatSize(f.size)} — the maximum is ${MAX_PDF_SIZE_MB} MB`])
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }
    setFile(f)
  }

  function removeFile() {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // ── Validation before upload ──
  function validate() {
    const e: string[] = []
    if (!name.trim()) e.push("Name is required")
    if (!type) e.push("Choose the permit type")
    if (!issueDate) e.push("Issue date is required")
    if (!file) e.push("Choose the PDF file to upload")
    return e
  }

  // ── Upload PDF → save record ──
  async function handleSubmit() {
    const e = validate()
    setErrors(e)
    if (e.length > 0 || !file || !type) {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    try {
      // 1. PDF → Vercel Blob (straight from the browser)
      setStatus("uploading")
      setProgress(0)
      const blob = await upload(`workpermits/${safeFileName(file.name)}`, file, {
        access: "public",
        handleUploadUrl: "/api/workpermits/upload",
        contentType: "application/pdf",
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      })

      // 2. Save the permit record
      setStatus("saving")
      const result = await createManualWorkPermit({
        name,
        type,
        issueDate,
        projectVoyage,
        pdfUrl: blob.url,
        pdfFileName: file.name,
      })

      if (result.success) {
        toast.success(`Work permit ${result.permitNo} saved`)
        router.push(WORK_PERMITS_BASE)
        router.refresh()
        return
      }

      setErrors([result.error])
      setStatus("idle")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (error) {
      console.error("Manual work permit upload error:", error)
      setErrors([
        error instanceof Error && error.message
          ? `Upload failed: ${error.message}`
          : "Upload failed — please check your connection and try again",
      ])
      setStatus("idle")
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <div className={`${FORM_WIDTH} mx-auto px-4 sm:px-6 py-8 pb-32`}>

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <Link href={WORK_PERMITS_BASE} className="text-sm text-blue-900 dark:text-blue-400 hover:underline">
        ← Back to Work Permits
      </Link>

      <div className="mt-4 mb-6 flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${MANUAL_PERMIT_CARD.iconStyle}`}>
          {MANUAL_PERMIT_CARD.icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-400">{MANUAL_PERMIT_CARD.label}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Upload an existing work permit (PDF). It is saved as <strong>Closed-out</strong>.
          </p>
        </div>
      </div>

      {/* ── Errors ───────────────────────────────────────────────── */}
      {errors.length > 0 && (
        <div className="mb-6 rounded-lg border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-4 py-3">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
            Please fix {errors.length} {errors.length === 1 ? "item" : "items"}:
          </p>
          <ul className="list-disc pl-5 text-sm text-red-700 dark:text-red-400 space-y-0.5">
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>
      )}

      <div className="space-y-6">

        {/* 1 ── Permit details ───────────────────────────────────── */}
        <Section number={1} title="Permit details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ReadOnlyField label="Vessel" value={vessel} hint="From your login" />
            <ReadOnlyField label="Permit no." value="Assigned when saved" hint="e.g. HW-2026-004 — based on the type" />

            <Field label="Name" required className="sm:col-span-2">
              <input
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Welding on aft deck railing"
                maxLength={200}
                disabled={busy}
              />
            </Field>

            <Field label="Type" required>
              <select
                className={inputCls}
                value={type}
                onChange={(e) => setType(e.target.value as PermitType | "")}
                disabled={busy}
              >
                <option value="">Select type…</option>
                {PERMIT_TYPES.map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Issue date" required>
              <input
                type="date"
                className={inputCls}
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                disabled={busy}
              />
            </Field>

            <Field label="Project / Voyage" className="sm:col-span-2">
              <input
                className={inputCls}
                value={projectVoyage}
                onChange={(e) => setProjectVoyage(e.target.value)}
                placeholder="e.g. Survey 2026-14"
                maxLength={200}
                disabled={busy}
              />
            </Field>
          </div>
        </Section>

        {/* 2 ── PDF file ─────────────────────────────────────────── */}
        <Section number={2} title="PDF file" subtitle={`One PDF, max ${MAX_PDF_SIZE_MB} MB`}>
          {!file ? (
            <label
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-200 dark:border-slate-700 px-6 py-10 text-center transition-colors ${
                busy ? "opacity-60" : "cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800/50"
              }`}
            >
              <span className="text-3xl" aria-hidden>📄</span>
              <span className="text-base font-medium text-blue-900 dark:text-blue-300">Choose PDF file</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">PDF only · max {MAX_PDF_SIZE_MB} MB</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                disabled={busy}
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </label>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-blue-200 dark:border-slate-700 bg-blue-50/40 dark:bg-slate-800/50 px-4 py-3">
              <span className="text-2xl" aria-hidden>📄</span>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{formatSize(file.size)}</p>
              </div>
              {!busy && (
                <button
                  type="button"
                  onClick={removeFile}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:text-red-600 hover:border-red-300 cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
          )}

          {/* Upload progress */}
          {status === "uploading" && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
                <span>Uploading PDF…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          {status === "saving" && (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Saving permit…</p>
          )}
        </Section>
      </div>

      {/* ── Sticky action bar ─────────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur">
        <div className={`${FORM_WIDTH} mx-auto px-4 sm:px-6 py-3 flex items-center justify-end gap-3`}>
          <Link
            href={WORK_PERMITS_BASE}
            className={`px-4 py-2.5 rounded-lg border border-blue-300 dark:border-blue-800 text-sm font-medium text-blue-900 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 ${busy ? "pointer-events-none opacity-50" : ""}`}
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={busy}
            className="px-5 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-sm font-semibold text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === "uploading" ? `Uploading… ${progress}%` : status === "saving" ? "Saving…" : "Upload & Save"}
          </button>
        </div>
      </div>
    </div>
  )
}