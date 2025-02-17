import { CSSProperties, ReactNode } from 'react';

interface Props {
  children: ReactNode
  id?: string
  className?: string
  style?: CSSProperties
	onClick?: () => void
}

function Table({ children, id, className, style }: Props) {
	return (
		<table className={`table ${className ?? ''}`} id={id} style={style}>
			{children}
		</table>
	);
}

function HeaderRow({ children }: Props) {
	return (
		<thead>
			<tr>
				{children}
			</tr>
		</thead>
	);
}

function Header({ children, id, className, style, onClick }: Props) {
	return (
		<th id={id} className={className} style={style} onClick={onClick}>
			{children}
		</th>
	);
}

function Body({ children, id, className, style }: Props) {
	return (
		<tbody id={id} className={className} style={style}>
			{children}
		</tbody>
	);
}

Table.Header = Header;
Table.HeaderRow = HeaderRow;
Table.Body = Body;

export default Table;