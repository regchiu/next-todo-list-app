import { useMemo, useState, useEffect, Dispatch, SetStateAction } from 'react'
import { TextInput, Checkbox, Label, Button } from 'flowbite-react'
import {
  MdKeyboardBackspace,
  MdDelete,
  MdEdit,
  MdSave,
  MdSearch,
} from 'react-icons/md'
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa'
import cn from 'classnames'

type Todo = {
  id: number
  text: string
  completed: boolean
}

type Visibility = 'all' | 'active' | 'completed'
type Sorting = 'ascending' | 'descending'
type EditTodoId = number | null

const STORAGE_KEY = 'next-todo-list'

function NewTodoInput({
  todos,
  setTodos,
}: {
  todos: Array<Todo>
  setTodos: Dispatch<SetStateAction<Array<Todo>>>
}) {
  const [todoText, setTodoText] = useState<string>('')

  function handleKeyUpEnter(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      const text = (event.target as HTMLInputElement).value.trim()
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

  return (
    <TextInput
      type="text"
      autoFocus
      placeholder="What needs to be done?(Press enter to add)"
      value={todoText}
      shadow={true}
      rightIcon={MdKeyboardBackspace}
      onChange={(e) => setTodoText(e.target.value)}
      onKeyUp={handleKeyUpEnter}
    />
  )
}

function ActiveTodoRemainingText({ remaining }: { remaining: number }) {
  return (
    <div className="dark:text-gray-300">
      <span>
        <strong>{remaining}</strong>{' '}
        <span>{remaining > 1 ? 'item' : 'items'} left</span>
      </span>
    </div>
  )
}

function ClearCompletedButton({
  className,
  todos,
  setTodos,
}: {
  className?: string
  todos: Array<Todo>
  setTodos: Dispatch<SetStateAction<Array<Todo>>>
}) {
  function handleClick() {
    setTodos(todos.filter((todo) => !todo.completed))
  }

  return (
    <Button
      className={className}
      size="sm"
      outline={true}
      color="info"
      onClick={handleClick}
    >
      Clear Completed
    </Button>
  )
}

function SortingButton({
  sorting,
  setSorting,
}: {
  sorting: Sorting
  setSorting: Dispatch<SetStateAction<Sorting>>
}) {
  function handleClick(direction: Sorting) {
    setSorting(direction)
  }

  if (sorting === 'descending') {
    return (
      <Button size="sm" onClick={() => handleClick('ascending')}>
        <FaSortAmountDown className="h-5 w-5" />
      </Button>
    )
  } else {
    return (
      <Button size="sm" onClick={() => handleClick('descending')}>
        <FaSortAmountUp className="h-5 w-5" />
      </Button>
    )
  }
}

function TodoItem({
  todo,
  todos,
  editTodoId,
  setEditTodoId,
  setTodos,
}: {
  todo: Todo
  todos: Array<Todo>
  editTodoId: EditTodoId
  setEditTodoId: Dispatch<SetStateAction<EditTodoId>>
  setTodos: Dispatch<SetStateAction<Array<Todo>>>
}) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTodos(
      todos.map((currentTodo) => {
        if (currentTodo.id === todo.id) {
          return {
            ...todo,
            text: event.target.value.trim(),
          }
        } else {
          return currentTodo
        }
      })
    )
  }

  function handleKeyUp(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      setEditTodoId(null)
    }
  }

  function handleEditClick() {
    setEditTodoId(todo.id)
  }

  function handleSaveClick() {
    setEditTodoId(null)
  }

  function handleDeleteClick() {
    setTodos(todos.filter((currentTodo) => currentTodo.id !== todo.id))
  }

  return (
    <div className="flex flex-row items-center w-full gap-4">
      <Checkbox
        checked={todo.completed}
        onChange={(e) =>
          setTodos(
            todos.map((currentTodo) => {
              if (currentTodo.id === todo.id) {
                return {
                  ...todo,
                  completed: e.target.checked,
                }
              } else {
                return currentTodo
              }
            })
          )
        }
      />
      <div className="flex-auto">
        <Label className="break-all">
          {todo.id === editTodoId ? (
            <TextInput
              type="text"
              value={todo.text}
              onChange={handleChange}
              onKeyUp={handleKeyUp}
            />
          ) : todo.completed ? (
            <s>{todo.text}</s>
          ) : (
            todo.text
          )}
        </Label>
      </div>
      <div className="flex flex-row gap-2">
        {todo.id === editTodoId ? (
          <Button size="sm" color="success" onClick={handleSaveClick}>
            <MdSave />
          </Button>
        ) : (
          <Button size="sm" onClick={handleEditClick}>
            <MdEdit />
          </Button>
        )}
        <Button size="sm" color="failure" onClick={handleDeleteClick}>
          <MdDelete />
        </Button>
      </div>
    </div>
  )
}

export default function TodoList() {
  const [todos, setTodos] = useState<Array<Todo>>(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  )
  const [visibility, setVisibility] = useState<Visibility>('all')
  const [searchText, setSearchText] = useState<string>('')
  const [editTodoId, setEditTodoId] = useState<EditTodoId>(null)
  const [sorting, setSorting] = useState<Sorting>('descending')

  const remaining = todos.filter((todo) => !todo.completed).length

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const filteredTodos = useMemo(
    () => getFilteredTodos(todos, visibility, sorting, searchText),
    [todos, visibility, sorting, searchText]
  )

  function getFilteredTodos(
    todos: Todo[],
    visibility: Visibility,
    sorting: Sorting,
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

    filteredTodos.sort((a, b) => {
      if (sorting === 'descending') {
        return b.id - a.id
      } else {
        return a.id - b.id
      }
    })

    return searchText
      ? filteredTodos.filter((todo) =>
          todo.text.toLowerCase().includes(searchText.toLowerCase())
        )
      : filteredTodos
  }

  return (
    <div className="w-full format lg:format-lg">
      <h1 className="text-center dark:text-gray-300">TODO LIST</h1>
      <NewTodoInput todos={todos} setTodos={setTodos} />
      {todos.length > 0 && (
        <div className="w-full not-format mt-4 flex flex-col gap-4">
          <section className="flex flex-col gap-4">
            <ActiveTodoRemainingText remaining={remaining} />
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
              <SortingButton sorting={sorting} setSorting={setSorting} />
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
              <ClearCompletedButton
                className={cn({ hidden: remaining >= todos.length })}
                todos={todos}
                setTodos={setTodos}
              />
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
                <TodoItem
                  todo={todo}
                  todos={todos}
                  editTodoId={editTodoId}
                  setEditTodoId={setEditTodoId}
                  setTodos={setTodos}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
