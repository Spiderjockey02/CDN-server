import { faChevronDown, faChevronUp, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RecentNavbarProps } from '@/types/Components/Navbars';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function RecentNavbar({ files }: RecentNavbarProps) {
	const [show, setShow] = useState(false);

	return (
		<div className="recent-tab">
			<button className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2" onClick={() => setShow(!show)}>
				<FontAwesomeIcon icon={faClockRotateLeft} />
				<span>Recently accessed files</span>
				<FontAwesomeIcon icon={show ? faChevronUp : faChevronDown} />
			</button>
			{show && (
				<div className="card border-0 mt-2" id="recent-files-collapse" style={{ height: '285px' }}>
					<div className="d-flex flex-wrap gap-2 overflow-hidden">
						{files.map(({ file }) => (
							<Link href={`/files${file.path}`} key={file.id} className="btn p-2" style={{ width: '150px' }}>
								<div className="card recentIcon">
									<div className="image-container">
										<Image className="card-img-top" src={`/thumbnail/${file.userId}${file.path}`} alt={`Thumbnail for ${file.name}`} width={200} height={225} style={{ width: '100%', objectFit: 'cover' }} />
									</div>
									<div className="card-body border-top p-1">
										<p className="text-truncate text-center">
											{file.name}
										</p>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
