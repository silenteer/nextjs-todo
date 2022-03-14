import { NextApiHandler } from "next";
import { NextFetchEvent } from "next/server";
import { get, add } from "~/lib/stash";

const handler: NextApiHandler = async (req, res) => {
    if (!req.query.todo || Array.isArray(req.query.todo)) {
        return res.status(400).send("Invalid todo parameter.")
    }

    const nextId = add(req.query.todo);
    res.status(200).json(get(nextId));
};

export default handler;