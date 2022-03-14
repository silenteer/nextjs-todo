import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useEffect, useState } from "react";

import type { Todo } from "~/lib/types";

export default function Home() {
  const [data, setData] = useState<{ todos: Todo[] }>({ todos: [] });
  const [loading, setLoading] = useState(false);
  const [todo, setTodo] = useState("");
  let changeHandler = (event: any) => {
    setTodo(event.target.value)
  }

  let addTodo = (event: any) => {
    setLoading(true)
    event.preventDefault();
    fetch('/api/add?todo=' + todo)
      .then(data => {
        loadTodos()
      })
  }

  let removeTodo = (rtodo: number) => {
    setLoading(true)
    fetch('/api/toggleStatus?id=' + rtodo)
      .then(data => {
        loadTodos()
      })
  }

  let loadTodos = () => {
    console.log("load todos")
    fetch('/api/list')
      .then(res => res.json())
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
            <a key={item.id} onClick={() => removeTodo(item.id)} className={styles.card}>
              <p style={{
                ...item.done ? { textDecoration: 'line-through' } : {}
              }}>{item.todo}</p>
            </a>)}

        </div>
      </main>

    </div>
  )
}
