export interface Notification {
  id: string
  text: string
  createdAt: Date
}

export interface RecentFiles {
  id: string
  location: string
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
  recentFiles: RecentFiles[]
  group: {
    id: string
    name: string
    maxStorageSize: number
  }
  Notifications: Notification[]
  totalStorageSize: number
}


export type fileType = 'file' | 'directory'
export type fileItem = {
  path: string
  name: string
  size: number
  extension: string
  type: fileType
  modified: number
  children: fileItem[]
  url: string
}