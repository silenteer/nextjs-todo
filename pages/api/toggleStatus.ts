import { NextApiHandler } from "next";
import { get, toggleStatus } from "~/lib/stash";

const handler: NextApiHandler = async (req, res) => {
	const todoId = req.query.id;

	if (Array.isArray(todoId) || ~~todoId === 0) {
		res.status(400).send('Invalid todoId')
		return;
	}

	if (!get(~~todoId)) {
		res.status(404).end();
		return;
	}

	toggleStatus(~~todoId);
	res.status(200).end();
}


export default handler;