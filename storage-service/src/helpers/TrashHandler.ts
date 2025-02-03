import path from 'node:path';
import FileAccessor from '../accessors/File';
import fs from 'node:fs/promises';
import { PATHS } from '../utils';
import type { File } from '@prisma/client';

export default class TrashHandler extends FileAccessor {
	constructor() {
		super();
	}

	/**
	  * Move a file to the trash
	  * @param {string} userId The user ID
	  * @param {string} filePath The file path
	*/
	async moveToTrash(userId: string, filePath: string) {
		const file = await this.getByFilePath(userId, filePath);
		if (file == null) throw new Error('Invalid path');

		await this.update({
			id: file.id,
			deletedAt: new Date(),
		});

		// If it's a folder, process its children (don't move the folder itself again)
		if (file.type === 'DIRECTORY') {
			const children = await this.getByParentId(file.id);

			// Move all child files/subfolders
			for (const child of children) {
				await this.moveToTrash(userId, child.path);
			}

			// Delete the old folder now it should be empty
			const oldFolderPath = path.join(PATHS.CONTENT, userId, file.path);
			if ((await fs.readdir(oldFolderPath)).length === 0) {
				await fs.rmdir(oldFolderPath);
			}
			return file;
		}

		// Make sure the folders exist
		const targetDir = path.join(PATHS.TRASH, userId, file.path);
		await fs.mkdir(path.dirname(targetDir), { recursive: true });
		await fs.rename(path.join(PATHS.CONTENT, userId, file.path), path.join(PATHS.TRASH, userId, file.path));
	}

	/**
	 * Restore the deleted files
	 * @param {string} userId The user ID
	 * @param {string} filePath The file path
	 * @returns {File} The updated file
	 */
	async restoreFile(userId: string, filePath: string): Promise<File> {
		const file = await this.getByFilePath(userId, filePath, true);
		if (file == null) throw new Error('Invalid path');

		// Update the current file/folder in the database
		await this.update({
			id: file.id,
			deletedAt: null,
		});

		// If it's a folder, process its children (don't move the folder itself again)
		if (file.type === 'DIRECTORY') {
			const children = await this.getByParentId(file.id);

			// Move all child files/subfolders
			for (const child of children) {
				await this.restoreFile(userId, child.path);
			}

			// Delete the old folder now it should be empty
			const oldFolderPath = path.join(PATHS.TRASH, userId, file.path);
			if ((await fs.readdir(oldFolderPath)).length === 0) {
				await fs.rmdir(oldFolderPath);
			}
			return file;
		}

		// Ensure the new folder structure exists on the file system
		const newFileSystemPath = path.join(PATHS.CONTENT, userId, file.path);
		await fs.mkdir(path.dirname(newFileSystemPath), { recursive: true });

		// Move the file/folder on the file system
		await fs.rename(path.join(PATHS.TRASH, userId, file.path), newFileSystemPath);
		return file;
	}

	/**
	  * Undo the deleted files
	  * @param {string} userId The user ID
		* @returns {GetBatchResult} The result of the operation
	*/
	async emptyTrash(userId: string): Promise<File[]> {
		// First get all files in trash so the actual file can be moved back to the user's directory
		const filesInTrash = await this.getAllDeletedFiles(userId);
		return Promise.all(filesInTrash.map(async f => await this.restoreFile(userId, f.path)));
	}
}
