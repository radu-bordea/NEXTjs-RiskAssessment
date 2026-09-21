"use client"

/**
 * DownloadPdfButton — captures the analytics page content as an image
 * and generates a downloadable PDF snapshot.
 *
 * Uses html2canvas-pro to screenshot the DOM (charts included, since
 * they're rendered as SVG/HTML by recharts), then embeds that image
 * into a PDF via jsPDF. This preserves the exact visual appearance —
 * colors, chart shapes, table styling — rather than rebuilding
 * everything as native PDF elements.
 *
 * Using the "-pro" fork instead of the original html2canvas since it
 * supports modern CSS color functions (lab/oklch) used by some
 * component libraries — the original package fails on these.
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function DownloadPdfButton({ targetId }: { targetId: string }) {
  const [generating, setGenerating] = useState(false)

  const handleDownload = async () => {
    setGenerating(true)
    try {
      const element = document.getElementById(targetId)
      if (!element) {
        toast.error("Could not find content to export")
        return
      }

      // Dynamic imports — these libraries are client-only, avoid SSR issues
      const html2canvas = (await import("html2canvas-pro")).default
      const { jsPDF } = await import("jspdf")

      const canvas = await html2canvas(element, {
        scale: 2, // higher resolution for crisper text/charts
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: true,
      })

      const imgData = canvas.toDataURL("image/png")

      // A4 dimensions in mm
      const pdfWidth = 210
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      })

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`project-analytics-${new Date().toISOString().split("T")[0]}.pdf`)

      toast.success("PDF downloaded!")
    } catch (error) {
      console.error("PDF generation error:", error)
      toast.error("Failed to generate PDF")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Button
      type="button"
      disabled={generating}
      onClick={handleDownload}
      className="px-5 py-2.5 bg-emerald-300 hover:bg-emerald-400 text-emerald-900 border border-emerald-300 rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
    >
      {generating ? "Generating PDF..." : "📄 Download PDF"}
    </Button>
  )
}