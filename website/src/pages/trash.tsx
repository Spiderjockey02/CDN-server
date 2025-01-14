import { FileNavBar, Sidebar } from '@/components';
import { fileItem } from '@/types';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Recent() {
	const { data: session, status } = useSession({ required: true });
	const [files, setFiles] = useState<fileItem[]>([]);

	async function fetchFiles() {
		try {
			const { data } = await axios.get('/api/trash');
			console.log(data.files);
			setFiles(data.files);
		} catch (err) {
			console.log(err);
		}
	}

	useEffect(() => {
		fetchFiles();
	}, []);
	if (status == 'loading') return null;
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
											<b style={{ color:'black' }}>Trash</b>
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
								{files.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()).map(_ => (
									<tr key={_.id}>
										<th scope="row" className="text-truncate" style={{ maxWidth: 'calc( 70 * 1vw )' }}>
											<Link style={{ textDecoration: 'none', color: 'black' }} href={`/files${_.path}`}>{_.path}</Link>
										</th>
										<td>{new Date(_.deletedAt).toLocaleString('en-US')}</td>
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
