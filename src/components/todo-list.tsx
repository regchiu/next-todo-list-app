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
  onSort,
}: {
  sorting: Sorting
  onSort: (newSorting: Sorting) => void
}) {
  function handleClick(sorting: Sorting) {
    onSort(sorting)
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

function TodoItemDescription({
  todo,
  editTodoId,
  onEdit,
  onSave,
}: {
  todo: Todo
  editTodoId: EditTodoId
  onEdit: (newTodo: Todo) => void
  onSave: (newEditTodoId: EditTodoId) => void
}) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    onEdit({ ...todo, text: event.target.value })
  }

  function handleKeyUp(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      onSave(null)
    }
  }

  let itemTextContent = <>{todo.text}</>
  if (todo.completed) {
    itemTextContent = <s>{todo.text}</s>
  }

  let itemLabelContent = <>{itemTextContent}</>

  if (editTodoId === todo.id) {
    itemLabelContent = (
      <TextInput
        type="text"
        value={todo.text}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
      />
    )
  }

  return <Label className="break-all">{itemLabelContent}</Label>
}

function TodoItemAction({
  todo,
  editTodoId,
  onEdit,
  onSave,
  onDelete,
}: {
  todo: Todo
  editTodoId: EditTodoId
  onEdit: (newEditTodoId: EditTodoId) => void
  onSave: (newEditTodoId: EditTodoId) => void
  onDelete: (newEditTodoId: EditTodoId) => void
}) {
  function handleEditClick() {
    onEdit(todo.id)
  }
  function handleSaveClick() {
    onSave(null)
  }
  function handleDeleteClick() {
    onDelete(todo.id)
  }

  let editButton = (
    <Button size="sm" onClick={handleEditClick}>
      <MdEdit />
    </Button>
  )

  if (editTodoId === todo.id) {
    editButton = (
      <Button size="sm" color="success" onClick={handleSaveClick}>
        <MdSave />
      </Button>
    )
  }

  return (
    <>
      {editButton}
      <Button size="sm" color="failure" onClick={handleDeleteClick}>
        <MdDelete />
      </Button>
    </>
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
              <SortingButton
                sorting={sorting}
                onSort={(newSorting) => setSorting(newSorting)}
              />
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
                    <TodoItemDescription
                      todo={todo}
                      editTodoId={editTodoId}
                      onEdit={(newTodo) => changeTodo(newTodo)}
                      onSave={(newEditTodoId) => setEditTodoId(newEditTodoId)}
                    />
                  </div>
                  <div className="flex flex-row gap-2">
                    <TodoItemAction
                      todo={todo}
                      editTodoId={editTodoId}
                      onEdit={(newEditTodoId) => setEditTodoId(newEditTodoId)}
                      onSave={(newEditTodoId) => setEditTodoId(newEditTodoId)}
                      onDelete={(newEditTodoId) =>
                        setTodos(
                          todos.filter((todo) => todo.id !== newEditTodoId)
                        )
                      }
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
