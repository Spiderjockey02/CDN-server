import { Prisma } from '@prisma/client';

export interface getGroupsInclude {
	count?: boolean
	users?: boolean
}

export interface GroupNameProps {
	name: string
	includeUsers?: boolean
}

export interface CreateGroupProps {
	name: string
	maxStorageSize?: number
}

export type FullGroup = Prisma.GroupGetPayload<{
	include: {
		_count: boolean
	}
}>