import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Providers from "@/components/providers"
import { Toaster } from "sonner"
import { ReactQueryClientProvider } from "@/lib/reactqueryprovider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MUJ Toppers Admin",
  description: "Admin dashboard for MUJ Toppers website",
  generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ReactQueryClientProvider>
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
      <Providers>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Toaster richColors  />
        </Providers>
      </body>
    </html>
    </ReactQueryClientProvider>
  )
}
