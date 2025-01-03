import { LRUCache } from 'lru-cache';
import client from './prisma';
import { Notification } from '@prisma/client';
import { CreateNotification } from 'src/types/database/Notification';

export default class NotificationManager {
	cache: LRUCache<string, Notification>;

	constructor() {
		this.cache = new LRUCache({
			max: 100,
			ttl: 1000 * 60 * 60,
		});
	}

	/**
	 * Creates a new notification
	 * @param {CreateNotification} data The notification data.
	 * @returns {Notification} The created notification.
	 */
	async create(data: CreateNotification): Promise<Notification> {
		const notification = await client.notification.create({
			data: {
				text: data.text,
				user: {
					connect: {
						id: data.userId,
					},
				},
			},
		});
		this.cache.set(notification.id, notification);
		return notification;
	}
}
