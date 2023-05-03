import dynamic from 'next/dynamic'

const ClientOnlyTodoList = dynamic(() => import('@/components/todo-list'), {
  ssr: false,
})

export default function HomePage() {
  return <ClientOnlyTodoList />
}
