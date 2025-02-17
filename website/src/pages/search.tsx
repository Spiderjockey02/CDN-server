import FileLayout from '@/layouts/file';
import { useSession } from 'next-auth/react';
import { GetServerSidePropsContext } from 'next/types';
import { AuthOption } from './api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import axios from 'axios';
import { fileItem } from '@/types';
import FilePanelPopup from '@/components/views/FilePanelPopup';
import FileViewTable from '@/components/Tables/FileViewTable';

interface Props {
  query: {
		query: string
		fileType: string
		dateUpdated: string
	}
}

export default function Search({ query: { query, fileType, dateUpdated } }: Props) {
	const { data: session, status } = useSession({ required: true });
	const [files, setFiles] = useState<fileItem[]>([]);
	const [filesSelected, setFilesSelected] = useState<fileItem[]>([]);
	const [filePanelToShow, setFilePanelToShow] = useState('');

	async function fetchFiles() {
		try {
			const { data } = await axios.get(`/api/files/search?query=${query}&fileType=${fileType}&updatedSince=${dateUpdated}`);
			console.log(data.query);
			setFiles(data.query);
		} catch (err) {
			console.log(err);
		}
	}

	const openContextMenu = () => null;

	function handleCheckboxToggle(e: MouseEvent, file: fileItem) {
		e.stopPropagation();
		setFilesSelected((prevSelected) =>
			prevSelected.find((f) => f.name === file.name)
				? prevSelected.filter((f) => f.name !== file.name)
				: [...prevSelected, file],
		);
	}

	useEffect(() => {
		fetchFiles();
	}, [query]);

	if (status == 'loading') return null;
	return (
		<FileLayout user={session.user}>
			<h4><b>Search for: {query}</b></h4>
			{files.map((_) => (
				filePanelToShow == _.id && <FilePanelPopup key={_.id} file={_} show={filePanelToShow == _.id} setShow={(s) => setFilePanelToShow(s)} />
			))}
			<FileViewTable files={files} selectedFiles={filesSelected} openContextMenu={openContextMenu}
				handleSelectAllToggle={() => null} handleCheckboxToggle={handleCheckboxToggle}
				setFilePanelToShow={setFilePanelToShow} showMoreDetail={true} />
		</FileLayout>
	);
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const session = await getServerSession(context.req, context.res, AuthOption);
	if (session == null) return;
	console.log();
	return { props: { query: context.query } };
}