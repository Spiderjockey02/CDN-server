import { Request, Response } from 'express';
import { PATHS, directoryTree, Error } from '../utils';
import { getSession, parseForm } from '../middleware';
import fs from 'fs/promises';
import archiver from 'archiver';
import { Client, TrashHandler } from '../helpers';
import type { fileItem } from '../types';
import path from 'node:path';
const trash = new TrashHandler();

// Endpoint GET /api/files
export const getFiles = (client: Client) => {
	return async (req: Request, res: Response) => {
		try {
			const session = await getSession(req);
			if (!session?.user) return Error.MissingAccess(res, 'Session is invalid, please try logout and sign in again.');

			// Fetch from cache
			const filePath = req.params.path;
			const files = await client.FileManager.getDirectory(session.user.id, filePath);

			res.json({ files });
		} catch (err) {
			client.logger.error(err);
			Error.GenericError(res, 'Failed to fetch file.');
		}
	};
};

// Endpoint POST /api/files/upload
export const postFileUpload = (client: Client) => {
	return async (req: Request, res: Response) => {
		const session = await getSession(req);
		if (!session?.user) return Error.MissingAccess(res, 'Session is invalid, please try logout and sign in again.');

		try {
			// Parse and save file(s)
			const { files } = await parseForm(client, req, session.user.id);
			const file = files.media;
			if (file == undefined) throw 'No files uploaded';

			return res.json({ success: 'File(s) successfully uploaded.' });
		} catch (err) {
			client.logger.error(err);
			Error.GenericError(res, 'Failed to upload file.');
		}
	};
};

// Endpoint DELETE /api/files/delete
export const deleteFile = (client: Client) => {
	return async (req: Request, res: Response) => {
		const session = await getSession(req);
		if (!session?.user) return Error.MissingAccess(res, 'Session is invalid, please try logout and sign in again.');

		const { path: filePath } = req.body;
		const userPath = (req.headers.referer)?.split('/files')[1] ?? '';

		try {
			await client.FileManager.delete(session.user.id, userPath);
			await trash.addFileToPending(session.user.id, userPath, filePath);
			res.json({ success: 'Successfully deleted item.' });
		} catch (err) {
			client.logger.error(err);
			Error.GenericError(res, 'Failed to delete item.');
		}
	};
};

// Endpoint POST /api/files/move
export const postMoveFile = (client: Client) => {
	return async (req: Request, res: Response) => {
		const session = await getSession(req);
		if (!session?.user) return Error.MissingAccess(res, 'Session is invalid, please try logout and sign in again.');
		const { newPath, oldPath } = req.body;

		try {
			await client.FileManager.move(session.user.id, oldPath, newPath);
			res.json({ success: 'Successfully moved item' });
		} catch (err) {
			client.logger.error(err);
			Error.GenericError(res, 'Failed to move item.');
		}
	};
};

// Endpoint POST /api/files/copy
export const postCopyFile = (client: Client) => {
	return async (req: Request, res: Response) => {
		const session = await getSession(req);
		if (!session?.user) return Error.MissingAccess(res, 'Session is invalid, please try logout and sign in again.');
		const { newPath, oldPath } = req.body;

		try {
			await fs.copyFile(`${PATHS.CONTENT}/${session.user.id}/${newPath}`, `${PATHS.CONTENT}/${session.user.id}/${oldPath}`);
			res.json({ success: 'Successfully copied file' });
		} catch (err) {
			client.logger.error(err);
			Error.GenericError(res, 'Failed to copy item.');
		}
	};
};

// Endpoint GET /api/files/download
export const getDownloadFile = (client: Client) => {
	return async (req: Request, res: Response) => {
		const session = await getSession(req);
		if (!session?.user) return Error.MissingAccess(res, 'Session is invalid, please try logout and sign in again.');
		const { path: filePath } = req.body;
		const archive = archiver('zip', { zlib: { level: 9 } });

		archive
			.directory(`${PATHS.CONTENT}/${session.user.id}${filePath}`, false)
			.on('error', (err) => {
				client.logger.error(err);
				Error.GenericError(res, 'Failed to download file.');
			})
			.pipe(res);
		archive.finalize();
	};
};

// Endpoint POST /api/files/rename
export const postRenameFile = (client: Client) => {
	return async (req: Request, res: Response) => {
		const session = await getSession(req);
		if (!session?.user) return Error.MissingAccess(res, 'Session is invalid, please try logout and sign in again.');
		const { oldPath, newPath } = req.body;
		const userPath = (req.headers.referer as string).split('/files')[1];
		const originalPath = userPath.startsWith('/') ? userPath : '/';

		try {
			await fs.rename(`${PATHS.CONTENT}/${session.user.id}${originalPath}${oldPath}`,
				`${PATHS.CONTENT}/${session.user.id}${originalPath}${newPath}.${oldPath.split('.').at(-1)}`);
			res.json({ success: 'Successfully renamed item' });
		} catch (err) {
			client.logger.error(err);
			Error.GenericError(res, 'Failed to rename item.');
		}
	};
};

// Endpoint POST /api/files/create-folder
export const postCreateFolder = (client: Client) => {
	return async (req: Request, res: Response) => {
		const session = await getSession(req);
		if (!session?.user) return Error.MissingAccess(res, 'Session is invalid, please try logout and sign in again.');

		try {
			const { folderName } = req.body;
			if (typeof folderName !== 'string' || !folderName.trim()) return Error.IncorrectBodyValue(res, 'folderName is not a string');

			// Validate and sanitise the folder name
			const validFolderName = /^[a-zA-Z0-9 _-]+$/;
			const santisedFolderName = path.normalize(folderName).replace(/^[/\\]+/, '');
			if (!validFolderName.test(santisedFolderName)) return Error.IncorrectBodyValue(res, 'folderName contains invalid characters');

			// Decode & santise the referer path to ensure the folder is added to the correct path
			const userPath = decodeURI(req.headers['referer']?.split('/files')[1] || '');
			const santisedPath = path.normalize(`${userPath}`).replace(/^[/\\]+/, '');
			if (santisedPath.length == 0) return Error.GenericError(res, 'Invalid path detected.');

			await client.FileManager.createDirectory(session.user.id, santisedPath, santisedFolderName);
			res.json({ success: 'Successfully created folder.' });
		} catch (err) {
			client.logger.error(err);
			Error.GenericError(res, 'Failed to create folder.');
		}
	};
};

// Endpoint GET /api/files/search
export const getSearchFile = (client: Client) => {
	return async (req: Request, res: Response) => {
		try {
			const session = await getSession(req);
			if (!session?.user) return res.json({ error: 'Invalid session' });

			const srch = req.query.search as string;
			const files = (await directoryTree(`${PATHS.CONTENT}/${session.user.id}`, 100))?.children;

			res.json({ query: search(files, srch).map((i) => ({ ...i, path: i.path.split(`${session.user?.id}`)[1] })) });
		} catch (err) {
			client.logger.error(err);
			Error.GenericError(res, 'Failed to searech for item.');
		}
	};
};

interface srchQuery {
	path: string
	name: string
}

function search(files: Array<fileItem> | undefined, text: string, arr: Array<srchQuery> = []) {
	if (files == undefined) return arr;
	for (const i of files) {
		if (i.type == 'file') {
			if (i.name.startsWith(text)) arr.push({ path: '', name: i.name });
		} else {
			arr.push(...search(i.children, text, []));
		}
	}

	return arr;
}