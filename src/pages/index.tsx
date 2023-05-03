import dynamic from 'next/dynamic'
import Head from 'next/head'

const ClientOnlyTodoList = dynamic(() => import('@/components/todo-list'), {
  ssr: false,
})

export default function HomePage() {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>
      <ClientOnlyTodoList />
    </>
  )
}
