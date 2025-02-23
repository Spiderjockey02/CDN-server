import { TableProps } from '@/types/Components/UI';

function Table({ children, id, className, style }: TableProps) {
	return (
		<table className={`table ${className ?? ''}`} id={id} style={style}>
			{children}
		</table>
	);
}

function HeaderRow({ children }: TableProps) {
	return (
		<thead>
			<tr>
				{children}
			</tr>
		</thead>
	);
}

function Header({ children, id, className, style, onClick }: TableProps) {
	return (
		<th id={id} className={className} style={style} onClick={onClick}>
			{children}
		</th>
	);
}

function Body({ children, id, className, style }: TableProps) {
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