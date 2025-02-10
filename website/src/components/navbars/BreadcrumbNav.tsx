import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios, { AxiosRequestConfig } from 'axios';
import Link from 'next/link';
import { BaseSyntheticEvent, ChangeEvent, useState } from 'react';
import UploadStatusToast from '../menus/UploadStatusToast';
import { useFileDispatch } from '../fileManager';

interface Props {
  path: string
  isFile: boolean
	setviewType: (viewType: 'List' | 'Tiles') => void
}

export default function BreadcrumbNav({ path, isFile, setviewType }: Props) {
	const splitPath = path.split('/');
	const [folderName, setFolderName] = useState('');
	const [progress, setProgress] = useState(0);
	const [timeRemaining, setRemaining] = useState('');
	const [filename, setFilename] = useState('');
	const [abortController] = useState(new AbortController());
	const dispatch = useFileDispatch();

	function closeModal(id: string) {
		document.getElementById(id)?.classList.remove('show');
		document.getElementById(id)?.setAttribute('aria-hidden', 'true');
		document.getElementById(id)?.setAttribute('style', 'display: none');
		document.body.removeChild(document.getElementsByClassName('modal-backdrop')[0] as Node);
	}

	async function handleFolderSubmit(event: BaseSyntheticEvent) {
		event.preventDefault();
		try {
			const { data } = await axios.post('/api/files/create-folder', {
				folderName: folderName,
			});
			if (data.success) {
				const { data: { file } } = await axios.get(`/api/files/${path}`);
				dispatch({ type: 'SET_FILE', payload: file });
				closeModal('createFolderModal');
			}
		} catch (error) {
			console.error(error);
		}
	}

	const onFileUploadChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const fileInput = e.target;
		if (!fileInput.files || fileInput.files.length === 0) {
			return alert('Files list is empty');
		}

		const files = Array.from(fileInput.files);
		const totalSize = files.reduce((acc, file) => acc + file.size, 0);
		let uploadedBytes = 0;
		const startAt = Date.now();

		try {
			for (const file of files) {
				setFilename(file.name);

				const formData = new FormData();
				formData.append('media', file);
				let previousLoaded = 0;

				const options: AxiosRequestConfig = {
					headers: { 'Content-Type': 'multipart/form-data' },
					onUploadProgress: ({ loaded }) => {
						// Calculate incremental progress for the current file
						const incrementalBytes = loaded - previousLoaded;
						previousLoaded = loaded;
						uploadedBytes += incrementalBytes;

						// Update the cumulative progress percentage
						const percentage = (uploadedBytes * 100) / totalSize;
						setProgress(+percentage.toFixed(2));

						const timeElapsed = (Date.now() - startAt) / 1000;
						if (timeElapsed > 0) {
							const uploadSpeed = uploadedBytes / timeElapsed;
							const remainingTime = (totalSize - uploadedBytes) / uploadSpeed;

							const hours = Math.floor(remainingTime / 3600);
							const minutes = Math.floor((remainingTime % 3600) / 60);
							const seconds = Math.floor(remainingTime % 60);

							let timeString = '';
							if (hours > 0) timeString += `${hours}h `;
							timeString += `${minutes}m ${seconds}s`;

							setRemaining(timeString.trim());
						} else {
							setRemaining('Calculating...');
						}
					},
				};
				await axios.post('/api/files/upload', formData, options);
			}
		} catch (error) {
			console.error(error);
			if (axios.isAxiosError(error)) {
				if (error.code === 'ERR_CANCELED') alert('Sorry! Something went wrong.');
			}
		} finally {
			const { data: { file: uploadedFile } } = await axios.get(`/api/files/${path}`);
			dispatch({ type: 'SET_FILE', payload: uploadedFile });
			setProgress(0);
			setRemaining('');
		}
	};

	const cancelUpload = () => {
		abortController.abort();
	};

	return (
		<div className="d-flex flex-row justify-content-between">
			<nav aria-label="breadcrumb" className="align-self-center" style={{ fontSize: '1.2rem', margin: 0 }}>
				<ol className="breadcrumb d-flex align-items-center" style={{ backgroundColor: 'white', margin: 0, padding: 0 }}>
					<li className="breadcrumb-item d-flex align-items-center">
						{splitPath[0] == '' ?
							<b style={{ color: 'black' }}>Home</b>
						 :
							<b>
								<Link className="directoyLink" href="/files" style={{ color: 'grey' }}>Home</Link>
							</b>
						}
					</li>
					{splitPath.length >= 1 ? (
						splitPath.map(name => (
							<li className="breadcrumb-item d-flex align-items-center" key={name}>
								{name !== splitPath.at(-1) ?
									<b>
										<Link
											className="directoyLink"
											href={`/files/${splitPath.slice(0, splitPath.indexOf(name) + 1).join('/')}`}
											style={{ color: 'grey' }}
										>
											{name}
										</Link>
									</b>
								 :
									<b className="d-inline-block text-truncate" style={{ color: 'black', maxWidth: '100vw' }}>
										{name}
									</b>
								}
							</li>
						))
					) : null}
				</ol>
			</nav>
			<div className="btn-group" role="group">
				{!isFile &&
          <>
          	<button type="button" className="btn btn-outline-secondary" style={{ display: 'inline-flex', alignContent: 'stretch', justifyContent: 'space-around', alignItems: 'center' }} data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-offset="0,10">
          		<FontAwesomeIcon icon={faPlus} /> New
          	</button>
          	<div className="dropdown-menu dropdown-menu-right">
          		<label className="dropdown-item btn" id="fileHover">
								File upload<input type="file" hidden name="sampleFile" className="upload-input" onChange={onFileUploadChange} multiple />
          		</label>
          		<input type="hidden" value="test" name="path" />
          		<label className="dropdown-item btn" id="fileHover">
								Folder upload<input type="file" hidden name="sampleFile" className="upload-input" onChange={onFileUploadChange} ref={input => {
          				if (input) {
          					input.setAttribute('webkitdirectory', '');
          					input.setAttribute('mozdirectory', '');
          				}
          			}} />
          		</label>
          		<div className="dropdown-divider"></div>
          		<a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#createFolderModal">Create folder</a>
          		<button type="submit" style={{ display:'none' }} id="imagefile"></button>
          	</div>
          	<button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
    					Change view
          	</button>
          	<ul className="dropdown-menu">
          		<li><a onClick={() => setviewType('Tiles')} className="dropdown-item" href="#">Tiles</a></li>
          		<li><a onClick={() => setviewType('List')} className="dropdown-item" href="#">List</a></li>
          	</ul>
          </>
				}
			</div>
			<div className="modal fade" id="createFolderModal" role="dialog" aria-hidden="true">
		    <div className="modal-dialog modal-dialog-centered" role="document">
		      <div className="modal-content">
		        <div className="modal-header">
		          <h5 className="modal-title" id="exampleModalLongTitle">Create a new folder</h5>
							<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
		        </div>
		        <form onSubmit={handleFolderSubmit} method="post">
							<div className="modal-body">
								<div className="mb-3">
									<label htmlFor="exampleInputPassword1" className="form-label">Folder name:</label>
									<input type="text" className="form-control" id="exampleInputPassword1" name="folderName" onChange={(e) => setFolderName(e.target.value)} />
								</div>
							</div>
							<div className="modal-footer">
		            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
		            <button type="submit" className="btn btn-success">Create</button>
		          </div>
		        </form>
		    	</div>
		  	</div>
			</div>
			<UploadStatusToast percentage={progress} filename={filename} show={progress > 0} timeRemaining={timeRemaining} cancelUpload={cancelUpload} />
		</div>
	);
}