import { createFile, FullFile, updateFile, updateFilePath } from 'src/types/database/File';
import client from './prisma';
import { LRUCache } from 'lru-cache';
import { File, FileType } from '@prisma/client';
import prisma from './prisma';

export default class FileAccessor {
	cache: LRUCache<string, FullFile>;

	constructor() {
		this.cache = new LRUCache({
			max: 100,
			ttl: 1000 * 60 * 60,
		});
	}

	/**
    * Creates a new file
    * @param {createFile} data The file data.
    * @returns {File} The created file.
  */
	async create(data: createFile): Promise<File> {
		const file = await client.file.create({
			data: {
				path: data.path,
				name: data.name,
				size: data.size,
				userId: data.userId,
				type: data.type,
				parentId: data.parentId,
			},
		});
		this.cache.set(`${file.userId}_${file.path}`, file);
		return file;
	}

	/**
    * Updates a file
    * @param {updateFile} data The file data.
    * @returns {File} The updated file.
  */
	async update(data: updateFile): Promise<FullFile> {
		const file = await client.file.update({
			where: {
				id: data.id,
			},
			data: {
				path: data.path,
				name: data.name,
				size: data.size,
				parentId: data.parentId,
				deletedAt: data.deletedAt,
				children: {
					create: data.children,
				},
			},
			include: {
				children: {
					where: {
						deletedAt: null,
					},
					include: {
						_count: {
							select: {
								children: {
									where: {
										deletedAt: null,
									},
								},
							},
						},
					},
				},
			},
		});
		this.cache.set(`${file.userId}_${file.path}`, file);
		return file;
	}

	/**
	 * Updates a file's path and all of it's children
	 * @param {updateFile} data The file data.
	 * @returns {number} The number of rows updated.
	*/
	async updateChildsPath({ oldPath, newPath, userId }: updateFilePath): Promise<number> {
		// Update child paths using updateMany
		return prisma.$executeRawUnsafe(
			`UPDATE \`File\`
			SET path = REPLACE(path, ?, ?)
			WHERE path LIKE CONCAT(?, '%') 
			AND userId = ?`,
			oldPath,
			newPath,
			oldPath,
			userId,
		);
	}

	/**
    * Deletes a file
    * @param {string} id The file id.
		* @returns {Boolean} If the file was deleted.
  */
	async deleteFromDB(id: string): Promise<boolean> {
		await client.file.delete({
			where: { id },
		});
		return this.cache.delete(id);
	}

	/**
		* Gets a file by it's path
		* @param {string} userId The file's owners Id.
		* @param {string} filePath The file path.
		* @returns {FullFile | null} The file.
	*/
	async getByFilePath(userId: string, filePath: string): Promise<FullFile | null> {
		// Check cache first
		let file = this.cache.get(`${userId}_${filePath}`) ?? null;
		if (file !== null) return file;

		// Fetch from database
		file = await client.file.findFirst({
			where: {
				userId,
				deletedAt: null,
				path: {
					equals: filePath.startsWith('/') ? filePath : `/${filePath}`,
				},
			},
			include: {
				children: {
					where: {
						deletedAt: null,
					},
					include: {
						_count: {
							select: {
								children: {
									where: {
										deletedAt: null,
									},
								},
							},
						},
					},
				},
			},
		});
		if (file !== null) this.cache.set(`${userId}_${filePath}`, file);
		return file;
	}

	/**
		* Gets files by it's parentId
		* @param {string} parentId The file id.
		* @returns {File[]} The file.
	*/
	getByParentId(parentId: string): Promise<File[]> {
		return client.file.findMany({
			where: {
				parentId,
			},
		});
	}

	/**
		* Gets a file by name
		* @param {string} name The file name.
		* @returns {File[]} The file.
	*/
	async searchByName(userId: string, name: string, type: FileType | undefined): Promise<File[]> {
		return client.file.findMany({
			where: {
				userId,
				name: {
					startsWith: name,
				},
				type,
				deletedAt: null,
			},
		});
	}

	/**
		* Gets all of the user's directories
		* @param {string} userId The user Id.
		* @returns {File[]} The files.
	*/
	async getAllDirectories(userId: string): Promise<File[]> {
		return client.file.findMany({
			where: {
				userId,
				type: 'DIRECTORY',
			},
		});
	}

	/**
		* Get all user's (pending) deleted files
		* @param {string} userId The user Id.
		* @returns {File[]} The files.
	*/
	getAllDeletedFiles(userId?: string): Promise<File[]> {
		return client.file.findMany({
			where: {
				userId,
				deletedAt: {
					not: null,
				},
			},
		});
	}

	/**
		* Gets all files
		* @returns {number} The total count of files.
	*/
	async fetchTotal(): Promise<number> {
		return client.file.count();
	}
}