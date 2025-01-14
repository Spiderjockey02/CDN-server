import path from 'node:path';
import FileAccessor from '../accessors/File';
import fs from 'node:fs/promises';
import { PATHS } from '../utils';

export default class TrashHandler extends FileAccessor {
	constructor() {
		super();
	}

	async addFile(userId: string, filePath: string) {
		const file = await this.getByFilePath(userId, filePath);
		if (file == null) throw new Error('Invalid path');

		this.update({
			id: file.id,
			deletedAt: new Date(),
		});

		// Make sure the folders exist
		const targetDir = path.join(PATHS.TRASH, userId, file.path);
		await fs.mkdir(path.dirname(targetDir), { recursive: true });
		await fs.rename(path.join(PATHS.CONTENT, userId, file.path), path.join(PATHS.TRASH, userId, file.path));
	}
}
