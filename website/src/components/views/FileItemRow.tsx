import { getFileIcon, formatBytes } from '@/utils/functions';
import { fileItem } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, type MouseEvent } from 'react';
import path from 'path';
import Image from 'next/image';

interface Props {
  file: fileItem
  dir: string
	userId: string
	isChecked: boolean
	openContextMenu: (e: MouseEvent<HTMLTableRowElement>, file: fileItem) => void
	handleCheckboxToggle: (e: MouseEvent, fileName: string) => void
}

export default function FileItemRow({ dir, userId, file, isChecked, openContextMenu, handleCheckboxToggle }: Props) {
	const [show, setShow] = useState(false);
	const router = useRouter();
	const handleRowClick = () => router.push(path.join('/files', dir, file.name));

	const handleTextClick = (e: MouseEvent) => {
		e.stopPropagation();
		setShow(true);
	};

	const imageLoader = () => path.join('/thumbnail', userId, dir, encodeURI(file.name));
	return (
		<>
			<tr key={file.name} style={{ cursor: 'pointer' }} onContextMenu={(e) => openContextMenu(e, file)} onClick={handleRowClick}>
				<th className="dot" style={{ textAlign:'center' }} onClick={(e) => handleCheckboxToggle(e, file.name)}>
					<div className="form-check form-check-inline hide">
						<input className="form-check-input" type="checkbox" name="exampleRadios" id={encodeURI(file.name)} checked={isChecked} />
					</div>
				</th>
				<th id="Type" scope="col" style={{ textAlign:'center' }} dangerouslySetInnerHTML={{ __html: getFileIcon(file) }}></th>
				<th scope="row" className="text-truncate" style={{ maxWidth: 'calc( 70 * 1vw )' }}>
					<Link onClick={handleTextClick} style={{ textDecoration: 'none', color: 'black' }} href="#">{file.name}</Link>
				</th>
				<td>{file.type == 'file' ? formatBytes(file.size) : file.children?.length ?? 0} file{file.children?.length !== 1 ? 's' : ''}</td>
				<td>{new Date(file.modified).toLocaleString('en-US')}</td>
			</tr>
			<div className={`offcanvas offcanvas-end ${show ? 'show' : ''}`} id="offcanvasExample" aria-labelledby="offcanvasExampleLabel" style={{ maxWidth: '75%' }}>
				<div className="offcanvas-header">
					<h5 className="offcanvas-title" id="offcanvasExampleLabel">File preview</h5>
					<button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close" onClick={() => setShow(false)}></button>
				</div>
				<div className="offcanvas-body">
					<Image src={file.name} alt={file.name} style={{ maxWidth: '100%' }} width={300} height={600} loader={imageLoader} loading='lazy' />
					<br />
					{file.name}
					<br />
					{new Date(file.modified).toLocaleString('en-US')}
					<br />
					{file.type == 'file' ? formatBytes(file.size) : file.children?.length ?? 0} file{file.children?.length !== 1 ? 's' : ''}
				</div>
			</div>
		</>
	);
}