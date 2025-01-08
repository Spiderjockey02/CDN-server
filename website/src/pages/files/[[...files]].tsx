import { FileNavBar, Sidebar, Directory, PhotoAlbum, ImageViewer, RecentNavbar, Toast } from '@/components';
import type { fileItem, RecentlyViewed } from '../../types';
import type { GetServerSidePropsContext } from 'next';
import { ChangeEvent, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { AuthOption } from '../api/auth/[...nextauth]';
import axios, { AxiosRequestConfig } from 'axios';
import BreadcrumbNav from '@/components/navbars/BreadcrumbNav';
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

	const [file, setFile] = useState<fileItem>();
	const [recents, setRecents] = useState<RecentlyViewed[]>([]);
	const [progress, setProgress] = useState(0);
	const [, setRemaining] = useState(0);
	const [filename, setFilename] = useState('');
	const [viewType, setviewType] = useState<viewTypeTypes>('List');

	const onFileUploadChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const fileInput = e.target;
		if (!fileInput.files) return alert('No file was chosen');
		if (!fileInput.files || fileInput.files.length === 0) return alert('Files list is empty');


		const validFiles: File[] = [];
		for (let i = 0; i < fileInput.files.length; i++) {
			const file = fileInput.files[i];
			validFiles.push(file);
		}

		/** Reset file input */
		e.currentTarget.type = 'text';
		e.currentTarget.type = 'file';

		try {
			const startAt = Date.now();
			const formData = new FormData();

			// add files to request
			for (const file of validFiles) {
				formData.append('media', file);
				setFilename(file.name);
			}

			const options: AxiosRequestConfig = {
				headers: { 'Content-Type': 'multipart/form-data' },
				onUploadProgress: (progressEvent) => {
					const { loaded, total } = progressEvent;

					// Calculate the progress percentage
					const percentage = (loaded * 100) / (total ?? 0);
					setProgress(+percentage.toFixed(2));

					// Calculate the progress duration
					const timeElapsed = Date.now() - startAt;
					const uploadSpeed = loaded / timeElapsed;
					const duration = ((total ?? 0) - loaded) / uploadSpeed;
					setRemaining(duration);
				},
			};

			await axios.post('/api/files/upload', formData, options);
			await fetchFiles();
			setProgress(0);
			setRemaining(0);
		} catch (error) {
			console.error(error);
			alert('Sorry! something went wrong.');
			setProgress(0);
			setRemaining(0);
		}
	};

	async function fetchFiles() {
		try {
			const { data } = await axios.get(`/api/files/${path}`);
			console.log(data.file);
			setFile(data.file);
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
			<Toast percentage={progress} filename={filename} show={progress > 0}/>
			<div className="wrapper" style={{ height:'100vh' }}>
				<Sidebar user={session.user}/>
				<div className="container-fluid" style={{ overflowY: 'scroll' }}>
					<FileNavBar user={session.user} />
					<div className="container-fluid">
						<BreadcrumbNav path={path} isFile={file?.path == path} setviewType={setviewType} onUpload={onFileUploadChange} fetchFiles={fetchFiles} />
						{(path.length == 0 && recents.length > 0) &&
							<RecentNavbar files={recents} />
						}
						{file == undefined ?
							null :
							file.type == 'FILE' ?
						 <ImageViewer files={file} dir={path} user={session.user} /> :
								viewType == 'Tiles' ?
									<PhotoAlbum files={file} dir={path} user={session.user} /> :
									<Directory files={file} dir={path} userId={session.user.id} />
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
