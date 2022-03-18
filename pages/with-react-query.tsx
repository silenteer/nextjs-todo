import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { SyntheticEvent, useState } from "react";

import type { Todo, TodoId, TodoValue } from "~/lib/types";

import { ReactQueryDevtools } from 'react-query/devtools';
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from 'react-query';

const q = new QueryClient();

const loadTodosFn = () => fetch('/api/list').then(res => res.json() as Promise<{ todos: Todo[] }>)
const loadTodoFn = (todoId: TodoId) => fetch(`/api/${todoId}`).then(res => res.json() as Promise<Todo>)
const addTodoFn = (todo: TodoValue) => fetch('/api/add?todo=' + todo)
const toggleTodoFn = (todo: TodoId) => fetch('/api/toggleStatus?todoId=' + todo)
const updateTodoFn = ({ id, updatedTodo }: { id: TodoId, updatedTodo: string }) => {
  return fetch(`/api/update`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({ id, todo: updatedTodo })
  });
}

function Home() {
  const queryClient = useQueryClient();
  const { data, isLoading: isTodoLoading } = useQuery(['todos'], loadTodosFn, {
    keepPreviousData: true
  });

  const [todo, setTodo] = useState("");;
  let changeHandler = (event: any) => {
    setTodo(event.target.value)
  }

  const [selectedTodo, setSelectedTodo] = useState<TodoId | undefined>(undefined);

  const addTodo = useMutation(addTodoFn, {
    onSuccess: async () => {
      await queryClient.invalidateQueries(['todos']);
      setTodo('');
    }
  });

  const handleAddTodoForm = (e: SyntheticEvent) => {
    e.preventDefault();
    addTodo.mutate(todo);
    setTodo('');
  }

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

          <form className={styles.cardForm} onSubmit={handleAddTodoForm}>
            <input className={styles.cardInput} type="text"
              value={todo}
              name="todo" onChange={changeHandler}
              placeholder="Enter your exciting TODO item!" />
          </form>

          {data?.todos.map((item) =>
            <a key={item.id} onClick={() => setSelectedTodo(item.id)} className={styles.card}>
              <p style={{
                ...item.done ? { textDecoration: 'line-through' } : {}
              }}>{item.todo}</p>
            </a>)}
        </div>

        <SelectedTodo id={selectedTodo} />
      </main>

    </div>
  )
}

type SelectedTodoProps = {
  id: TodoId | undefined;
}

function SelectedTodo({ id }: SelectedTodoProps) {
  const queryClient = useQueryClient();

  const [isEditMode, toggleEditMode] = useState(false);
  const { data, isLoading } = useQuery(id !== undefined ? ['todos', id] : undefined, () => loadTodoFn(id), {
    onSuccess: (data) => setTodoInput(data.todo),
  })

  const [todoInput, setTodoInput] = useState(data?.todo);

  const updateTodo = useMutation(updateTodoFn, {
    onSuccess: async () => {
      await queryClient.invalidateQueries(['todos']);
      toggleEditMode(false);
    }
  })

  const toggleStatus = useMutation(toggleTodoFn, {
    onSuccess: async () => await queryClient.invalidateQueries(['todos'])
  })

  if (!data) return null;

  return <div className={styles.todo}>
    {isEditMode
      ? <div><input value={todoInput} onChange={(e) => setTodoInput(e.target.value)} /></div>
      : <h2 data-done={!!data.done}>{data.todo}</h2>
    }
    <input id="done" type="checkbox" defaultChecked={data.done} onChange={() => toggleStatus.mutate(id)} />
    <label htmlFor='done'>Completed</label>

    <div className={styles.buttons}>
      {!isEditMode && <button onClick={() => { toggleEditMode(current => !current) }}>Edit</button>}
      {isEditMode &&
        <>
          <button onClick={() => updateTodo.mutate({ id, updatedTodo: todoInput })}>Save</button>
          <button onClick={() => toggleEditMode(false)}>Cancel</button>
        </>
      }
    </div>
  </div >
}

const HomeWrapper = () =>
  <QueryClientProvider client={q}>
    <Home />
    {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen />}
  </QueryClientProvider>

export default HomeWrapper;