import { useState, useEffect, useReducer, useMemo } from 'react'
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

const STORAGE_KEY = 'next-todo-list'

type Todo = {
  id: number
  text: string
  completed: boolean
}

type TodoAction =
  | {
      type: 'added'
      id: number
      text: string
    }
  | { type: 'changed'; todo: Todo }
  | { type: 'deleted'; id: number }
  | { type: 'clear-completed' }

type Visibility = 'all' | 'active' | 'completed'
type Sorting = 'ascending' | 'descending'

function todosReducer(todos: Array<Todo>, action: TodoAction) {
  switch (action.type) {
    case 'added': {
      return [
        ...todos,
        {
          id: action.id,
          text: action.text,
          completed: false,
        },
      ]
    }
    case 'changed': {
      return todos.map((todo) => {
        if (todo.id === action.todo.id) {
          return action.todo
        } else {
          return todo
        }
      })
    }
    case 'deleted': {
      return todos.filter((todo) => todo.id !== action.id)
    }
    case 'clear-completed': {
      return todos.filter((todo) => !todo.completed)
    }
  }
}

function TodoAddInput({ onAddTodo }: { onAddTodo: (text: string) => void }) {
  const [text, setText] = useState('')

  function handleKeyUpEnter(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      const text = (event.target as HTMLInputElement).value.trim()
      if (text) {
        setText('')
        onAddTodo(text)
      }
    }
  }

  return (
    <TextInput
      type="text"
      autoFocus
      placeholder="What needs to be done?(Press enter to add)"
      value={text}
      shadow={true}
      rightIcon={MdKeyboardBackspace}
      onChange={(e) => setText(e.target.value)}
      onKeyUp={handleKeyUpEnter}
    />
  )
}

function TodoItem({
  todo,
  onChange,
  onDelete,
}: {
  todo: Todo
  onChange: (todo: Todo) => void
  onDelete: (todoId: number) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  let todoContent

  if (isEditing) {
    todoContent = (
      <>
        <TextInput
          className="flex-auto break-all"
          type="text"
          value={todo.text}
          onChange={(e) => {
            onChange({
              ...todo,
              text: e.target.value,
            })
          }}
        />
        <Button size="sm" color="success" onClick={() => setIsEditing(false)}>
          <MdSave />
        </Button>
      </>
    )
  } else {
    todoContent = (
      <>
        <span className="flex-auto break-all">
          {todo.completed ? <s>{todo.text}</s> : todo.text}
        </span>
        <Button size="sm" onClick={() => setIsEditing(true)}>
          <MdEdit />
        </Button>
      </>
    )
  }

  return (
    <Label className="flex flex-row items-center w-full gap-4">
      <Checkbox
        checked={todo.completed}
        onChange={(e) => {
          onChange({
            ...todo,
            completed: e.target.checked,
          })
        }}
      />
      {todoContent}
      <Button size="sm" color="failure" onClick={() => onDelete(todo.id)}>
        <MdDelete />
      </Button>
    </Label>
  )
}

export default function TodoList() {
  const [todos, dispatchTodos] = useReducer(
    todosReducer,
    JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  )
  const [searchText, setSearchText] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('all')
  const [sorting, setSorting] = useState<Sorting>('descending')

  const remaining = todos.filter((todo) => !todo.completed).length

  function handleAddTodo(text: string) {
    dispatchTodos({
      type: 'added',
      id: Date.now(),
      text,
    })
  }

  function handleChangeTodo(todo: Todo) {
    dispatchTodos({
      type: 'changed',
      todo,
    })
  }

  function handleDeleteTodo(todoId: number) {
    dispatchTodos({
      type: 'deleted',
      id: todoId,
    })
  }

  function handleClearCompleteTodo() {
    dispatchTodos({
      type: 'clear-completed',
    })
  }

  const filteredTodos = useMemo(() => {
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
  }, [searchText, sorting, todos, visibility])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  return (
    <div className="w-full format lg:format-lg">
      <h1 className="text-center dark:text-gray-300">TODO LIST</h1>
      <TodoAddInput onAddTodo={handleAddTodo} />
      <div className="w-full not-format mt-4 flex flex-col gap-4">
        <section className="flex flex-col gap-4">
          <div className="dark:text-gray-300">
            <span>
              <strong>{remaining}</strong>{' '}
              <span>{remaining > 1 ? 'item' : 'items'} left</span>
            </span>
          </div>
          <TextInput
            type="text"
            shadow={true}
            value={searchText}
            placeholder="Search todo text"
            rightIcon={MdSearch}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <div className="flex flex-row w-full gap-4">
            {sorting === 'descending' ? (
              <Button size="sm" onClick={() => setSorting('ascending')}>
                <FaSortAmountDown className="h-5 w-5" />
              </Button>
            ) : (
              <Button size="sm" onClick={() => setSorting('descending')}>
                <FaSortAmountUp className="h-5 w-5" />
              </Button>
            )}
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
              className={cn({ hidden: remaining >= filteredTodos.length })}
              size="sm"
              outline={true}
              color="info"
              onClick={handleClearCompleteTodo}
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
              <TodoItem
                todo={todo}
                onChange={handleChangeTodo}
                onDelete={handleDeleteTodo}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
