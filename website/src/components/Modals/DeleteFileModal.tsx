import Modal from '@/components/UI/Modal';
import { fileItem } from '@/types';
import axios from 'axios';
import { BaseSyntheticEvent } from 'react';

interface Props {
  file: fileItem
  closeContextMenu?: () => void
}

export default function DeleteFileModal({ file, closeContextMenu }: Props) {
	function closeModal(id: string) {
		document.getElementById(id)?.classList.remove('show');
		document.getElementById(id)?.setAttribute('aria-hidden', 'true');
		document.getElementById(id)?.setAttribute('style', 'display: none');
		document.body.removeChild(document.getElementsByClassName('modal-backdrop')[0] as Node);
		if (closeContextMenu) closeContextMenu();
	}

	const handleDeleteSubmit = async (e: BaseSyntheticEvent) => {
		e.preventDefault();
		try {
			await axios.delete('/api/files/delete', {
				data: { fileName: file.name },
			});
		} catch (err) {
			console.log(err);
		}
		closeModal(`delete_${file.id}`);
	};

	return (
		<Modal
			id={`delete_${file.id}`}
			title={`Delete ${file.name}?`}
			description="Are you sure you want to send this item to the recycle bin?" onSubmit={handleDeleteSubmit}
		/>
	);
}