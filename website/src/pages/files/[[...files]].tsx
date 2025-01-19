import { FileNavBar, Sidebar, Directory, PhotoAlbum, FileViewer, RecentNavbar } from '@/components';
import type { RecentlyViewed } from '../../types';
import type { GetServerSidePropsContext } from 'next';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { AuthOption } from '../api/auth/[...nextauth]';
import axios from 'axios';
import BreadcrumbNav from '@/components/navbars/BreadcrumbNav';
import { useFile, useFileDispatch } from '@/components/fileManager';
interface Props {
	path: string
	analysed?: {
		landmark: string
		nsfw: string
		face: string
		objects: string
		geo: string
	}
}

type viewTypeTypes = 'List' | 'Tiles';

export default function Files({ path = '/' }: Props) {
	const { data: session, status } = useSession({ required: true });
	const [recents, setRecents] = useState<RecentlyViewed[]>([]);
	const [viewType, setviewType] = useState<viewTypeTypes>('List');

	const file = useFile();
	const dispatch = useFileDispatch();

	async function fetchFiles() {
		try {
			const { data } = await axios.get(`/api/files/${path}`);
			dispatch({ type: 'SET_FILE', payload: data.file });
		} catch (err) {
			console.log(err);
		}
	}

	async function fetchRecentlyViewedFiles() {
		try {
			const { data } = await axios.get('/api/session/recently-viewed');
			setRecents(data.files);
		} catch (err) {
			console.log(err);
		}
	}

	useEffect(() => {
		fetchFiles();
		if (path.length == 0) fetchRecentlyViewedFiles();
	}, [path]);

	if (status == 'loading') return null;
	return (
		<>

			<div className="wrapper" style={{ height:'100vh' }}>
				<Sidebar user={session.user}/>
				<div className="container-fluid" style={{ overflowY: 'scroll' }}>
					<FileNavBar user={session.user} />
					<div className="container-fluid">
						<BreadcrumbNav path={path} isFile={file?.path == path} setviewType={setviewType} />
						{(path.length == 0 && recents.length > 0) &&
							<RecentNavbar files={recents} />
						}
						&nbsp;
						{file == null ?
							null :
							file.type == 'FILE' ?
						 <FileViewer file={file} userId={session.user.id} /> :
								viewType == 'Tiles' ?
									<PhotoAlbum folder={file} /> :
									<Directory folder={file} />
						}
					</div>
				</div>
			</div>
		</>
	);
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	// Get path
	const path = [context.params?.files].flat();
	const session = await getServerSession(context.req, context.res, AuthOption);
	if (session == null) return;
	return { props: { path: path.join('/') } };
}
