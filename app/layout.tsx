import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Video Learning Platform",
  description: "Track your unique video progress",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
              <div className="container mx-auto py-4 px-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-primary w-8 h-8 rounded-md flex items-center justify-center text-white font-bold">
                    VP
                  </div>
                  <span className="font-semibold text-lg">VideoProgress</span>
                </div>
                <nav>
                  <ul className="flex gap-6">
                    <li>
                      <a href="/" className="text-gray-700 hover:text-primary">
                        Home
                      </a>
                    </li>
                    <li>
                      <a href="/analytics" className="text-gray-700 hover:text-primary">
                        Analytics
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </header>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
