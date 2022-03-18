import { NextApiHandler } from "next";
import { get, update } from "~/lib/stash";
import { Todo, TodoId } from "~/lib/types";

export const service = (id: TodoId, value: string) => {
  update(id, value);
}

const handler: NextApiHandler = async (req, res) => {
  const todo: Todo = req.body;
  console.log(todo)
  if (todo.id === undefined || todo.todo === undefined) {
    res.status(400).send('invalid request');
    return;
  }

  if (!get(todo.id)) {
    res.status(404).end();
    return;
  }

  service(todo.id, todo.todo);
  res.status(200).end();
}

export default handler;