import type { fileItem } from '../../types';
import Link from 'next/link';
import Image from 'next/image';
import type { ImageLoaderProps } from 'next/image';
import { useState } from 'react';
interface Props {
  folder: fileItem
}

export default function PhotoAlbum({ folder }: Props) {
	const [page, setPage] = useState(0);
	const pageCount = 40;

	const myLoader = ({ src }: ImageLoaderProps) => `/thumbnail/${folder.userId}${src}`;
	return (
		<>
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(0, 180px))', gap: '5px', justifyContent: 'flex-start' }}>
				{folder.children.sort((a, b) => a.type.localeCompare(b.type)).slice(page * pageCount, (page + 1) * pageCount).map(_ => (
					<div className="text-center" key={_.name} style={{ border: '1px solid black', borderRadius: '8px' }}>
						<Link href={`/files${_.path}`} style={{ textDecoration: 'none' }}>
							<Image className="center" loader={myLoader} src={_.path}
								style={{ width: '100%', maxHeight: _.type == 'DIRECTORY' ? '236px' : '260px', borderRadius: '8px' }}
								alt={_.name} width={200} height={275}
							/>
						</Link>
						{_.type == 'DIRECTORY' && <p className='m-0 text-truncate' style={{ maxWidth: '200px' }}>{_.name}</p>}
					</div>
				))}
			</div>
			&nbsp;
			{folder.children.length > pageCount && (
				<div className="d-flex justify-content-center">
					<nav aria-label="Page navigation example">
						<ul className="pagination">
							<li className="page-item">
								<a className="page-link" href="#" aria-label="Previous" onClick={() => setPage(page - 1 < 0 ? 0 : page - 1)}>
									<span aria-hidden="true">&laquo;</span>
									<span className="sr-only">Previous</span>
								</a>
							</li>
							<li className="page-item">
								<a className="page-link" href="#"onClick={() => setPage(1)}>1</a>
							</li>
							<li className="page-item"><p className="page-link">{page + 1}</p></li>
							<li className="page-item">
								<a className="page-link" href="#" onClick={() => setPage(Math.floor(folder.children.length / pageCount))} >{Math.floor(folder.children.length / pageCount) + 1}</a>
							</li>
							<li className="page-item">
								<a className="page-link" href="#" aria-label="Next" onClick={() => setPage(page + 1 > Math.floor(folder.children.length / pageCount) ? Math.floor(folder.children.length / pageCount) : page + 1)}>
									<span aria-hidden="true">&raquo;</span>
									<span className="sr-only">Next</span>
								</a>
							</li>
						</ul>
					</nav>
				</div>
			)}
		</>
	);
}
