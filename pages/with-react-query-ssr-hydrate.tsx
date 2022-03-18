import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useEffect, useState, SyntheticEvent } from "react";

import type { Todo, TodoId, TodoValue } from "~/lib/types";

import { ReactQueryDevtools } from 'react-query/devtools';
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient, dehydrate, Hydrate, DehydratedState } from 'react-query';

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
  const [selectedTodo, setSelectedTodo] = useState<TodoId | undefined>(undefined);

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

          <NewTodo />
          <TodoList onTodoSelected={setSelectedTodo} />
        </div>

        <SelectedTodo id={selectedTodo} />
      </main>

    </div>
  )
}

export function NewTodo() {
  const queryClient = useQueryClient();
  const [todo, setTodo] = useState("");

  const changeHandler = (event: any) => {
    setTodo(event.target.value)
  }

  const handleAddTodoForm = (e: SyntheticEvent) => {
    e.preventDefault();
    addTodo.mutate(todo);
    setTodo('');
  }

  const addTodo = useMutation(addTodoFn, {
    onSuccess: async () => {
      await queryClient.invalidateQueries(['todos']);
      setTodo('');
    }
  });

  return <>
    <form className={styles.cardForm} onSubmit={handleAddTodoForm}>
      <input className={styles.cardInput} type="text"
        value={todo}
        name="todo" onChange={changeHandler}
        placeholder="Enter your exciting TODO item!" />
    </form>
  </>
}

type TodoListProps = {
  onTodoSelected: (id: TodoId) => void
}

export function TodoList({ onTodoSelected }: TodoListProps) {
  const { data } = useQuery(['todos'], loadTodosFn);
  console.log(data)
  return <>{data?.todos.map((item) =>
    <a key={item.id} onClick={() => onTodoSelected(item.id)} className={styles.card}>
      <p style={{
        textDecoration: item.done ? 'line-through' : 'none'
      }}>{item.todo}</p>
    </a>)}
  </>
}

type SelectedTodoProps = {
  id: TodoId | undefined;
}

export function SelectedTodo({ id }: SelectedTodoProps) {
  const queryClient = useQueryClient();

  const [isEditMode, toggleEditMode] = useState(false);
  const { data } = useQuery(id !== undefined ? ['todos', id] : undefined, () => loadTodoFn(id), {
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

/*
 * Parts below are normally in _app
 */

const HomeWrapper = (props: DehydratedState) => {
  return <QueryClientProvider client={q}>
    <Hydrate state={props}>
      <Home />
    </Hydrate>
    {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen />}
  </QueryClientProvider>
}

export default HomeWrapper;

import { service } from './api/list';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps<DehydratedState> = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(['todos'], service);

  return {
    props: {
      ...dehydrate(queryClient)
    }
  }
}