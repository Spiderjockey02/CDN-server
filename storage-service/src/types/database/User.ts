import { Prisma } from '@prisma/client';

export interface GetUsers {
	group?: boolean
	recent?: boolean
	delete?: boolean
	analyse?: boolean
}

export type fetchUserbyParam = {
	email?: string
	id?: string
}

export interface createUser {
	email: string
	name: string
	password: string
}

export interface updateUser {
	id: string
	password?: string
	email?: string
	totalStorageSize?: bigint
}

export interface UserToGroupProps {
	userId: string
	groupId: string
}

export type UserWithGroup = Prisma.UserGetPayload<{
  include: {
    group: true
		notifications: true
  }
}>
