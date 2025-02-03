import Image from 'next/image';
import type { RecentlyViewed } from '@/types';
import Link from 'next/link';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
interface Props {
	files: RecentlyViewed[]
}

export default function RecentNavbar({ files }: Props) {
	const [show, setShow] = useState(false);

	return (
		<div className="recent-tab">
			<button className="btn btn-outline-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample" onClick={() => setShow(!show)}>
    		Recently accessed files <FontAwesomeIcon icon={show ? faChevronDown : faChevronUp} />
			</button>
			<div className="collapse" id="collapseExample">
				<div className="card" style={{ border: 'none', height: '285px' }}>
					<div style={{ overflowY: 'hidden', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '5px 5px' }}>
						{files.map(({ file }) => (
							<Link href={`/files${file.path}`} key={file.id} className="col btn" style={{ width:'150px', padding:'10px' }}>
								<div className="card recentIcon">
									<div className="image-container">
										<Image className="card-img-top" src={`/thumbnail/${file.userId}${file.path}`} alt="Recent file accessed"
											style={{ width:'100%' }} width={200} height={225} />
									</div>
									<div className="card-body" style={{ borderTop: '1px solid #e3e3e3', padding:'0' }}>
										<p className="text-truncate text-center" data-toggle="tooltip" data-placement="top" title={file.path.split('/').at(-1)}>{file.path.split('/').at(-1)}</p>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
