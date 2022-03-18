import { NextApiHandler } from "next";
import { get } from "~/lib/stash";
import { TodoId } from "~/lib/types";

export const service = (id: TodoId) => {
  return { ...get(id) };
}

const handler: NextApiHandler = async (req, res) => {
  const todoId = req.query['todoId'];

  if (Array.isArray(todoId) || ~~todoId === 0) {
    res.status(400).send('Invalid todoId')
    return;
  }

  if (!get(~~todoId)) {
    res.status(404).end();
    return;
  }

  return res.json(service(~~todoId));
}

export default handler;