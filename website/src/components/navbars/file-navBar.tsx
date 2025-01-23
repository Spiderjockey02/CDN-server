import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import type { User } from '@/types';
import axios from 'axios';
import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSlidersH } from '@fortawesome/free-solid-svg-icons';
import NotificationBell from '../UI/Notification';
interface Props {
	user: User
}

interface AutoComplete {
	name: string
	path: string
}

export default function FileNavBar({ user }: Props) {
	const [srchRes, setSrchRes] = useState<Array<AutoComplete>>([]);

	async function autoComplete(e: ChangeEvent<HTMLInputElement>) {
		const search = e.target.value.trim();
		const fileType = document.getElementById('fileTypeSelector') as HTMLSelectElement;
		const dateUpdatedSelector = document.getElementById('dateUpdatedSelector') as HTMLSelectElement;
		if (search) {
			const { data } = await axios.get(`${window.origin}/api/files/search?query=${search}&fileType=${fileType.value}&updatedSince=${dateUpdatedSelector.value}`);
			setSrchRes(data.query);
		} else {
			setSrchRes([]);
		}
	}

	return (
		<nav className="navbar navbar-expand">
			<div className="navbar-collapse w-100 dual-collapse2">
				<ul className="navbar-nav me-auto mb-2 mb-lg-0">
					<li className="nav-item">
						<span className="searchBar">
							<form action="/files/search" method="post">
								<div className="input-group mb-3" style={{ width:'40vw' }}>
									<div className="input-group-prepend">
										<button id="searchIconBtn" type="submit" className="input-group-text" style={{ backgroundColor:'#f4f4f4', border:'none', borderRadius:'8px 0px 0px 8px', height:'40px' }} data-toggle="tooltip" data-placement="bottom" title="Search">
											<FontAwesomeIcon icon={faSearch} />
										</button>
									</div>
									<input onChange={(e) => autoComplete(e)} type="text" id="myInput" className="form-input form-control text-truncate" style={{ border:'none', backgroundColor:'#f4f4f4' }} placeholder="Search files and folders" name="search" autoComplete="off" />
									{srchRes.length >= 1 && (
										<div className="autocomplete-items">
											{srchRes.map((file) => (
												<div key={file.name}>
													<a className='btn' href={`/files${file.path}`}>{file.name}</a>
												</div>
											))}
										</div>
									)}
									<div className="input-group-append" id="filter">
										<div className="dropup-center dropdown">
											<button className="btn btn-outline-secondary dropdown-toggle" style={{ backgroundColor:'#f4f4f4', borderRadius:'0px 8px 8px 0px', border:'none', color:'#505762', height:'40px' }} type="button" data-bs-toggle="dropdown" aria-expanded="false">
												<FontAwesomeIcon icon={faSlidersH} />
											</button>
											<div className="dropdown-menu dropdown-menu-end" style={{ width:'100%', padding:'5px' }} >
												<div className="form-group">
													<label htmlFor="inputGroupSelect01">File type(s)</label>
													<select className="form-select" id="fileTypeSelector" name="fileType">
														<option value="0">Any type</option>
														<option value="1">Files</option>
														<option value="2">Folders</option>
													</select>
												</div>
												<div className="form-group">
													<label htmlFor="inputGroupSelect01">Date updated</label>
													<select className="form-select" id="dateUpdatedSelector" name="dateUpdated">
														<option value="0">Any time</option>
														<option value="1">Past day</option>
														<option value="2">Past week</option>
														<option value="3">Past month</option>
														<option value="4">Past year</option>
													</select>
												</div>
											</div>
										</div>
									</div>
								</div>
							</form>
						</span>
					</li>
				</ul>
				<ul className="navbar-nav ml-auto">
					<NotificationBell notifications={user.notifications} />
					&nbsp;
					<li className="nav-item">
						<a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							<Image src="/avatar" width={25} height={25} className="rounded-circle" alt="User avatar" />{user.name}
						</a>
						<div className="dropdown-menu dropdown-menu-end">
							<Link className="dropdown-item text-dark" href="/settings">Settings</Link>
							<Link className="dropdown-item text-dark" href="/files">My files</Link>
							<div className="dropdown-divider"></div>
							<a className="dropdown-item" href="#" onClick={() => signOut()} id="logout">Logout</a>
						</div>
					</li>
				</ul>
			</div>
		</nav>
	);
}
