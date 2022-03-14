import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useEffect, useState } from "react";

import type { Todo, TodoId, TodoValue } from "~/lib/types";

import { ReactQueryDevtools } from 'react-query/devtools';
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient, dehydrate, Hydrate, DehydratedState } from 'react-query';

const q = new QueryClient();

const loadTodosFn = () => fetch('/api/list').then(res => res.json() as Promise<{ todos: Todo[] }>)
const addTodoFn = (todo: TodoValue) => fetch('/api/add?todo=' + todo)
const toggleTodoFn = (todo: TodoId) => fetch('/api/toggleStatus?id=' + todo)

function Home() {
  const queryClient = useQueryClient();
  const [todo, setTodo] = useState("");
  let changeHandler = (event: any) => {
    setTodo(event.target.value)
  }

  const { data, isLoading: isTodoLoading } = useQuery(['todos'], loadTodosFn);

  const addTodo = useMutation(addTodoFn, {
    onSuccess: (data) => queryClient.invalidateQueries(['todos'])
  });

  const toggleTodoStatus = useMutation(toggleTodoFn, {
    onSuccess: (data) => queryClient.invalidateQueries(['todos'])
  });

  const loading = isTodoLoading || addTodo.isLoading || toggleTodoStatus.isLoading;

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
            loading &&
            <a href="#" className={styles.card}>
              <img src="/loader.gif" />
            </a>
          }

          <form className={styles.cardForm} onSubmit={() => addTodo.mutate(todo)}>
            <input className={styles.cardInput} type="text"
              name="todo" onChange={changeHandler}
              placeholder="Enter your exciting TODO item!" />
          </form>

          {data?.todos.map((item) =>
            <a key={item.id} onClick={() => toggleTodoStatus.mutate(item.id)} className={styles.card}>
              <p style={{
                ...item.done ? { textDecoration: 'line-through' } : {}
              }}>{item.todo}</p>
            </a>)}

        </div>
      </main>


    </div>
  )
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