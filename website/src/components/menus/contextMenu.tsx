import { useRef, useState } from 'react';
import { useOnClickOutside } from '@/utils/useOnClickOutisde';
import type { BaseSyntheticEvent, RefObject } from 'react';
import Modal from '../UI/Modal';
import axios from 'axios';
import { fileItem } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faDownload, faEllipsisV, faFileSignature, faShareAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import RenameModal from '../Modals/renameFile';
interface Props {
	x: number
	y: number
	selected: fileItem
	closeContextMenu: () => void
}

export default function ContextMenu({ x, y, closeContextMenu, selected }: Props) {
	const contextMenuRef = useRef<HTMLDivElement>(null);

	useOnClickOutside(contextMenuRef as RefObject<HTMLDivElement>, closeContextMenu);
	function closeModal(id: string) {
		document.getElementById(id)?.classList.remove('show');
		document.getElementById(id)?.setAttribute('aria-hidden', 'true');
		document.getElementById(id)?.setAttribute('style', 'display: none');
		document.body.removeChild(document.getElementsByClassName('modal-backdrop')[0] as Node);
		closeContextMenu();
	}

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
				<button className="btn btn-ctx-menu" data-bs-toggle="modal" data-bs-target={`#change_${selected.id}`}>
					<FontAwesomeIcon icon={faCopy} /> Move / Copy to
				</button>
				<button className="btn btn-ctx-menu" type="button" data-bs-toggle="modal" data-bs-target={`#rename_${selected.id}`}>
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

			<RenameModal file={selected} closeContextMenu={closeContextMenu} />
		</>
	);
}
