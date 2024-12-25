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