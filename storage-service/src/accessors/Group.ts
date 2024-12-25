import client from './prisma';
import type { IdParam } from '../types';
import { CreateGroupProps, getGroupsInclude, GroupNameProps } from 'src/types/database/Group';
import { Group } from '@prisma/client';
import { LRUCache } from 'lru-cache';

export default class GroupManager {
	cache: LRUCache<string, Group>;

	constructor() {
		this.cache = new LRUCache({
			max: 100,
			ttl: 1000 * 60 * 60,
		});
	}

	async create(data: CreateGroupProps) {
		const group = await client.group.create({
			data: {
				name: data.name,
				maxStorageSize: data.maxStorageSize,
			},
		});
		this.cache.set(group.name, group);
		return group;
	}

	async fetchAll(data: getGroupsInclude = {}) {
		return client.group.findMany({
			include: {
				_count: data.count,
				users: data.users,
			},
		});
	}


	async getByName(data: GroupNameProps) {
		let group = this.cache.get(data.name) ?? null;
		if (group == null)	{
			group = await client.group.findUnique({
				where: {
					name: data.name,
				},
				include: {
					users: data.includeUsers ?? false,
				},
			});
			if (group != null) this.cache.set(group.name, group);
		}
		return group;
	}


	async delete(data: IdParam) {
		return client.group.delete({
			where: {
				id: data.id,
			},
		});
	}
}
