import { getFileIcon, formatBytes } from '@/utils/functions';
import { fileItem } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { MouseEvent }from 'react';

interface Props {
  file: fileItem
	isChecked: boolean
	openContextMenu: (e: MouseEvent<HTMLTableRowElement>, file: fileItem) => void
	handleCheckboxToggle: (e: MouseEvent, file: fileItem) => void
	setShow: (fileId: string) => void
}

export default function FileItemRow({ file, isChecked, openContextMenu, handleCheckboxToggle, setShow }: Props) {
	const router = useRouter();
	const handleRowClick = () => router.push(`/files${file.path}`);

	const handleTextClick = (e: MouseEvent) => {
		e.stopPropagation();
		setShow(file.id);
	};

	return (
		<>
			<tr key={file.name} style={{ cursor: 'pointer' }} onContextMenu={(e) => openContextMenu(e, file)} onClick={handleRowClick}>
				<th className="dot" style={{ textAlign:'center' }} >
					<div className="form-check form-check-inline hide">
						<input className="form-check-input" type="checkbox" id={encodeURI(file.name)} checked={isChecked} onClick={(e) => handleCheckboxToggle(e, file)} />
					</div>
				</th>
				<th id="Type" scope="col" style={{ textAlign:'center' }}>{getFileIcon(file)}</th>
				<th scope="row" className="text-truncate" style={{ maxWidth: 'calc( 70 * 1vw )' }}>
					<Link onClick={handleTextClick} style={{ textDecoration: 'none', color: 'black' }} href="#">{file.name}</Link>
				</th>
				<td>{file.type == 'FILE' ? formatBytes(file.size) : `${file._count?.children ?? 0} files`}</td>
				<td>{new Date(file.createdAt).toLocaleString('en-US')}</td>
			</tr>
		</>
	);
}