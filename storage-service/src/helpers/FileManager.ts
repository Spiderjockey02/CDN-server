import type { fileItem } from 'src/types';
import { directoryTree, PATHS } from '../utils';
import path from 'node:path';
import fs from 'node:fs/promises';

export default class FileManager {
	cache: Map<string, fileItem>;

	constructor() {
		this.cache = new Map();
	}

	/**
	  * Retrieves the files in a directory
	  * @param {string} userId The user's ID.
	  * @param {string} filePath file path of the directory.
	*/
	async getDirectory(userId: string, filePath: string) {
		// Build the full path and make sure it's valid
		const fullPath = path.resolve(PATHS.CONTENT, userId, filePath);
		const isPathValid = this._verifyTraversal(userId, fullPath);
		if (!isPathValid) throw new Error('Invalid path');

		// Get the files
		return this.cache.get(fullPath) ?? await directoryTree(fullPath);
	}

	/**
	  * Deletes a file
	  * @param {string} userId The user's ID.
	  * @param {string} filePath file path of the file.
	*/
	async delete(userId: string, filePath: string) {
		const fullPath = path.resolve(PATHS.CONTENT, userId, filePath);
		const isPathValid = this._verifyTraversal(userId, fullPath);
		if (!isPathValid) throw new Error('Invalid path');

		// Update this so it moves to trash instead of deleting (TrashHandler)
	}

	/**
	  * Moves a file
	  * @param {string} userId The user's ID.
	  * @param {string} oldFilePath The old file path.
		* @param {string} newFilePath The new file path.
	*/
	async move(userId: string, oldFilePath: string, newFilePath: string) {
		const oldFullPath = path.resolve(PATHS.CONTENT, userId, oldFilePath);
		const newFullPath = path.resolve(PATHS.CONTENT, userId, newFilePath);
		const isOldPathValid = this._verifyTraversal(userId, oldFullPath);
		const isNewPathValid = this._verifyTraversal(userId, newFullPath);
		if (!isOldPathValid || !isNewPathValid) throw new Error('Invalid path');

		// Move the file
		return fs.rename(oldFullPath, newFullPath);
	}

	/**
	  * Copies a file
	  * @param {string} userId The user's ID.
	  * @param {string} oldFilePath The old file path.
		* @param {string} newFilePath The new file path.
	*/
	async copy(userId: string, oldFilePath: string, newFilePath: string) {
		const oldFullPath = path.resolve(PATHS.CONTENT, userId, oldFilePath);
		const newFullPath = path.resolve(PATHS.CONTENT, userId, newFilePath);
		const isOldPathValid = this._verifyTraversal(userId, oldFullPath);
		const isNewPathValid = this._verifyTraversal(userId, newFullPath);
		if (!isOldPathValid || !isNewPathValid) throw new Error('Invalid path');

		// Copy the file
		return fs.copyFile(oldFilePath, newFullPath);
	}

	/**
	  * Creates a directory
	  * @param {string} userId The user's ID.
	  * @param {string} filePath file path of the directory.
		* @param {string} folderName The name of the folder.
	*/
	async createDirectory(userId: string, filePath: string, folderName: string) {
		const fullPath = path.resolve(PATHS.CONTENT, userId, filePath, folderName);
		const isPathValid = this._verifyTraversal(userId, fullPath);
		if (!isPathValid) throw new Error('Invalid path');

		// Create the directory
		return fs.mkdir(fullPath);
	}

	/**
	  * Ensures the path is within the user's directory
	  * @param {string} userId The user's ID.
	  * @param {string} filePath How file path.
	*/
	_verifyTraversal(userId: string, filePath: string) {
		const userBasePath = path.resolve(PATHS.CONTENT, userId);
		const targetPath = path.resolve(filePath);
		return targetPath.startsWith(userBasePath);
	}
}