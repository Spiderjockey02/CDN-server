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

// Find a user by email (for login)


export interface createUser {
	email: string
	name: string
	password: string
}
// Create a user

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
  }
}>
