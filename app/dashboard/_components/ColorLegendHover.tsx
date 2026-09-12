"use client"

import { useState } from "react"
import Image from "next/image"

/**
 * ColorLegendHover — shows the risk color matrix reference image
 * on mouse hover, positioned near the cursor.
 */
export default function ColorLegendHover({ children }: { children: React.ReactNode }) {
  const [hovering, setHovering] = useState(false)

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {children}

      {/* Overlay backdrop for smooth fade */}
      <div
        className={`fixed inset-0 z-9998 bg-black/40 transition-opacity duration-300 ${
          hovering ? "opacity-100 pointer-events-none" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* The popup image */}
      <div
        className={`fixed z-[9999] shadow-2xl rounded-lg overflow-hidden border-2 border-[#A8D5B5] bg-white transition-all duration-300 ${
          hovering
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
        style={{
          top: "50%",
          left: "50%",
          transform: hovering
            ? "translate(-50%, -50%) scale(1)"
            : "translate(-50%, -50%) scale(0.95)",
          width: "95vw",
          maxWidth: "1400px",
        }}
      >
        <Image
          src="/assets/images/colors.jpg"
          alt="Risk color legend"
          width={1400}
          height={1000}
          className="w-full h-auto object-contain"
        />
      </div>
    </div>
  )
}