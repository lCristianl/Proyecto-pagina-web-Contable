import type React from "react"
import "@fontsource/playfair-display/400.css"
import "@fontsource/playfair-display/500.css"
import "@fontsource/playfair-display/600.css"
import "@fontsource/playfair-display/700.css"
import "@fontsource/source-sans-3/300.css"
import "@fontsource/source-sans-3/400.css"
import "@fontsource/source-sans-3/500.css"
import "@fontsource/source-sans-3/600.css"
import "./globals.css"

// Las fuentes se pueden cargar directamente desde Google Fonts en el HTML
// o usar CSS imports. Para Vite, es mejor usar CSS imports o web fonts.

export default function LayoutLogin({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="font-source-sans antialiased">
      {children}
    </div>
  )
}
