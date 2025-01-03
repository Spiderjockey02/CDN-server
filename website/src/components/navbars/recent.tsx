import Image from 'next/image';
import type { User } from '@/types';
import Link from 'next/link';
interface Props {
	user: User
}

export default function RecentNavbar({ user }: Props) {
	return (
		<div className="recent-tab">
			<button className="btn" type="button" data-bs-toggle="collapse" data-bs-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
    		Button with data-bs-target
			</button>
			<div className="collapse" id="collapseExample">
				<div className="card" style={{ border: 'none' }}>
					<div className="row h-100" style={{ overflowY: 'hidden', maxHeight: '285px' }}>
						{user.recentlyViewed?.sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()).map(({ file }) => (
							<Link href={`/files/${file.path}`} key={file.path} className="col" style={{ maxWidth:'150px', padding:'10px' }}>
								<div className="card recentIcon">
									<div className="image-container">
										<Image className="card-img-top" src={`/thumbnail/${user.id}${file.path}`} alt="Recent file accessed"
											style={{ width:'100%', height:'auto', maxHeight:'220px' }} width="200" height="200" />
									</div>
									<div className="card-body" style={{ borderTop: '1px solid #e3e3e3', padding:'0px 10px' }}>
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
