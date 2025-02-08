import { Directory, PhotoAlbum, FileViewer, RecentNavbar } from '@/components';
import type { RecentlyViewed } from '../../types';
import type { GetServerSidePropsContext } from 'next';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { AuthOption } from '../api/auth/[...nextauth]';
import axios from 'axios';
import BreadcrumbNav from '@/components/navbars/BreadcrumbNav';
import { useFile, useFileDispatch } from '@/components/fileManager';
import FileLayout from '@/layouts/file';
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
		<FileLayout user={session.user}>
			<BreadcrumbNav path={path} isFile={file?.type == 'FILE'} setviewType={setviewType} />
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
		</FileLayout>
	);
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	// Get path
	const path = [context.params?.files].flat();
	const session = await getServerSession(context.req, context.res, AuthOption);
	if (session == null) return;
	return { props: { path: path.join('/') } };
}
