import FileLayout from '@/layouts/file';
import { fileItem } from '@/types';
import { faRotateLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function Recent() {
	const { data: session, status } = useSession({ required: true });
	const [files, setFiles] = useState<fileItem[]>([]);
	const [selected, setSelected] = useState<string[]>([]);

	async function fetchFiles() {
		try {
			const { data } = await axios.get('/api/trash');
			setFiles(data.files);
		} catch (err) {
			console.log(err);
		}
	}

	const handleEmptyBin = async () => {
		try {
			await axios.delete('/api/trash/empty');
		} catch (err) {
			console.log(err);
		}
	};

	const handleRestore = async () => {
		try {
			await axios.put('/api/trash/restore', {
				paths: selected,
			});
			await fetchFiles();
		} catch (err) {
			console.log(err);
		}
	};

	const handleSelectAllToggle = () => setSelected(files.map(f => f.path));

	function handleCheckboxToggle(file: fileItem) {
		setSelected((prevSelected) =>
			prevSelected.find((f) => f === file.path)
				? prevSelected.filter((f) => f !== file.path)
				: [...prevSelected, file.path],
		);
	}

	useEffect(() => {
		fetchFiles();
	}, []);

	if (status == 'loading') return null;
	return (
		<FileLayout user={session.user}>
			<div className="row">
				<div className="col-md-10">
					<nav style={{ fontSize:'18.72px' }} aria-label="breadcrumb">
						<ol className="breadcrumb" style={{ backgroundColor:'white' }}>
							<li className="breadcrumb-item">
								<b style={{ color:'black' }}>Trash</b>
							</li>
						</ol>
					</nav>
				</div>
				<div className="col-md-2">
				</div>
			</div>
			<div>
				<button className='btn btn-outline-secondary' onClick={handleEmptyBin}>
					<FontAwesomeIcon icon={faTrash} /> Empty Bin
				</button>
				&nbsp;
				<button className='btn btn-outline-secondary' onClick={handleRestore}>
					<FontAwesomeIcon icon={faRotateLeft} /> Restore
				</button>
			</div>
			<table className="table" id="myTable">
				<thead>
					<tr>
						<th scope="col" className="th-header dot" style={{ width:'5%', textAlign:'center', borderTopLeftRadius: '5px' }}>
							<div className="form-check form-check-inline hide">
								<input className="form-check-input" type="checkbox" name="exampleRadios" id="All" onChange={handleSelectAllToggle} />
							</div>
						</th>
						<th id="Name" className="th-header" scope="col">
            	Name
						</th>
						<th id="Date modified" className="th-header" style={{ borderTopRightRadius: '5px' }} scope="col">
              Accessed on
						</th>
					</tr>
				</thead>
				<tbody>
					{files.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()).map(file => (
						<tr key={file.id}>
							<th className="dot" style={{ textAlign:'center' }} >
								<div className="form-check form-check-inline hide">
									<input className="form-check-input" type="checkbox" id={encodeURI(file.name)} checked={selected.includes(file.path)} onClick={() => handleCheckboxToggle(file)} />
								</div>
							</th>
							<th scope="row" className="text-truncate" style={{ maxWidth: 'calc( 70 * 1vw )' }}>
								{file.path}
							</th>
							<td>{new Date(file.deletedAt).toLocaleString('en-US')}</td>
						</tr>
					))}
				</tbody>
			</table>
		</FileLayout>
	);
}
