import { fileItem } from '@/types';
import { useOnClickOutside } from '@/utils/useOnClickOutisde';
import { faRotateLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { useRef, RefObject } from 'react';

interface Props {
  x: number
  y: number
  selected: fileItem[]
  closeContextMenu: () => void
}

export default function TrashContextMenu({ x, y, closeContextMenu, selected }: Props) {
	const contextMenuRef = useRef<HTMLDivElement>(null);
	useOnClickOutside(contextMenuRef as RefObject<HTMLDivElement>, closeContextMenu);

	const handleEmptyBin = async () => {
		try {
			await axios.delete('/api/trash/empty');
		} catch (err) {
			console.error('Error emptying bin:', err);
		}
	};

	const handleRestore = async () => {
		try {
			await axios.put('/api/trash/restore', { paths: selected.map(s => s.path) });
		} catch (err) {
			console.error('Error restoring files:', err);
		}
	};

	return (
		<div className="ctxmenu" ref={contextMenuRef} style={{ top: `${y}px`, left: `${x}px`, zIndex: 20, position: 'absolute' }}>
			<button className="btn btn-ctx-menu" onClick={handleEmptyBin}>
				<FontAwesomeIcon icon={faTrash} /> Empty Bin
			</button>
			<button className="btn btn-ctx-menu" onClick={handleRestore}>
				<FontAwesomeIcon icon={faRotateLeft} /> Restore
			</button>
		</div>
	);
}