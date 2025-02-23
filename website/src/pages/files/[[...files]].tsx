import { Directory, PhotoAlbum, FileViewer, RecentNavbar, ErrorPopup } from '@/components';
import { useFile, useFileDispatch } from '@/components/fileManager';
import BreadcrumbNav from '@/components/Navbars/BreadcrumbNav';
import { FilePageProps, viewTypeTypes } from '@/types/pages';
import { useCallback, useEffect, useState } from 'react';
import { AuthOption } from '../api/auth/[...nextauth]';
import type { GetServerSidePropsContext } from 'next';
import type { RecentlyViewed } from '../../types';
import { getServerSession } from 'next-auth/next';
import { useSession } from 'next-auth/react';
import FileLayout from '@/layouts/file';
import axios from 'axios';

export default function Files({ path = '/' }: FilePageProps) {
	const { data: session, status } = useSession({ required: true });
	const [recents, setRecents] = useState<RecentlyViewed[]>([]);
	const [errorMsg, setErrorMsg] = useState('');
	const [viewType, setviewType] = useState<viewTypeTypes>('List');

	const file = useFile();
	const dispatch = useFileDispatch();

	const fetchFiles = useCallback(async () => {
		try {
			const { data } = await axios.get(`/api/files/${path}`);
			dispatch({ type: 'SET_FILE', payload: data.file });
		} catch (err) {
			setErrorMsg('Unable to fetch files');
			console.error('Error fetching files:', err);
		}
	}, [path, dispatch]);

	const fetchRecentlyViewedFiles = useCallback(async () => {
		try {
			const { data } = await axios.get('/api/session/recently-viewed');
			setRecents(data.files);
		} catch (err) {
			setErrorMsg('Unable to fetch recently viewed files');
		}
	}, []);

	useEffect(() => {
		fetchFiles();
		if (!path) fetchRecentlyViewedFiles();
	}, [path, fetchFiles, fetchRecentlyViewedFiles]);

	if (status == 'loading') return null;
	return (
		<FileLayout user={session.user}>
			<BreadcrumbNav path={path} isFile={file?.type == 'FILE'} setviewType={setviewType} viewType={viewType} />
			{errorMsg && <ErrorPopup text={errorMsg} onClose={() => setErrorMsg('')} />}
			{(path.length == 0 && recents.length > 0) &&
				<RecentNavbar files={recents} />
			}
			<div style={{ paddingTop: '6px' }}>
				{file ? (
					file.type === 'FILE' ? (
						<FileViewer file={file} userId={session.user.id} />
					) : viewType === 'Tiles' ? (
						<PhotoAlbum folder={file} />
					) : (
						<Directory folder={file} />
					)
				) : null}
			</div>
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
