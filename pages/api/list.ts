import { NextApiHandler } from "next";
import { list } from "~/lib/stash";

export const service = () => {
  return { todos: list() };
}

const handler: NextApiHandler = async (req, res) => {
  return res.json(service());
}

export default handler;