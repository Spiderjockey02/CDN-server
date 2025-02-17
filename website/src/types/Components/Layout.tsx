import { CSSProperties, ReactNode } from 'react';

export interface GridLayoutProps {
	readonly children?: ReactNode
	readonly className?: string
	readonly style?: CSSProperties
}

export interface ColumnProps extends ColProps, GridLayoutProps {}

export interface ColProps {
	xs?: number
	sm?: number
	md?: number
	lg?: number
	xl?: number
	xxl?: number
}

export type ColPrefix = 'xs' | 'sm' | 'md' | 'lg' | 'xl'| 'xxl'