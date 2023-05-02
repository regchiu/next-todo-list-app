import { Inter } from 'next/font/google'
import dynamic from 'next/dynamic'

const inter = Inter({ subsets: ['latin'] })

const ClientOnlyTodoList = dynamic(() => import('@/components/TodoList'), {
  ssr: false,
})

export default function HomePage() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-4 lg:p-8 ${inter.className}`}
    >
      <ClientOnlyTodoList />
    </main>
  )
}
