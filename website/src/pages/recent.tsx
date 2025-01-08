import { FileNavBar, Sidebar } from '@/components';
import { useSession } from 'next-auth/react';
import type { RecentlyViewed } from '@/types';
import Link from 'next/link';

export default function Recent() {
	const { data: session, status } = useSession({ required: true });
	if (status == 'loading') return null;
	const files: Array<RecentlyViewed> = session.user.recentlyViewed;

	return (
		<>
			<div className="wrapper" style={{ height:'100vh' }}>
				<Sidebar user={session.user}/>
				<div className="container-fluid" style={{ overflowY: 'scroll' }}>
					<FileNavBar user={session.user}/>
					<div className="container-fluid">
						<div className="row">
							<div className="col-md-10">
								<nav style={{ fontSize:'18.72px' }} aria-label="breadcrumb">
									<ol className="breadcrumb" style={{ backgroundColor:'white' }}>
										<li className="breadcrumb-item">
											<b style={{ color:'black' }}>Recently viewed files</b>
										</li>
									</ol>
								</nav>
							</div>
							<div className="col-md-2">
							</div>
						</div>
						<table className="table" id="myTable">
							<thead>
								<tr>
									<th id="Name" className="th-header" scope="col">
                    Name
									</th>
									<th id="Date modified" className="th-header" style={{ borderTopRightRadius: '5px' }} scope="col">
                    Accessed on
									</th>
								</tr>
							</thead>
							<tbody>
								{files.sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()).map(_ => (
									<tr key={_.id}>
										<th scope="row" className="text-truncate" style={{ maxWidth: 'calc( 70 * 1vw )' }}>
											<Link style={{ textDecoration: 'none', color: 'black' }} href={`/files${_.file.path}`}>{_.file.path}</Link>
										</th>
										<td>{new Date(_.viewedAt).toLocaleString('en-US')}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</>
	);
}
