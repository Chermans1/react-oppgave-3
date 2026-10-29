import { useState } from 'react'
import { TodoContext } from './TodoContext.js'

export function TodoProvider({ children }) {
  const [todos, setTodos] = useState([])

  function addTodo(text) {
    const trimmedText = text.trim()
    if (!trimmedText) return

    setTodos((currentTodos) => [
      ...currentTodos,
      {
        id: currentTodos.reduce((highestId, todo) => Math.max(highestId, todo.id), 0) + 1,
        text: trimmedText,
        done: false,
      },
    ])
  }

  function toggleTodo(id) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    )
  }

  function removeTodo(id) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id))
  }

  return (
    <TodoContext.Provider value={{ todos, addTodo, toggleTodo, removeTodo }}>
      {children}
    </TodoContext.Provider>
  )
}
