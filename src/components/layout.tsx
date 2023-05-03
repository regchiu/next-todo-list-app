import { Flowbite } from 'flowbite-react'
import dynamic from 'next/dynamic'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

const ClientOnlyAppNavbar = dynamic(() => import('@/components/app-navbar'), {
  ssr: false,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Flowbite>
      <ClientOnlyAppNavbar />
      <main
        className={`flex min-h-screen flex-col items-center justify-between p-4 lg:p-8 ${inter.className}`}
      >
        {children}
      </main>
    </Flowbite>
  )
}
