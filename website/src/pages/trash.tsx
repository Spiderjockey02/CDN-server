import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import FileLayout from '@/layouts/file';
import { fileItem } from '@/types';
import { faRotateLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Table from '@/components/UI/Table';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import FileDetail from '@/components/views/FileDetail';
TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

export default function Trash() {
	const { data: session, status } = useSession({ required: true });
	const [files, setFiles] = useState<fileItem[]>([]);
	const [selected, setSelected] = useState<string[]>([]);

	// Fetch files from API
	const fetchFiles = useCallback(async () => {
		try {
			const { data } = await axios.get('/api/trash');
			setFiles(data.files);
		} catch (err) {
			console.error('Error fetching files:', err);
		}
	}, []);

	// Empty Trash Bin
	const handleEmptyBin = async () => {
		try {
			await axios.delete('/api/trash/empty');
			setFiles([]);
		} catch (err) {
			console.error('Error emptying bin:', err);
		}
	};

	// Restore selected files
	const handleRestore = async () => {
		try {
			await axios.put('/api/trash/restore', { paths: selected });
			setSelected([]);
			await fetchFiles();
		} catch (err) {
			console.error('Error restoring files:', err);
		}
	};

	// Toggle all checkboxes
	const handleSelectAllToggle = () => {
		setSelected(selected.length === files.length ? [] : files.map(f => f.path));
	};

	// Toggle individual checkbox selection
	const handleCheckboxToggle = (filePath: string) => {
		setSelected(prevSelected =>
			prevSelected.includes(filePath)
				? prevSelected.filter(f => f !== filePath)
				: [...prevSelected, filePath],
		);
	};

	useEffect(() => {
		fetchFiles();
	}, [fetchFiles]);

	if (status == 'loading') return null;
	return (
		<FileLayout user={session.user}>
			<div className="d-flex justify-content-between align-items-center mb-3">
				<nav aria-label="breadcrumb">
					<ol className="breadcrumb bg-white mb-0">
						<li className="breadcrumb-item"><b>Trash</b></li>
					</ol>
				</nav>
			</div>
			<div className="mb-3">
				<button className="btn btn-outline-danger me-2" onClick={handleEmptyBin}>
					<FontAwesomeIcon icon={faTrash} /> Empty Bin
				</button>
				<button className="btn btn-outline-secondary" onClick={handleRestore} disabled={selected.length === 0}>
					<FontAwesomeIcon icon={faRotateLeft} /> Restore
				</button>
			</div>
			<Table>
				<Table.HeaderRow>
					<Table.Header className='text-center' style={{ width: '5%' }}>
						<input className="form-check-input"	type="checkbox"	onChange={handleSelectAllToggle} checked={selected.length === files.length && files.length > 0}	aria-label="Select all files" />
					</Table.Header>
					<Table.Header>
						Name
					</Table.Header>
					<Table.Header>
						Deleted on
					</Table.Header>
				</Table.HeaderRow>
				<Table.Body>
					{files.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()).map(file => (
						<tr key={file.id}>
							<td className="text-center">
								<input className="form-check-input" type="checkbox" checked={selected.includes(file.path)} onChange={() => handleCheckboxToggle(file.path)} aria-label={`Select file ${file.path}`} />
							</td>
							<FileDetail file={file} />
							<td>{timeAgo.format(new Date(file.deletedAt))}</td>
						</tr>
					))}
				</Table.Body>
			</Table>
		</FileLayout>
	);
}
