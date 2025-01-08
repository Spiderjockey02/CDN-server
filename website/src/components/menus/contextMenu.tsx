import { useRef, useState } from 'react';
import { useOnClickOutside } from '@/utils/useOnClickOutisde';
import type { BaseSyntheticEvent, RefObject } from 'react';
import Modal from '../UI/Modal';
import axios from 'axios';
import { fileItem } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faDownload, faEllipsisV, faFileSignature, faShareAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
interface Props {
	x: number
	y: number
	selected: fileItem
	closeContextMenu: () => void
}

export default function ContextMenu({ x, y, closeContextMenu, selected }: Props) {
	const contextMenuRef = useRef<HTMLDivElement>(null);
	const [rename, setRename] = useState(selected.name);
	const [dirs, setDirs] = useState<fileItem[]>([]);
	const [action, setAction] = useState<'copy' | 'move' | ''>('');
	const [selectedDestination, setSelectedDestination] = useState('');

	useOnClickOutside(contextMenuRef as RefObject<HTMLDivElement>, closeContextMenu);
	function closeModal(id: string) {
		document.getElementById(id)?.classList.remove('show');
		document.getElementById(id)?.setAttribute('aria-hidden', 'true');
		document.getElementById(id)?.setAttribute('style', 'display: none');
		document.body.removeChild(document.getElementsByClassName('modal-backdrop')[0] as Node);
		closeContextMenu();
	}

	const handleRenameSubmit = async (e: BaseSyntheticEvent) => {
		const oldName = selected.name;
		e.preventDefault();

		try {
			await axios.post('/api/files/rename', { oldName, newName: selected.type == 'FILE' ? `${rename}${selected.extension}` : rename });
		} catch (err) {
			console.log(err);
		}

		closeModal('renameModel');
	};

	const handleDeleteSubmit = async (e: BaseSyntheticEvent) => {
		e.preventDefault();

		try {
			await axios.delete('/api/files/delete', {
				data: { fileName: selected.name },
			});
		} catch (err) {
			console.log(err);
		}
		closeModal('deleteModel');
	};

	const handleDownload = async () => {
		try {
			const { data: blob } = await axios.get(`/api/files/download?path=${selected.name}`, {
				headers: {
					'Accept': 'application/zip',
				},
				responseType: 'blob',
			});

			if (blob.size > 0) {
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;

				// Specify the file name for the downloaded file
				link.download = selected.name;
				document.body.appendChild(link);
				link.click();
				link.remove();

				// Clean up the URL object
				window.URL.revokeObjectURL(url);
			} else {
				throw new Error('Download failed: Empty file');
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleCopyURL = async () => {
		const url = `${window.location.origin}${window.location.pathname}/${encodeURI(selected.name)}`;
		const unsecuredCopyToClipboard = (text: string) => { const textArea = document.createElement('textarea'); textArea.value = text; document.body.appendChild(textArea); textArea.focus();textArea.select(); try{document.execCommand('copy');}catch(err) {console.error('Unable to copy to clipboard', err);}document.body.removeChild(textArea);};
		if (window.isSecureContext && navigator.clipboard) {
			navigator.clipboard.writeText(url);
		} else {
			unsecuredCopyToClipboard(url);
		}
	};

	const handleActionSubmit = async (e: BaseSyntheticEvent) => {
		e.preventDefault();

		try {
			await axios.post(`/api/files/${action}`, {
				newPath: selectedDestination,
				fileName: selected.name,
			});
		} catch (error) {

		}

		closeModal('changeModel');
	};

	const loadDirectories = async () => {
		const { data } = await axios.get('/api/files/directories');
		setDirs(data.dirs);
	};

	return (
		<>
			<div className="ctxmenu" ref={contextMenuRef} style={{ top: `${y}px`, left: `${x}px`, zIndex: 20, position: 'absolute' }}>
				<button className="btn btn-ctx-menu">
					<FontAwesomeIcon icon={faShareAlt} /> Share
				</button>
				<button className="btn btn-ctx-menu" onClick={handleCopyURL}>
					<FontAwesomeIcon icon={faCopy} /> Copy link
				</button>
				<button className="btn btn-ctx-menu" onClick={handleDownload}>
					<FontAwesomeIcon icon={faDownload} /> Download
				</button>
				<button type="button" className="btn btn-ctx-menu" data-bs-toggle="modal" data-bs-target="#deleteModel">
					<FontAwesomeIcon icon={faTrash} /> Delete
				</button>
				<button className="btn btn-ctx-menu" data-bs-toggle="modal" data-bs-target="#changeModel" onClick={loadDirectories}>
					<FontAwesomeIcon icon={faCopy} /> Move / Copy to
				</button>
				<button className="btn btn-ctx-menu" type="button" data-bs-toggle="modal" data-bs-target="#renameModel">
					<FontAwesomeIcon icon={faFileSignature} /> Rename
				</button>
				<button className="btn btn-ctx-menu">
					<FontAwesomeIcon icon={faEllipsisV} /> Properties
				</button>
			</div>

			<Modal
				id="deleteModel"
				title={`Delete ${selected.name}?`}
				description="Are you sure you want to send this item to the recycle bin?" onSubmit={handleDeleteSubmit}
			/>

			<div className="modal fade" id="renameModel" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
		    <div className="modal-dialog modal-dialog-centered" role="document">
		      <div className="modal-content">
		        <div className="modal-header">
		          <h5 className="modal-title" id="exampleModalLongTitle">Rename {selected.name}</h5>
		          <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
		        </div>
		        <form onSubmit={handleRenameSubmit} method="post">
							<div className="modal-body">
								<input type="hidden" id="oldPath" name="oldPath" value={selected.name} />
								<div className="input-group mb-3">
		              <input className="form-control" id="renameInput" type="text" name="newPath" defaultValue={selected.name.replace(`.${selected.name.split('.').at(-1)}`, '')} onChange={(e) => setRename(e.target.value)} />
		              {selected.type == 'FILE' && <span className="input-group-text" id="renameSuffix">{selected.name.split('.').at(-1)}</span>}
		            </div>
							</div>
							<div className="modal-footer">
		            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
		            <button type="submit" className="btn btn-primary">Save</button>
		          </div>
		        </form>
		    	</div>
		  	</div>
			</div>

			<div className="modal fade" id="changeModel" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
				<div className="modal-dialog modal-dialog-centered" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="exampleModalLongTitle">Move or Copy {selected.name}</h5>
							<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<form method='post' onSubmit={handleActionSubmit}>
							<div className="modal-body w-100">
								<p>Select a destination folder.</p>
								{dirs.map(dir => (
									<div className="form-check" key={dir.id}>
										<input className="form-check-input" type="radio" name='destination' id={dir.id} defaultChecked={selectedDestination === dir.path}
											onChange={() => setSelectedDestination(dir.name)} />
										<label className="form-check-label" htmlFor={dir.id}>
											{dir.path}
										</label>
									</div>
								))}
								<input type="hidden" value={action} name="action" />
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
								<button type="submit" className="btn btn-primary" onClick={() => setAction('move')}>Move</button>
								<button type="submit" className="btn btn-primary" onClick={() => setAction('copy')}>Copy</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</>
	);
}
