import { useMemo, useState, useEffect } from 'react'
import { TextInput, Checkbox, Label, Button } from 'flowbite-react'
import {
  MdKeyboardBackspace,
  MdDelete,
  MdEdit,
  MdSave,
  MdSearch,
} from 'react-icons/md'
import cn from 'classnames'

type Todo = {
  id: number
  text: string
  completed: boolean
}

type Visibility = 'all' | 'active' | 'completed'

const STORAGE_KEY = 'next-todo-list'

export default function TodoList() {
  const [todoText, setTodoText] = useState<string>('')
  const [todos, setTodos] = useState<Array<Todo>>(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  )
  const [visibility, setVisibility] = useState<Visibility>('all')
  const [searchText, setSearchText] = useState<string>('')
  const [editTodoId, setEditTodoId] = useState<number | null>(null)

  const remaining = todos.filter((todo) => !todo.completed).length

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const filteredTodos = useMemo(
    () => getFilteredTodos(todos, visibility, searchText),
    [todos, visibility, searchText]
  )

  function getFilteredTodos(
    todos: Todo[],
    visibility: Visibility,
    searchText: string
  ) {
    let filteredTodos = []
    switch (visibility) {
      case 'all':
        filteredTodos = [...todos]
        break
      case 'active':
        filteredTodos = todos.filter((todo) => !todo.completed)
        break
      case 'completed':
        filteredTodos = todos.filter((todo) => todo.completed)
        break
      default:
        filteredTodos = [...todos]
    }
    return searchText
      ? filteredTodos.filter((todo) =>
          todo.text.toLowerCase().includes(searchText.toLowerCase())
        )
      : filteredTodos
  }

  function addTodo(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      const text = todoText.trim()
      if (text) {
        setTodos([
          ...todos,
          {
            id: Date.now(),
            text,
            completed: false,
          },
        ])
        setTodoText('')
      }
    }
  }

  function changeTodo(nextTodo: Todo) {
    setTodos(
      todos.map((todo) => {
        if (todo.id === nextTodo.id) {
          return nextTodo
        } else {
          return todo
        }
      })
    )
  }

  function deleteTodo(todoId: number) {
    setTodos(todos.filter((todo) => todo.id !== todoId))
  }

  function removeCompleted() {
    setTodos(todos.filter((todo) => !todo.completed))
  }

  function typeEnterToSaveEdit(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      setEditTodoId(null)
    }
  }

  return (
    <div className="w-full format lg:format-lg">
      <h1 className="text-center dark:text-gray-300">TODO LIST</h1>
      <TextInput
        type="text"
        autoFocus
        placeholder="What needs to be done?"
        value={todoText}
        shadow={true}
        rightIcon={MdKeyboardBackspace}
        onChange={(e) => setTodoText(e.target.value)}
        onKeyUp={addTodo}
      />
      {todos.length > 0 ? (
        <div className="w-full not-format mt-4 flex flex-col gap-4">
          <section className="flex flex-col gap-4">
            <div className="dark:text-gray-300">
              <span>{remaining}</span>{' '}
              <span>{remaining === 1 ? 'item' : 'items'}</span>{' '}
              <span>left</span>
            </div>
            <div>
              <TextInput
                type="text"
                shadow={true}
                value={searchText}
                placeholder="Search todo text"
                rightIcon={MdSearch}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div className="flex flex-row w-full gap-4">
              <Button.Group>
                <Button
                  size="sm"
                  color={visibility === 'all' ? 'info' : 'gray'}
                  onClick={() => setVisibility('all')}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  color={visibility === 'active' ? 'info' : 'gray'}
                  onClick={() => setVisibility('active')}
                >
                  Active
                </Button>
                <Button
                  size="sm"
                  color={visibility === 'completed' ? 'info' : 'gray'}
                  onClick={() => setVisibility('completed')}
                >
                  Completed
                </Button>
              </Button.Group>
              <Button
                size="sm"
                outline={true}
                color="info"
                className={cn({ hidden: remaining >= todos.length })}
                onClick={() => removeCompleted()}
              >
                Clear Completed
              </Button>
            </div>
          </section>
          <ul
            className={cn(
              [
                'text-sm',
                'font-medium',
                'text-gray-900',
                'bg-white',
                'border',
                'border-gray-200',
                'rounded-lg',
                'dark:bg-gray-700 dark:border-gray-600 dark:text-white',
              ],
              { hidden: filteredTodos.length === 0 }
            )}
          >
            {filteredTodos.map((todo, index) => (
              <li
                key={todo.id}
                className={cn(
                  ['w-full', 'px-4', 'py-2', 'dark:border-gray-600'],
                  { 'rounded-t-lg': index === 0 },
                  {
                    'border-b border-gray-200':
                      index !== filteredTodos.length - 1,
                  },
                  { 'rounded-b-lg': index === filteredTodos.length - 1 }
                )}
              >
                <div className="flex flex-row items-center w-full gap-4">
                  <div>
                    <Checkbox
                      checked={todo.completed}
                      onChange={(e) =>
                        changeTodo({ ...todo, completed: e.target.checked })
                      }
                    />
                  </div>
                  <div className="flex-auto">
                    <Label className="break-all">
                      {editTodoId === todo.id ? (
                        <TextInput
                          type="text"
                          value={todo.text}
                          onChange={(e) =>
                            changeTodo({ ...todo, text: e.target.value })
                          }
                          onKeyUp={typeEnterToSaveEdit}
                        />
                      ) : (
                        <>{todo.completed ? <s>{todo.text}</s> : todo.text}</>
                      )}
                    </Label>
                  </div>
                  <div className="flex flex-row gap-2">
                    {editTodoId === todo.id ? (
                      <Button
                        size="sm"
                        color="success"
                        onClick={() => setEditTodoId(null)}
                      >
                        <MdSave />
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => setEditTodoId(todo.id)}>
                        <MdEdit />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      color="failure"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      <MdDelete />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
