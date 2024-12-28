import { faBell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export default function NavBar() {
	const { data: session, status } = useSession();

	return (
		<nav className="navbar navbar-expand-lg fixed-top navbar-light" id="navBar" style={{ boxShadow: '0px 2px 5px 0px rgba(0,0,0,0.75)', backgroundColor: 'white' }}>
			<Link className="navbar-brand btn" href="/">Home</Link>
			<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
				<span className="navbar-toggler-icon"></span>
			</button>
			<div className="collapse navbar-collapse" id="navbarSupportedContent">
				<ul className="navbar-nav me-auto mb-2 mb-lg-0">
				</ul>
				<ul className="navbar-nav">
					{(status == 'authenticated') ?
						<>
							<li className="navbar-nav dropdown">
								<a className="nav-item text-dark nav-link" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
									<FontAwesomeIcon icon={faBell} />
								</a>
								<div className="dropdown-menu dropdown-menu-end">
									<h3 className="dropdown-header">Notifications</h3>
									<p className="dropdown-item">You currently have no notifications.</p>
								</div>
							</li>
							<li className="nav-item dropdown">
								<a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
									<Image src="/avatar" width={25} height={25} className="rounded-circle" alt="User avatar" /> {session.user?.name}
								</a>
								<div className="dropdown-menu dropdown-menu-end">
									<Link className="dropdown-item text-dark" href="/settings">Settings</Link>
									<Link className="dropdown-item text-dark" href="/files">My files</Link>
									<div className="dropdown-divider"></div>
									<a className="dropdown-item" href="#" onClick={() => signOut()} id="logout">Logout</a>
								</div>
							</li>
						</>
						:
						<>
							<li className="navbar-nav">
								<Link className="nav-item text-dark nav-link" href="/login">Login</Link>
							</li>
							<li className="navbar-nav">
								<Link className="nav-item text-dark nav-link" href="/register">Sign up</Link>
							</li>
						</>
					}
				</ul>
			</div>
		</nav>
	);
}
