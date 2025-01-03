import { Request, Response } from 'express';
import fs from 'fs';
import { lookup } from 'mime-types';
import { spawn } from 'child_process';
import { createThumbnail } from '../utils/functions';
import { PATHS, Error } from '../utils';
import { getSession } from '../middleware';
import { Client } from 'src/helpers';
import { Prisma } from '@prisma/client';

// Endpoint GET /avatar/:userId?
export const getAvatar = () => {
	return async (req: Request, res: Response) => {
		let userId;
		if (req.params.userId) {
			userId = req.params.userId;
		} else {
			const session = await getSession(req);
			if (!session?.user) return Error.MissingAccess(res, 'Session is invalid, please try logout and sign in again.');
			userId = session.user.id;
		}

		// Check if the user already has an avatar, if not display default one
		const avatarPath = fs.existsSync(`${PATHS.AVATAR}/${userId}.webp`) ? userId : 'default-avatar';
		res.sendFile(`${PATHS.AVATAR}/${avatarPath}.webp`);
	};
};

// Endpoint GET /thumbnail/:userid/:path(*)
export const getThumbnail = (client: Client) => {
	return async (req: Request, res: Response) => {
		const userId = req.params.userid as string;
		const path = req.params.path as string;

		const fileType = lookup(path);
		const fileName = path.substring(0, path.lastIndexOf('.')) || path;
		if (fileType !== false) {
			// Create folder (if needed to)
			const folder = path.split('/').slice(0, -1).join('/');
			if (!fs.existsSync(`${PATHS.THUMBNAIL}/${userId}/${folder}`)) fs.mkdirSync(`${PATHS.THUMBNAIL}/${userId}/${folder}`, { recursive: true });

			// Create thumbnail from video, photo
			switch (fileType.split('/')[0]) {
				case 'image': {
					// Create thumbnail if not already created
					try {
						if (!fs.existsSync(`${PATHS.THUMBNAIL}/${userId}/${decodeURI(fileName)}.jpg`)) await createThumbnail(userId, path);
						return res.sendFile(`${PATHS.THUMBNAIL}/${userId}/${decodeURI(fileName)}.jpg`);
					} catch (err) {
						client.logger.error(err);
						return res.sendFile(`${PATHS.THUMBNAIL}/missing-file-icon.png`);
					}
				}
				case 'video': {
					if (!fs.existsSync(`${PATHS.THUMBNAIL}/${userId}/${fileName}.jpg`)) {
						try {
							const child = spawn('ffmpeg',
								['-i', `${PATHS.CONTENT}/${userId}/${path}`,
									'-ss', '00:00:01.000', '-vframes', '1',
									`${PATHS.THUMBNAIL}/${userId}/${fileName}.jpg`,
								]);

							await new Promise((resolve, reject) => {
								child.on('close', resolve);
								child.on('error', reject);
							});
						} catch (err) {
							client.logger.error(err);
							return res.sendFile(`${PATHS.THUMBNAIL}/missing-file-icon.png`);
						}
					}
					return res.sendFile(`${PATHS.THUMBNAIL}/${userId}/${fileName}.jpg`);
				}
			}
		}

		return res.sendFile(`${PATHS.THUMBNAIL}/missing-file-icon.png`);
	};
};

// Endpoint GET /content/:userid/:path(*)
export const getContent = (client: Client) => {
	return async (req: Request, res: Response) => {
		const userId = req.params.userid as string;
		const path = req.params.path as string;

		// Fetch file from database
		const file = await client.FileManager.getByUserId(userId, path);
		if (!file) return Error.MissingResource(res, 'File not found');

		// Update the user's recently viewed file history
		try {
			await client.recentlyViewedFileManager.create({ userId, fileId: file.id });
		} catch (error) {
			// If the user has already viewed the file just update the viewedAt value
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') await client.recentlyViewedFileManager.update({ userId, fileId: file.id });
			} else {
				client.logger.error(error);
			}
		}

		const fileType = lookup(path);
		if (fileType == false) return res.sendFile(`${PATHS.THUMBNAIL}/missing-file-icon.png`);

		// Check what type of file it is, to send the relevent data
		switch(fileType.split('/')[0]) {
			case 'image':
				return res.sendFile(`${PATHS.CONTENT}/${userId}/${path}`);
			case 'video': {
				const range = req.headers.range;
				// Get video stats
				const videoSize = fs.statSync(`${PATHS.CONTENT}/${userId}/${path}`).size;
				if (!range) {
					res.writeHead(200, {
						'content-length': videoSize + 1,
						'content-type': 'video/mp4',
					});
					fs.createReadStream(`${PATHS.CONTENT}/${userId}/${path}`).pipe(res);
				} else {
					// Send chunks of 2MB = 2 * (10 ** 6)
					const CHUNK_SIZE = 2 * (10 ** 6);
					const start = Number(range.replace(/\D/g, ''));
					const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

					// Create headers
					const contentLength = end - start + 1;
					const headers = {
						'content-range': `bytes ${start}-${end}/${videoSize}`,
						'accept-ranges': 'bytes',
						'content-length': contentLength,
						'content-type': 'video/mp4',
						'range': `bytes ${start}-${end}/${videoSize}`,
					};

					// HTTP Status 206 for Partial Content
					res.writeHead(206, headers);

					// create video read stream for this particular chunk
					const videoStream = fs.createReadStream(`${PATHS.CONTENT}/${userId}/${path}`, { start, end });

					// Stream the video chunk to the client
					videoStream.pipe(res);
				}
			}
		}
	};
};