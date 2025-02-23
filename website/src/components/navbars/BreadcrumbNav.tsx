import { faArrowUpFromBracket, faFolderOpen, faGrip, faPlus, faTableList } from '@fortawesome/free-solid-svg-icons';
import type { BreadcrumbNavProps } from '@/types/Components/Navbars';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useOnClickOutside } from '@/utils/useOnClickOutisde';
import { UploadStatusToast, ErrorPopup, CreateFolderModal } from '@/components';
import axios, { AxiosRequestConfig } from 'axios';
import { useFileDispatch } from '../fileManager';
import Link from 'next/link';

export default function BreadcrumbNav({ path, isFile, setviewType, viewType }: BreadcrumbNavProps) {
	const splitPath = path.split('/');
	const [progress, setProgress] = useState(0);
	const [timeRemaining, setRemaining] = useState('');
	const [filename, setFilename] = useState('');
	const [abortController] = useState(new AbortController());
	const [errorMsg, setErrorMsg] = useState('');
	const dispatch = useFileDispatch();
	const containerRef = useRef<HTMLOListElement>(null);
	const dropdownRef = useRef<HTMLUListElement>(null);
	const [isOverflowing, setIsOverflowing] = useState(false);
	const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

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
					responseType: 'json',
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
			if (axios.isAxiosError(error)) {
				setErrorMsg(error.response?.data.error);
				if (error.code === 'ERR_CANCELED') alert('Sorry! Something went wrong.');
			}
		} finally {
			const { data: { file: uploadedFile } } = await axios.get(`/api/files/${path}`);
			dispatch({ type: 'SET_FILE', payload: uploadedFile });
			setProgress(0);
			setRemaining('');
		}
	};

	const cancelUpload = () => abortController.abort();

	useEffect(() => {
		const checkOverflow = () => {
			if (containerRef.current) {
				console.log(containerRef.current.scrollHeight);
				setIsOverflowing(containerRef.current.scrollHeight > 40);
			}
		};
		checkOverflow();
		window.addEventListener('resize', checkOverflow);
		return () => window.removeEventListener('resize', checkOverflow);
	}, [path]);

	const openDropdown = (event: React.MouseEvent<HTMLButtonElement>) => {
		const rect = event.currentTarget.getBoundingClientRect();
		setDropdownPosition({ top: rect.bottom + 5, left: rect.left });
	};

	useOnClickOutside(dropdownRef as any, () => setDropdownPosition(null));

	return (
		<>
			<div className="d-flex flex-row justify-content-between">
				<nav aria-label="breadcrumb" className="align-self-center" style={{ fontSize: '1.2rem', margin: 0, position: 'relative' }}>
					<ol className="breadcrumb d-flex align-items-center" ref={containerRef} style={{ backgroundColor: 'white', margin: 0, padding: 0, overflow: 'hidden' }}>
						{isOverflowing && splitPath.length > 1 ? (
							<>
								<li className="breadcrumb-item d-flex align-items-center position-relative">
									<button className="btn btn-sm" type="button" onClick={openDropdown}>
                		...
									</button>
								</li>
								<li className="breadcrumb-item d-flex align-items-center">
									<b className="d-inline-block text-truncate" style={{ color: 'black', maxWidth: '100vw' }}>
										{splitPath.at(-1)}
									</b>
								</li>
							</>
						) : (
							<>
								<li className="breadcrumb-item d-flex align-items-center">
									{splitPath[0] === '' ?
										<b style={{ color: 'black' }}>Home</b>
										:
										<b>
											<Link className="directoyLink" href="/files" style={{ color: 'grey' }}>
												Home
											</Link>
										</b>
									}
								</li>
								{splitPath.map((name, index) => (
									<li className="breadcrumb-item d-flex align-items-center" key={index}>
										{index !== splitPath.length - 1 ? (
											<b>
												<Link className="directoyLink" href={`/files/${splitPath.slice(0, index + 1).join('/')}`} style={{ color: 'grey' }}>
													{name}
												</Link>
											</b>
										) : (
											<b className="d-inline-block text-truncate" style={{ color: 'black', maxWidth: '100vw' }}>
												{name}
											</b>
										)}
									</li>
								))}
							</>
						)}
					</ol>

					{dropdownPosition && (
						<ul ref={dropdownRef} className="dropdown-menu show" style={{
							position: 'fixed', zIndex: 9999, top: dropdownPosition.top, left: dropdownPosition.left, display: 'block', minWidth: '150px',
						}} >
							<li>
								<Link className="dropdown-item" href='/files'>
									Home
								</Link>
							</li>
							{splitPath.slice(0, -1).map((name, index) => (
								<li key={index}>
									<Link className="dropdown-item" href={`/files/${splitPath.slice(0, index + 1).join('/')}`} onClick={() => setDropdownPosition(null)}>
										{name}
									</Link>
								</li>
							))}
						</ul>
					)}
				</nav>
				<div className="btn-group" role="group">
					{!isFile &&
          <>
          	<button type="button" className="btn btn-outline-secondary" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          		<FontAwesomeIcon icon={faPlus} /> New
          	</button>
          	<div className="dropdown-menu dropdown-menu-right">
          		<input type="hidden" value="test" name="path" />
          		<label className="dropdown-item btn" id="fileHover">
          			<FontAwesomeIcon icon={faArrowUpFromBracket} /> Upload<input type="file" hidden multiple name="sampleFile" className="upload-input" onChange={onFileUploadChange} ref={input => {
          				if (input) {
          					input.setAttribute('webkitdirectory', '');
          					input.setAttribute('mozdirectory', '');
          				}
          			}} />
          		</label>
          		<div className="dropdown-divider"></div>
          		<a className="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#createFolderModal">
          			<FontAwesomeIcon icon={faFolderOpen} /> Create folder
          		</a>
          	</div>
          	<button className="btn btn-outline-secondary" onClick={() => setviewType(viewType == 'List' ? 'Tiles' : 'List')}>
    					<FontAwesomeIcon icon={viewType == 'List' ? faTableList : faGrip} />
          	</button>
          </>
					}
				</div>
				<CreateFolderModal />
				<UploadStatusToast percentage={progress} filename={filename} show={progress > 0} timeRemaining={timeRemaining} cancelUpload={cancelUpload} />
			</div>
			{errorMsg.length > 0 && <ErrorPopup text={errorMsg} onClose={() => setErrorMsg('')} />}
		</>
	);
}