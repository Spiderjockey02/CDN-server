import { Request, Response } from 'express';
import { getSession } from '../middleware';
import { Error, sanitiseObject } from '../utils';
import { Client } from '../helpers';

export const getTrash = (client: Client) => {
	return async (req: Request, res: Response) => {
		try {
			const session = await getSession(req);
			if (!session?.user) return Error.InvalidSession(res);

			const files = await client.FileManager.TrashHandler.getAllDeletedFiles(session.user.id);
			res.json({ files: sanitiseObject(files) });
		} catch (err) {
			console.log(err);
			Error.GenericError(res, 'Failed to retrieve files in trash.');
		}
	};
};