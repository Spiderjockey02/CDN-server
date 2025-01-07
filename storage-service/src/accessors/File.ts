import { createFile, updateFile } from 'src/types/database/File';
import client from './prisma';
import { LRUCache } from 'lru-cache';
import { File, FileType } from '@prisma/client';

export default class FileAccessor {
	cache: LRUCache<string, File>;

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
		this.cache.set(file.id, file);
		return file;
	}

	/**
    * Updates a file
    * @param {updateFile} data The file data.
    * @returns {File} The updated file.
  */
	async update(data: updateFile): Promise<File> {
		const files = await client.file.update({
			where: {
				id: data.id,
			},
			data: {
				path: data.path,
				name: data.name,
				size: data.size,
				parentId: data.parentId,
				children: {
					create: data.children,
				},
			},
		});
		this.cache.set(files.id, files);
		return files;
	}

	/**
    * Deletes a file
    * @param {string} id The file id.
  */
	async deleteFromDB(id: string): Promise<void> {
		await client.file.delete({
			where: { id },
		});
		this.cache.delete(id);
	}

	/**
    * Gets a file by id
    * @param {string} id The file id.
    * @returns {File | null} The file.
  */
	async getById(id: string): Promise<File | null> {
		let file = this.cache.get(id) ?? null;
		if (file == null) {
			file = await client.file.findUnique({
				where: { id },
			});
			if (file !== null) this.cache.set(id, file);
		}

		return file;
	}

	async getByFilePath(userId: string, filePath: string) {
		return client.file.findFirst({
			where: { userId,
				path: {
					equals: filePath.startsWith('/') ? filePath : `/${filePath}`,
				},
			},
			include: {
				children: {
					include: {
						_count: {
							select: {
								children: true,
							},
						},
					},
				},
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
			},
		});
	}

	/*
		* Gets all files
		* @returns {number} The total count of files.
	*/
	async fetchTotalCount() {
		return client.file.count();
	}


	getAllDirectories(userId: string) {
		return client.file.findMany({
			where: {
				userId,
				type: 'DIRECTORY',
			},
		});
	}
}