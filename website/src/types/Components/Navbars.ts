import { RecentlyViewed, User } from '..';

export type viewTypeTypes = 'List' | 'Tiles';

export interface BreadcrumbNavProps {
  path: string
  isFile: boolean
	setviewType: (viewType: 'List' | 'Tiles') => void
	viewType: viewTypeTypes
}

export interface FileNavBarProps {
  user: User
}

export interface RecentNavbarProps {
  files: RecentlyViewed[];
}