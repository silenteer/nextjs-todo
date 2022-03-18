import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { EventHandler, SyntheticEvent, useEffect, useState } from "react";

import type { Todo, TodoId, TodoValue } from "~/lib/types";
import { toggleStatus, update } from '~/lib/stash';

const loadTodosFn = () => fetch('/api/list').then(res => res.json() as Promise<{ todos: Todo[] }>)
const loadTodoFn = (todoId: TodoId) => fetch(`/api/${todoId}`).then(res => res.json() as Promise<Todo>)
const addTodoFn = (todo: TodoValue) => fetch('/api/add?todo=' + todo)
const toggleTodoFn = (todo: TodoId) => fetch('/api/toggleStatus?todoId=' + todo)
const updateTodoFn = (id: TodoId, updatedTodo: string) => {
  return fetch(`/api/update`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ id, todo: updatedTodo })
  });
}

export default function Home() {
  const [data, setData] = useState<{ todos: Todo[] }>({ todos: [] });
  const [loading, setLoading] = useState(false);
  const [todo, setTodo] = useState("");
  let changeHandler = (event: any) => {
    setTodo(event.target.value)
  }

  const [selectedTodo, setSelectedTodo] = useState<TodoId | undefined>(undefined);

  let addTodo = (event: any) => {
    setLoading(true)
    event.preventDefault();
    addTodoFn(todo).then(loadTodos)
  }

  const handleSelectTodoItem = (id: TodoId) => {
    return () => {
      setSelectedTodo(id);
    }
  }

  const handleSelectedTodoItemToggle = (id: TodoId) => {
    toggleTodoFn(id).then(loadTodos)
  }

  const handleUpdateItem = (id: TodoId, updatedTodo: string) =>
    updateTodoFn(id, updatedTodo).then(loadTodos)

  let loadTodos = () => {
    console.log("load todos")
    loadTodosFn()
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }

  useEffect(() => {
    console.log("effect")
    setLoading(true)
    loadTodos()
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>Next.js TODO APP</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.grid}>
          <h1 className={styles.title}>
            TODO App
            <br />
            <br />
          </h1>
          {
            loading ?
              <a href="#" className={styles.card}>
                <img src="/loader.gif" />
              </a>
              :
              <form className={styles.cardForm} onSubmit={addTodo}>
                <input className={styles.cardInput} type="text"
                  name="todo" onChange={changeHandler}
                  placeholder="Enter your exciting TODO item!" />
              </form>
          }

          {data.todos.map((item) =>
            <a key={item.id} onClick={handleSelectTodoItem(item.id)} className={styles.card}>
              <p style={{
                ...item.done ? { textDecoration: 'line-through' } : {}
              }}>{item.todo}</p>
            </a>)}
        </div>

        <SelectedTodo id={selectedTodo}
          onToggleTodoStatus={handleSelectedTodoItemToggle}
          onSelectedTodoUpdate={handleUpdateItem}
        />
      </main>

    </div>
  )
}

type SelectedTodoProps = {
  id: TodoId | undefined;
  onSelectedTodoUpdate?: (todoId: TodoId, updatedTodo: string) => Promise<void>,
  onToggleTodoStatus?: (todoId: TodoId) => void
}

function SelectedTodo({ id, onSelectedTodoUpdate, onToggleTodoStatus }: SelectedTodoProps) {
  if (!id) {
    return null;
  }
  const [isEditMode, toggleEditMode] = useState(false);
  const [todo, setTodo] = useState<Todo | undefined>(undefined);
  const [todoInput, setTodoInput] = useState(todo?.todo);

  const loadTodo = (todoId: TodoId) => {
    console.log("Load todo");
    loadTodoFn(todoId).then((data: Todo) => {
      setTodo(data);
      setTodoInput(data.todo)
    })
  }

  const handleOnSave = () => {
    console.log("Updating todo");
    onSelectedTodoUpdate(id, todoInput)
      .then(() => {
        loadTodo(id)
        toggleEditMode(false);
      });
  }

  useEffect(() => {
    loadTodo(id);
  }, [id]);

  if (!todo) return null;

  return <div className={styles.todo}>
    {isEditMode
      ? <h2><input value={todoInput} onChange={(e) => setTodoInput(e.target.value)} /></h2>
      : <h2 data-done={!!todo.done}>{todoInput}</h2>
    }
    <input id="done" type="checkbox" defaultChecked={todo.done} onChange={(e) => onToggleTodoStatus(id)} />
    <label htmlFor='done'>Completed</label>

    <div className={styles.buttons}>
      {!isEditMode && <button onClick={() => { toggleEditMode(current => !current) }}>Edit</button>}
      {isEditMode &&
        <>
          <button onClick={handleOnSave}>Save</button>
          <button onClick={() => toggleEditMode(false)}>Cancel</button>
        </>
      }
    </div>
  </div >

}