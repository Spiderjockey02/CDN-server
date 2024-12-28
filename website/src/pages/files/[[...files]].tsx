import { FileNavBar, Sidebar, Directory, PhotoAlbum, ImageViewer, RecentNavbar, Toast } from '@/components';
import type { fileItem } from '../../types';
import type { GetServerSidePropsContext } from 'next';
import { ChangeEvent, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { AuthOption } from '../api/auth/[...nextauth]';
import axios, { AxiosRequestConfig } from 'axios';
import { useRouter } from 'next/router';
import BreadcrumbNav from '@/components/navbars/BreadcrumbNav';
interface Props {
	dir: fileItem | null
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

export default function Files({ dir, path = '/', analysed }: Props) {
	const { data: session, status } = useSession({ required: true });
	const router = useRouter();

	const [progress, setProgress] = useState(0);
	const [, setRemaining] = useState(0);
	const [filename, setFilename] = useState('');
	const [viewType, setviewType] = useState<viewTypeTypes>('List');

	if (status == 'loading') return null;
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
			router.reload();
			setProgress(0);
			setRemaining(0);
		} catch (error) {
			console.error(error);
			alert('Sorry! something went wrong.');
			setProgress(0);
			setRemaining(0);
		}
	};

	return (
		<>
			<Toast percentage={progress} filename={filename} show={progress > 0}/>
			<div className="wrapper" style={{ height:'100vh' }}>
				<Sidebar user={session.user}/>
				<div className="container-fluid" style={{ overflowY: 'scroll' }}>
					<FileNavBar user={session.user} />
					<div className="container-fluid">
						<BreadcrumbNav path={path} isFile={dir?.type == 'file'} setviewType={setviewType} onUpload={onFileUploadChange} />
						{(path.length <= 1 && session.user.recentFiles?.length >= 1) &&
						<RecentNavbar user={session.user}/>
						}
						{dir == null ?
							<p>This folder is empty</p>
							: (dir.type == 'directory') ?
								viewType == 'Tiles' ?
									<PhotoAlbum files={dir.children} dir={path} user={session.user} /> :
									<Directory files={dir} dir={path} userId={session.user.id} />
								: <ImageViewer files={dir} dir={path} user={session.user} analysed={analysed}/>
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
	// Validate path
	try {
		const { data } = await axios.get(`${process.env.NEXTAUTH_URL}/api/files/${path ? `/${path.join('/')}` : ''}`, {
			headers: { cookie: context.req.headers.cookie },
		});

		return { props: { dir: data.files, path: path.join('/') } };
	} catch (err) {
		return { props: { dir: null, path: '/' } };
	}
}
