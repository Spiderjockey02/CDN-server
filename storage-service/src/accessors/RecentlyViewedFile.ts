import { LRUCache } from 'lru-cache';
import { RecentlyViewedFile } from '@prisma/client';
import client from './prisma';
import { CreateRecentlyViewedFile } from 'src/types/database/RecentlyViewedFile';

export default class RecentlyViewedFileManager {
	cache: LRUCache<string, RecentlyViewedFile>;

	constructor() {
		this.cache = new LRUCache({
			max: 100,
			ttl: 1000 * 60 * 60,
		});
	}

	create(data: CreateRecentlyViewedFile): Promise<RecentlyViewedFile> {
		return client.recentlyViewedFile.create({
			data: {
				file: {
					connect: {
						id: data.fileId,
					},
				},
				user: {
					connect: {
						id: data.userId,
					},
				},
			},
		});
	}

	update(data: CreateRecentlyViewedFile): Promise<RecentlyViewedFile> {
		return client.recentlyViewedFile.update({
			where: {
				fileId_userId: {
					fileId: data.fileId,
					userId: data.userId,
				},
			},
			data: {
				viewedAt: new Date(),
			},
		});
	}
}