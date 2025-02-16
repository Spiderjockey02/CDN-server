import styles from '@/styles/Grid.module.scss';
import type { ColPrefix, ColProps, ColumnProps, GridLayoutProps } from '@/types/Components/Layout';

/**
	* Create a row element
	* @param {GridLayoutProps} GridLayoutProps row properties
*/
export function Row({ children, className, style }: GridLayoutProps) {
	return (
		<div className={`${styles.row} ${className ?? ''}`} style={style}>
			{children}
		</div>
	);
}

/**
	* Create a column element
	* @param {ColumnProps} ColumnProps column properties
*/
export function Col({ children, className, style, xs, sm, md, lg, xl, xxl }: ColumnProps) {
	const columns = columnCreator({ xs, sm, md, lg, xl, xxl });
	return (
		<div className={`${className ?? ''} ${columns.map(c => styles[c]).join(' ')}`} style={style}>
			{children}
		</div>
	);
}

/**
	* Calculates appropriate columns based on input
	* @param {ColProps} data
*/
function columnCreator(data: ColProps & { [key: string]: number | undefined }) {
	const columns: string[] = [];

	const validateAndAddColumn = (size: number | undefined, prefix: ColPrefix) => {
		if (size !== undefined && (size >= 0 || size <= 12)) columns.push(`col-${prefix}-${size}`);
	};

	const values = Object.keys(data);
	values.forEach(key => validateAndAddColumn(data[key], key as ColPrefix));

	return columns;
}