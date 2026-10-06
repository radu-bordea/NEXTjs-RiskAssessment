"use client"

import { useState } from "react"
import Image from "next/image"

/**
 * CardHoverPreview — shows the toolbox talk card image when the user
 * hovers over the children (the card code). On touch screens, where
 * hover doesn't exist, tapping toggles it.
 *
 * Uses position: fixed so the popup isn't clipped by parent containers
 * that have overflow-hidden (same approach as ColorLegendHover).
 */
export default function CardHoverPreview({
  imageUrl,
  title,
  children,
}: {
  imageUrl: string | null
  title: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  // Cards without an image just show the code, with no popup
  if (!imageUrl) return <>{children}</>

  return (
    <span
      className="inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((v) => !v)}
    >
      {children}

      {open && (
        <div
          className="fixed z-9999 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                     w-200 max-w-[90vw] rounded-lg overflow-hidden border-2
                     border-blue-200 bg-white shadow-2xl pointer-events-none"
        >
          <Image
            src={imageUrl}
            alt={title}
            width={1000}
            height={700}
            className="w-full h-auto max-h-[85vh] object-contain"
          />
        </div>
      )}
    </span>
  )
}