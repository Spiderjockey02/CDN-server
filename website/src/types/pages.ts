import { User } from '.';

export interface AdminPageProps {
  data: {
    users: {
      total: number
    },
    storage: {
      total: number
      free: number
    }
  }
}

export interface AdminUserPageProps {
  users: Array<User>
}

export interface FilePageProps {
  path: string
}

export interface HomePageProps {
	totalUserCount: number
	storageUsed: number
	totalFileCount: number
}

export interface SearchPageProps {
  query: {
    query: string
    fileType: string
    dateUpdated: string
  }
}

export type viewTypeTypes = 'List' | 'Tiles';