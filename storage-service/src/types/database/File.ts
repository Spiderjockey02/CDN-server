import { FileType } from '@prisma/client';

export interface createFile {
  path: string
  name: string
  size: bigint
  parentId?: string
  userId: string
  type?: FileType
}

export interface updateFile {
  id: string
  path?: string
  name?: string
  size?: bigint
  deletedAt?: Date
  parentId?: string
  children?: createFile
}