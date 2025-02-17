import { useRef } from 'react';
import { useOnClickOutside } from '@/utils/useOnClickOutisde';
import type { RefObject } from 'react';
import axios from 'axios';
import { fileItem } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faDownload, faEllipsisV, faFileSignature, faFolderOpen, faShareAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import RenameModal from '../Modals/RenameFileModal';
import DeleteFileModal from '../Modals/DeleteFileModal';
import ChangeModal from '../Modals/UpdateLocationModal';
interface Props {
	x: number
	y: number
	selected: fileItem[]
	closeContextMenu: () => void
	showFilePanel: (fileId: string) => void
}

export default function ContextMenu({ x, y, closeContextMenu, selected, showFilePanel }: Props) {
	const contextMenuRef = useRef<HTMLDivElement>(null);

	useOnClickOutside(contextMenuRef as RefObject<HTMLDivElement>, closeContextMenu);
	const handleDownload = async () => {
		try {
			const { data: blob } = await axios.get(`/api/files/download?path=${selected[0].path}`, {
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
				link.download = selected[0].name;
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
		closeContextMenu();
	};

	const handleCopyURL = async () => {
		const url = `${window.location.origin}${window.location.pathname}/${encodeURI(selected[0].name)}`;
		const unsecuredCopyToClipboard = (text: string) => {
			const textArea = document.createElement('textarea');
			textArea.value = text;
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();
			try {
				document.execCommand('copy');
			} catch(err) {
				console.error('Unable to copy to clipboard', err);
			}
			document.body.removeChild(textArea);
		};
		if (window.isSecureContext && navigator.clipboard) {
			navigator.clipboard.writeText(url);
		} else {
			unsecuredCopyToClipboard(url);
		}
		closeContextMenu();
	};

	const handleBulkDownload = async () => {
		const paths = selected.map((file) => file.path);
		const { data: blob } = await axios.post('/api/files/bulk-download', { paths }, {
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
			link.download = `files-${new Date()}.zip`;
			document.body.appendChild(link);
			link.click();
			link.remove();

			// Clean up the URL object
			window.URL.revokeObjectURL(url);
		} else {
			throw new Error('Download failed: Empty file');
		}
		closeContextMenu();
	};

	const handleBulkDelete = async () => {
		const paths = selected.map((file) => file.path);

		try {
			await axios.delete('/api/files/bulk-delete', { data: { paths } });
		} catch (error) {
			console.log(error);
		}
		closeContextMenu();
	};

	// Check if they have multi-selected or not
	if (selected.length === 1) {
		return (
			<>
				<DeleteFileModal file={selected[0]} closeContextMenu={closeContextMenu} />
				<ChangeModal file={selected[0]} closeContextMenu={closeContextMenu} />
				<RenameModal file={selected[0]} closeContextMenu={closeContextMenu} />
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
					<button type="button" className="btn btn-ctx-menu" data-bs-toggle="modal" data-bs-target={`#delete_${selected[0].id}`}>
						<FontAwesomeIcon icon={faTrash} /> Delete
					</button>
					<button className="btn btn-ctx-menu" data-bs-toggle="modal" data-bs-target={`#change_${selected[0].id}`}>
						<FontAwesomeIcon icon={faFolderOpen} /> Move / Copy to
					</button>
					<button className="btn btn-ctx-menu" type="button" data-bs-toggle="modal" data-bs-target={`#rename_${selected[0].id}`}>
						<FontAwesomeIcon icon={faFileSignature} /> Rename
					</button>
					<button className="btn btn-ctx-menu" onClick={() => showFilePanel(selected[0].id)}>
						<FontAwesomeIcon icon={faEllipsisV} /> Properties
					</button>
				</div>

				<RenameModal file={selected[0]} closeContextMenu={closeContextMenu} />
			</>
		);
	} else {
		return (
			<div className="ctxmenu" ref={contextMenuRef} style={{ top: `${y}px`, left: `${x}px`, zIndex: 20, position: 'absolute' }}>
				<button className="btn btn-ctx-menu" onClick={handleBulkDownload}>
					<FontAwesomeIcon icon={faDownload} /> Download
				</button>
				<button className="btn btn-ctx-menu" onClick={handleBulkDelete}>
					<FontAwesomeIcon icon={faTrash} /> Delete
				</button>
			</div>
		);
	}
}