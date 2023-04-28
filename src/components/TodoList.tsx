import css from './TodoList.module.css'
import { useState } from 'react'

const STORAGE_KEY = 'next-todolist'

let nextId = 0

type Todo = {
  id: number
  text: string
  completed: boolean
}

export default function TodoList() {
  const [todos, setTodos] = useState<Array<Todo>>(
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      : []
  )
  const [showActive, setShowActive] = useState(false)

  const activeTodos = todos.filter((todo) => !todo.completed)
  const visibleTodos = showActive ? activeTodos : todos

  return (
    <div>
      <h1 className="text-4xl xl:text-8xl">Todo List</h1>
      <ul className={css.todoList}>
        {visibleTodos.map((todo) => (
          <li className="text-2xl xl:text-4xl" key={todo.id}>
            {todo.completed ? <s>todo.text</s> : todo.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
