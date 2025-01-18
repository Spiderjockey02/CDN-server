import { join } from 'path';
import formidable from 'formidable';
import { mkdir } from 'fs/promises';
import fs from 'fs';
import type { Request } from 'express';
import { PATHS } from '../utils';
import config from '../config';
import type { FullUser } from '../types/database/User';
import { Client } from 'src/helpers';

const parseForm = async (client: Client, req: Request, userId: string): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
	// eslint-disable-next-line no-async-promise-executor
	return await new Promise(async (resolve, reject) => {

		// Get the path from the referer
		const refererPath = req.headers['referer']?.split('/files')[1] || '';
		const path = (refererPath.length > 0) ? decodeURI(refererPath) : '/';

		// Check if the path is valid
		const uploadDir = join(PATHS.CONTENT, userId, path);
		if (!client.FileManager._verifyTraversal(userId, uploadDir)) throw 'Invalid path';

		let user: FullUser | null;
		try {
			user = await client.userManager.fetchbyParam({ id: userId });
			if (!user) throw 'Missing user';

			// Make sure they haven't already uploaded max storage
			if (user.totalStorageSize >= Number(user.group?.maxStorageSize ?? 0)) throw 'Max storage reached';
		} catch (e: any) {
			console.log('error', e);
			if (e?.code === 'ENOENT') {
				await mkdir(uploadDir, { recursive: true });
			} else {
				return reject(e);
			}
		}

		const form = formidable({
			allowEmptyFiles: false,
			maxFileSize: config.maximumFileSize,
			uploadDir,
			filename: (_name, _ext, part) => {
				const baseName = part.originalFilename?.replace(/\.[^/.]+$/, '') || 'file';
				const extension = part.originalFilename?.split('.').pop() || '';
				let finalName = `${baseName}.${extension}`;

				let counter = 1;
				const MAX_ATTEMPTS = 10;
				while (counter <= MAX_ATTEMPTS) {
					const fullPath = join(uploadDir, finalName);
					if (fs.existsSync(fullPath)) {
						const newBaseName = `${baseName} (${counter})`;
						finalName = `${newBaseName}.${extension}`;
						counter++;
					} else {
						break;
					}
				}
				if (counter > MAX_ATTEMPTS) throw new Error('Too many duplicate file names');
				return finalName;
			},
		});

		form.parse(req, async function(err, fields, files) {
			// Update user's total storage size
			const size: number = files.media?.reduce((a, b) => a + b.size, 0) ?? 0;
			await client.userManager.update({ id: userId, totalStorageSize: (user?.totalStorageSize ?? 0n) + BigInt(size) });

			// Update the database
			for (const file of files.media ?? []) {
				// Fetch the parent directory (folder that file is being uploaded to)
				const dir = await client.FileManager.getByFilePath(userId, path);
				if (dir == null) return reject('Missing parent directory');

				// Add the new file to the parent's directory
				await client.FileManager.update({ id: dir.id,
					children: {
						userId,
						name: `${file.newFilename}`,
						path: `${path}${file.newFilename}`,
						size: BigInt(file.size),
					},
				});
			}

			if (err) {
				reject(err);
			} else {
				resolve({ fields, files });
			}
		});
	});
};

export default parseForm;
