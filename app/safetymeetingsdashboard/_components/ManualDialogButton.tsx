"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Paste the same Blob URL you use in SafetyMeetingTable.tsx
const MANUAL_URL = "https://3ndlujwykffozodt.public.blob.vercel-storage.com/manual.pdf"

/**
 * ManualDialogButton — a button that opens the Safety Manual PDF
 * in a large dialog. Used in the dashboard table and in the form.
 */
export default function ManualDialogButton({
  className,
}: {
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        size="sm"
        onClick={() => setOpen(true)}
        className={className}
      >
        📖 Open Manual
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Safety Manual</DialogTitle>
          </DialogHeader>
          <iframe
            src={MANUAL_URL}
            className="w-full flex-1 rounded-lg border border-blue-200"
            title="Safety Manual"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}