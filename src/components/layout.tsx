import { Inter } from 'next/font/google'
import { Navbar } from 'flowbite-react'
import ColorModeToggle from '@/components/color-mode-toggle'

const inter = Inter({ subsets: ['latin'] })

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar fluid={true} rounded={true}>
        <Navbar.Brand />
        <ColorModeToggle />
      </Navbar>
      <main
        className={`flex min-h-screen flex-col items-center justify-between p-4 lg:p-8 ${inter.className}`}
      >
        {children}
      </main>
    </>
  )
}
