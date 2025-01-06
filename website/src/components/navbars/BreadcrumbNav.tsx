import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import Link from 'next/link';
import { BaseSyntheticEvent, ChangeEvent, useState } from 'react';

interface Props {
  path: string
  isFile: boolean
	setviewType: (viewType: 'List' | 'Tiles') => void
	onUpload: (e: ChangeEvent<HTMLInputElement>) => Promise<void>
	fetchFiles: () => Promise<void>
}

export default function BreadcrumbNav({ path, isFile, setviewType, onUpload, fetchFiles }: Props) {
	const splitPath = path.split('/');
	const [folderName, setFolderName] = useState('');

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
				await fetchFiles();
				closeModal('createFolderModal');
			}
		} catch (error) {
			console.error(error);
		}
	}


	return (
		<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
			<nav aria-label="breadcrumb" style={{ fontSize : '1.2rem' }}>
				<ol className="breadcrumb" style={{ backgroundColor:'white' }}>
					<li className="breadcrumb-item">
						{splitPath[0] == '' ?
							<b style={{ color:'black' }}>Home</b>
							: <b>
								<Link className="directoyLink" href='/files' style={{ color:'grey' }}>Home</Link>
							</b>
						}
					</li>
					{splitPath.length >= 1 ?
						splitPath.map(name => (
							<li className="breadcrumb-item" key={name}>
								{(name !== splitPath.at(-1) ?
									<b>
										<Link className="directoyLink" href={`/files/${splitPath.slice(0, splitPath.indexOf(name) + 1).join('/')}`} style={{ color:'grey' }}>{name}</Link>
									</b>
									: <b className="d-inline-block text-truncate" style={{ color:'black', maxWidth:'100vw' }}>{name}</b>
								)}
							</li>
						)) : <> </>}
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
								File upload<input type="file" hidden name="sampleFile" className="upload-input" onChange={onUpload} multiple />
          		</label>
          		<input type="hidden" value="test" name="path" />
          		<label className="dropdown-item btn" id="fileHover">
								Folder upload<input type="file" hidden name="sampleFile" className="upload-input" ref={input => {
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
		</div>
	);
}