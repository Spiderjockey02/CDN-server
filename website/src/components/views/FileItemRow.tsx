import { getFileIcon, formatBytes } from '@/utils/functions';
import { fileItem } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { MouseEvent }from 'react';
import FileDetail from './FileDetail';

interface Props {
  file: fileItem
	isChecked: boolean
	openContextMenu: (e: MouseEvent<HTMLTableRowElement>, file: fileItem) => void
	handleCheckboxToggle: (e: MouseEvent, file: fileItem) => void
	setShow: (fileId: string) => void
	showMoreDetail?: boolean
}

export default function FileItemRow({ file, isChecked, openContextMenu, handleCheckboxToggle, setShow, showMoreDetail = false }: Props) {
	const router = useRouter();
	const handleRowClick = () => router.push(`/files${file.path}`);

	const handleTextClick = (e: MouseEvent) => {
		e.stopPropagation();
		setShow(file.id);
	};

	return (
		<>
			<tr key={file.name} style={{ cursor: 'pointer' }} onContextMenu={(e) => openContextMenu(e, file)} onClick={handleRowClick}>
				<th className='text-center hide-on-mobile'>
					<input className="form-check-input" type="checkbox" id={encodeURI(file.name)} checked={isChecked} onClick={(e) => handleCheckboxToggle(e, file)} />
				</th>
				<th scope="row" className="text-truncate" style={{ maxWidth: '50vw' }}>
					{showMoreDetail ?
						<FileDetail file={file} /> :
						<Link onClick={handleTextClick} style={{ textDecoration: 'none', color: 'black' }} href="#">{getFileIcon(file)} {file.name}</Link>
					}
				</th>
				<td>{file.type == 'FILE' ? formatBytes(file.size) : `${file._count?.children ?? 0} files`}</td>
				<td className='hide-on-mobile'>{new Date(file.createdAt).toLocaleString('en-GB')}</td>
			</tr>
		</>
	);
}