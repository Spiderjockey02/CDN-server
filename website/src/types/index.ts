export interface Notification {
  id: string
  text: string
  createdAt: Date
}

export interface RecentlyViewed {
  id: string
  userId: string
  fileId: string
  viewedAt: Date
  file: fileItem
}


export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
  group: {
    id: string
    name: string
    maxStorageSize: number
  }
  notifications: Notification[]
  recentlyViewed: RecentlyViewed[]
  totalStorageSize: number
}


export type fileType = 'FILE' | 'DIRECTORY'
export type fileItem = {
  path: string
  name: string
  children: fileItem[]
  modified: number
  size: number
  extension: string
  type: fileType
  _count?: {
    children: number
  }
}