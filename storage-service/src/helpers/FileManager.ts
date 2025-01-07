import { Error as ErrorCL, PATHS, sanitiseObject } from '../utils';
import path from 'node:path';
import fs from 'node:fs/promises';
import util from 'node:util';
import { exec } from 'node:child_process';
import type { Response } from 'express';
import FileAccessor from '../accessors/File';
import archiver from 'archiver';
const cmd = util.promisify(exec);

interface diskStorage {
  free: number
  total: number
}
export default class FileManager extends FileAccessor {
	diskData: diskStorage;
	constructor() {
		super();
		this.diskData = { free: 0, total: 0 };

		// Fetch disk data & update every 5 minutes
		this._fetchDiskData();
		setInterval(() => this._fetchDiskData(), 1000 * 60 * 10);
	}

	/**
	  * Retrieves the files in a directory
	  * @param {string} userId The user's ID.
	  * @param {string} filePath file path of the directory.
	*/
	async getDirectory(userId: string, filePath: string) {
		const files = await this.getByFilePath(userId, filePath);
		return sanitiseObject(files);
	}

	/**
	  * Deletes a file
	  * @param {string} userId The user's ID.
	  * @param {string} filePath file path of the file.
	*/
	async delete(userId: string, filePath: string) {
		const fullPath = path.resolve(PATHS.CONTENT, userId, filePath);
		console.log(fullPath);
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
		const oldFile = await this.getByFilePath(userId, oldFilePath);
		const newDir = await this.getByFilePath(userId, newFilePath);
		if (oldFile == null || newDir == null) throw new Error('Invalid path.');

		const newFile = await this.update({
			id: oldFile.id,
			parentId: newDir.id,
			path: `${newDir.path}/${oldFilePath.split('/').at(-1)}`,
		});

		return fs.rename(path.join(PATHS.CONTENT, userId, oldFile.path), path.join(PATHS.CONTENT, userId, newFile.path));
	}

	async rename(userId: string, filePath: string, newName: string) {
		const file = await this.getByFilePath(userId, filePath);
		if (file === null) throw new Error('File not found');

		// Update the file
		const pathSegs = file.path.split('/');
		pathSegs[pathSegs.length - 1] = newName;
		const newPath = pathSegs.join('/');

		// Will update to also support their children for path to be updated aswell (when it's a directory)
		await this.update({ id: file.id, name: newName, path: newPath });
		return fs.rename(path.join(PATHS.CONTENT, userId, filePath), path.join(PATHS.CONTENT, userId, newName));
	}

	/**
	  * Copies a file
	  * @param {string} userId The user's ID.
	  * @param {string} oldFilePath The old file path.
		* @param {string} newFilePath The new file path.
	*/
	async copy(userId: string, oldFilePath: string, newFilePath: string) {
		const oldFile = await this.getByFilePath(userId, oldFilePath);
		const newDir = await this.getByFilePath(userId, newFilePath);
		if (oldFile == null || newDir == null) throw new Error('Invalid path.');

		console.log(oldFile, newDir);
		console.log(`${newDir.path}${oldFile.path}`);

		const newFile = await this.create({
			path: `${newDir.path}${oldFile.path}`,
			name: oldFile.name,
			size: oldFile.size,
			userId: oldFile.userId,
			type: oldFile.type,
			parentId: newDir.id,
		});

		// Copy the file
		return fs.copyFile(path.join(PATHS.CONTENT, userId, oldFilePath), path.join(PATHS.CONTENT, userId, newFile.path));
	}

	/**
	  * Creates a directory
	  * @param {string} userId The user's ID.
	  * @param {string} filePath file path of the directory.
		* @param {string} folderName The name of the folder.
	*/
	async createDirectory(userId: string, filePath: string, folderName: string) {
		const fullPath = path.join(PATHS.CONTENT, userId, filePath, folderName);
		const isPathValid = this._verifyTraversal(userId, fullPath);
		if (!isPathValid) throw new Error('Invalid path');

		// Create the directory
		const dir = await this.getByFilePath(userId, filePath);
		if (dir !== null) {
			await this.update({ id: dir.id,
				children: {
					userId,
					name: folderName,
					path: `${filePath}${folderName}`,
					size: 0n,
					type: 'DIRECTORY',
				},
			});
		}
		return fs.mkdir(fullPath, { recursive: true });
	}

	/**
	  * Retrieves the file system statistics
		* @returns {diskStorage} The disk storage data.
	*/
	getFileSystemStatitics(): diskStorage {
		return this.diskData;
	}

	downloadFile(res: Response, userId: string, filePath: string) {
		res.download(path.join(PATHS.CONTENT, userId, filePath));
	}

	async downloadDirectory(res: Response, userId: string, filePath: string) {
		const archive = archiver('zip', { zlib: { level: 9 } });
		res.setHeader('Content-Type', 'application/zip');
		res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}.zip"`);

		// Append directory to archive
		archive.pipe(res);
		archive.directory(path.join(PATHS.CONTENT, userId, filePath), false);

		try {
			await archive.finalize();
			res.end();
		} catch (error) {
			ErrorCL.GenericError(res, 'Failed to create archive');
		}
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

	/**
	  * Fetches disk data
	*/
	async _fetchDiskData() {
		const platform = process.platform;
		if (platform == 'win32') {
			const { stdout } = await cmd('wmic logicaldisk get size,freespace,caption');
			const parsed = stdout.trim().split('\n').slice(1).map(line => line.trim().split(/\s+(?=[\d/])/));
			const filtered = parsed.filter(d => process.cwd().toUpperCase().startsWith(d[0].toUpperCase()));
			this.diskData = {
				free: Number(filtered[0][1]),
				total: Number(filtered[0][2]),
			};
		} else if (platform == 'linux') {
			const { stdout } = await cmd('df -Pk --');
			const parsed = stdout.trim().split('\n').slice(1).map(line => line.trim().split(/\s+(?=[\d/])/));
			const filtered = parsed.filter(() => true);
			this.diskData = {
				free: Number(filtered[0][3]),
				total: Number(filtered[0][1]),
			};
		}
	}
}