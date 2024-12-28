import { useRef, useState } from 'react';
import { useOnClickOutside } from '../../utils/useOnClickOutisde';
import type { BaseSyntheticEvent } from 'react';
import Modal from '../UI/Modal';
import axios from 'axios';
import { fileItem } from '@/utils/types';
interface Props {
	x: number
	y: number
	selected: fileItem
	closeContextMenu: () => void
}

export default function ContextMenu({ x, y, closeContextMenu, selected }: Props) {
	const contextMenuRef = useRef<HTMLDivElement>(null);
	const [rename, setRename] = useState(selected.name);

	useOnClickOutside(contextMenuRef, closeContextMenu);
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
			await axios.post('/api/files/rename', { oldName, newName: selected.type == 'file' ? `${rename}${selected.extension}` : rename });
		} catch (err) {
			console.log(err);
		}

		closeModal('renameModel');
	};

	const handleDeleteSubmit = async (e: BaseSyntheticEvent) => {
		e.preventDefault();

		try {
			await axios.delete('/api/files/delete', {
				data: { fileName: selected },
			});
		} catch (err) {
			console.log(err);
		}
		closeModal('deleteModel');
	};

	return (
		<>
			<div className="ctxmenu" ref={contextMenuRef} style={{ top: `${y}px`, left: `${x}px`, zIndex: 20, position: 'absolute' }}>
				<button className="btn btn-ctx-menu">
					<i className="fas fa-share-alt"></i> Share
				</button>
				<button className="btn btn-ctx-menu" data-toggle="modal" data-target="#copyURLModel">
					<i className="fas fa-copy"></i> Copy link
				</button>
				<button className="btn btn-ctx-menu">
					<i className="fas fa-download"></i> Download
				</button>
				<button type="button" className="btn btn-ctx-menu" data-bs-toggle="modal" data-bs-target="#deleteModel">
			  	<i className="fas fa-trash"></i> Delete
				</button>
				<button className="btn btn-ctx-menu" data-bs-toggle="modal" data-bs-target="#changeModel"><i className="fas fa-copy"></i> Move / Copy to</button>
				<button className="btn btn-ctx-menu" type="button" data-bs-toggle="modal" data-bs-target="#renameModel"><i className="fas fa-file-signature"></i> Rename</button>
				<button className="btn btn-ctx-menu"><i className="fas fa-ellipsis-v"></i> Details</button>
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
		              <input className="form-control" id="renameInput" type="text" name="newPath" defaultValue={selected.name.replace(selected.extension, '')} onChange={(e) => setRename(e.target.value)} />
		              <span className="input-group-text" id="renameSuffix">{selected.extension}</span>
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
						<form action="/files/change" method="post">
							<div className="modal-body w-100">
								<p>Select a destination folder.</p>
								<input className="form-input" type="text" placeholder="Search folders" />
								<div id="folderList"></div>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
								<button type="submit" className="btn btn-primary">Move</button>
								<button type="submit" className="btn btn-primary">Copy</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</>
	);
}
