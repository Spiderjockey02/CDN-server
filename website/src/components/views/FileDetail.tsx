import { fileItem } from '@/types';
import { getFileIcon } from '@/utils/functions';
import Link from 'next/link';

interface Props {
  file: fileItem
}

export default function FileDetail({ file }: Props) {
	return (
		<th scope="row" className="text-truncate" style={{ maxWidth: '50vw' }}>
			<Link	className="d-flex flex-row align-items-center" style={{ textDecoration: 'none', color: 'black' }}	href={`/files${file.path}`}>
				<div className="d-flex align-items-center" style={{ minWidth: '1.5em', height: '1.5em' }}>
					{getFileIcon(file)}
				</div>
				<div className="d-flex flex-column ms-2" style={{ maxWidth: '90%' }}>
					<span className="fw-bold text-truncate" >{file.name}</span>
					<span className="text-muted small" style={{ height: '20px', overflow: 'hidden' }}>
						<ol className="breadcrumb">
							{file.path.split('/').length == 2 ?
								<li className="breadcrumb-item">
									/
								</li>
								:
								file.path.split('/').slice(1, -1).map(seg => (
									<li className="breadcrumb-item text-truncate" key={seg}>
										{seg}
									</li>
								))
							}
						</ol>
					</span>
				</div>
			</Link>
		</th>
	);
}