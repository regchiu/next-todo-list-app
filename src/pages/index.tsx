import { Inter } from 'next/font/google'
import TodoList from '@/components/TodoList'

const inter = Inter({ subsets: ['latin'] })

export default function HomePage() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <TodoList></TodoList>
    </main>
  )
}
