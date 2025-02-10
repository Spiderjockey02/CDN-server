import path from 'node:path';
import fs from 'node:fs/promises';
import { PATHS } from '../utils';
import type { File } from '@prisma/client';
import FileManager from './FileManager';
import config from '../config';
import cron from 'node-cron';

export default class TrashHandler {
	fileManager: FileManager;
	constructor(fileManager: FileManager) {
		this.fileManager = fileManager;

		this.checkRetentionOfFiles();
	}

	/**
	  * Move a file to the trash
	  * @param {string} userId The user ID
	  * @param {string} filePath The file path
	*/
	async moveToTrash(userId: string, filePath: string) {
		const file = await this.fileManager.getByFilePath(userId, filePath);
		if (file == null) throw new Error('Invalid path');

		// Calculate how long the file should stay in the trash before being removed
		const dateToDelete = new Date();
		dateToDelete.setDate(dateToDelete.getDate() + config.DeletedFileExpireDays);

		await this.fileManager.update({
			id: file.id,
			deletedAt: dateToDelete,
		});

		// If it's a folder, process its children (don't move the folder itself again)
		if (file.type === 'DIRECTORY') {
			const children = await this.fileManager.getChildrenByParentId(file.id);
			// Move all child files/subfolders  (make sure no children are already moved to trash)
			for (const child of children.filter(f => f.deletedAt == null)) {
				await this.moveToTrash(userId, child.path);
			}

			// Delete the old folder now it should be empty
			const oldFolderPath = path.join(PATHS.CONTENT, userId, file.path);
			if ((await fs.readdir(oldFolderPath)).length === 0) {
				await fs.rmdir(oldFolderPath);
			}
		} else {
			// Make sure the folders exist
			const targetDir = path.join(PATHS.TRASH, userId, file.path);
			await fs.mkdir(path.dirname(targetDir), { recursive: true });
			await fs.rename(path.join(PATHS.CONTENT, userId, file.path), path.join(PATHS.TRASH, userId, file.path));
		}

		// Return the deleted file
		return file;
	}

	/**
	 * Restore a deleted file back the user's directory
	 * @param {string} userId The user ID
	 * @param {string} filePath The file path
	 * @returns {File} The updated file
	 */
	async restoreFile(userId: string, filePath: string): Promise<File> {
		const file = await this.fileManager.getByFilePath(userId, filePath, true);
		if (file == null) throw new Error('Invalid path');

		// Update the current file/folder in the database
		await this.fileManager.update({
			id: file.id,
			deletedAt: null,
		});

		// If it's a folder, process its children (don't move the folder itself again)
		if (file.type === 'DIRECTORY') {
			const children = await this.fileManager.getChildrenByParentId(file.id);

			// Move all child files/subfolders (make sure no children are already restored)
			for (const child of children.filter(f => f.deletedAt !== null)) {
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
	  * Restore a user's entire deleted files back to their files
	  * @param {string} userId The user ID
		* @returns {GetBatchResult} The result of the operation
	*/
	async emptyTrash(userId: string): Promise<File[]> {
		// First get all files in trash so the actual file can be moved back to the user's directory
		const filesInTrash = await this.fileManager.getAllUsersDeletedFiles(userId);
		return Promise.all(filesInTrash.map(async f => await this.restoreFile(userId, f.path)));
	}

	/**
	  * Remove the deleted file from the system
	  * @param {string} userId The user ID
	  * @param {string} filePath The file path
	*/
	async removeFileFromSystem(userId: string, filePath: string) {
		const file = await this.fileManager.getByFilePath(userId, filePath, true);
		if (file && file.deletedAt !== null) {
			await this.fileManager.deleteFromDB(file.id);
			await fs.rm(`${PATHS.CONTENT}/${userId}${filePath}`, { recursive: true });
		}
	}


	/**
	  * At the end of each day check if any trashed files need actually removing from system
	*/
	checkRetentionOfFiles() {
		cron.schedule('0 0 * * *', async () => {
			const files = await this.fileManager.getAllUsersDeletedFiles();

			// Loop through each file and check if it should be deleted
			for (const file of files) {
				// @ts-expect-error All files that are fetched would have deletedAt value as that's the query
				if (file.deletedAt.getTime() <= new Date().getTime()) this.removeFileFromSystem(file.userId, file.path);
			}
		});
	}
}
