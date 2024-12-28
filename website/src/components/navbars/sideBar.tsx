import Link from 'next/link';
import { formatBytes } from '@/utils/functions';
import config from '@/config';
import type { User } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faClock, faFolder, faStar, faTrash } from '@fortawesome/free-solid-svg-icons';
interface Props {
	user: User
}

export default function SideBar({ user }: Props) {
	const size = Number(user.totalStorageSize) ?? 0;

	function getColor(num: number) {
		if (num >= (0.9 * user.group.maxStorageSize)) {
			return 'bg-danger';
		} else if (num >= (0.5 * user.group.maxStorageSize)) {
			return 'bg-warning';
		} else {
			return 'bg-success';
		}
	}

	return (
		<nav id="sidebar">
			<Link href="/" className="sidebar-header side-text">
				<h3>{config.company.name}</h3>
			</Link>
			<ul className="list-unstyled components mobile-btn" style={{ verticalAlign:'center' }}>
				<li>
					<a className="btn sidebar-btn" data-bs-toggle="offcanvas" href="#offcanvasExample" role="button" aria-controls="offcanvasExample">
						<FontAwesomeIcon icon={faBars} />
					</a>
				</li>
			</ul>
			<div className="offcanvas offcanvas-start" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel" style={{ maxWidth: '75%' }}>
				<div className="offcanvas-header">
					<Link href="/" className="sidebar-header">
						<h5>{config.company.name}</h5>
					</Link>
					<button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
				</div>
				<div className="offcanvas-body">
					<ul className="list-unstyled components">
						<li>
							<Link href="/files" className='btn sidebar-btn'>
								<FontAwesomeIcon icon={faFolder} data-bs-toggle="tooltip" data-bs-placement="right" title="All files" />
								<span> All files</span>
							</Link>
						</li>
						<li>
							<Link href="/recent" className='btn sidebar-btn'>
								<FontAwesomeIcon icon={faClock} data-bs-toggle="tooltip" data-bs-placement="right" title="Recents" />
								<span> Recents</span>
							</Link>
						</li>
						<li>
							<Link href="/favourites" className='btn sidebar-btn'>
								<FontAwesomeIcon icon={faStar} data-toggle="tooltip" data-placement="right" title="Favourites" />
								<span> Favourites</span>
							</Link>
						</li>
						<li style={{ position:'fixed', bottom:'0' }}>
							<div style={{ padding: '0 10px' }}>
								<label>{formatBytes(size)} of {formatBytes(user.group.maxStorageSize)} used</label>
								<div className="progress" style={{ width:'200px' }}>
									<div className={`progress-bar ${getColor(size)}`} role="progressbar" style={{ width:`${(size / user.group.maxStorageSize) * 100}%` }} aria-valuenow={size} aria-valuemin={0} aria-valuemax={user.group.maxStorageSize}></div>
								</div>
							</div>
							<Link href="/trash" className='btn sidebar-btn' style={{ marginTop: '0.5rem' }}>
								<FontAwesomeIcon icon={faTrash} />
								<span> Bin</span>
							</Link>
						</li>
					</ul>
				</div>
			</div>
			<ul className="list-unstyled components">
				<li>
					<Link href="/files" className='btn sidebar-btn'>
						<FontAwesomeIcon icon={faFolder} data-bs-toggle="tooltip" data-bs-placement="right" title="All files" />
						<span className="side-text"> All files</span>
					</Link>
				</li>
				<li>
					<Link href="/recent" className='btn sidebar-btn'>
						<FontAwesomeIcon icon={faClock} data-bs-toggle="tooltip" data-bs-placement="right" title="Recents" />
						<span className="side-text"> Recents</span>
					</Link>
				</li>
				<li>
					<Link href="/favourites" className='btn sidebar-btn'>
						<FontAwesomeIcon icon={faStar} data-toggle="tooltip" data-placement="right" title="Favourites" />
						<span className="side-text"> Favourites</span>
					</Link>
				</li>
				<li className="bottom" style={{ position:'fixed', bottom:'0' }}>
					<div style={{ padding: '0 10px' }}>
						<label className="side-text">{formatBytes(size)} of {formatBytes(user.group.maxStorageSize)} used</label>
						<div className="progress side-text" style={{ width:'200px' }}>
							<div className={`progress-bar ${getColor(size)}`} role="progressbar" style={{ width:`${(size / user.group.maxStorageSize) * 100}%` }} aria-valuenow={size} aria-valuemin={0} aria-valuemax={user.group.maxStorageSize}></div>
						</div>
					</div>
					<Link href="/trash" className='btn sidebar-btn' style={{ marginTop: '0.5rem' }}>
						<FontAwesomeIcon icon={faTrash} />
						<span className="side-text"> Bin</span>
					</Link>
				</li>
			</ul>
		</nav>
	);
}
