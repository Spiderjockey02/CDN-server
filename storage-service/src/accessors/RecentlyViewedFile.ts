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

	upsert(data: CreateRecentlyViewedFile): Promise<RecentlyViewedFile> {
		return client.recentlyViewedFile.upsert({
			where: {
				fileId_userId: {
					fileId: data.fileId,
					userId: data.userId,
				},
			},
			update: {
				viewedAt: new Date(),
			},
			create: {
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

	fetchUsers(userId: string) {
		return client.recentlyViewedFile.findMany({
			where: {
				userId,
			},
			orderBy: {
				viewedAt: 'asc',
			},
			include: {
				file: true,
			},
		});
	}
}