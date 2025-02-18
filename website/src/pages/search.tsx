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
import { ContextMenu } from '@/components';

interface Props {
  query: {
		query: string
		fileType: string
		dateUpdated: string
	}
}
const initalContextMenu = {
	show: false,
	x: 0,
	y: 0,
	selected: [] as fileItem[],
};

export default function Search({ query: { query, fileType, dateUpdated } }: Props) {
	const { data: session, status } = useSession({ required: true });
	const [contextMenu, setContextMenu] = useState(initalContextMenu);
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

	function openContextMenu(e: MouseEvent<HTMLTableRowElement>, selected: fileItem) {
		e.preventDefault();
		const { pageX, pageY } = e;

		const menuWidth = 170;
		const menuHeight = 270;
		const windowWidth = window.innerWidth;
		const windowHeight = window.innerHeight;

		let posX = pageX;
		let posY = pageY;

		// Adjust position if the menu would overflow the viewport
		if (posX + menuWidth > windowWidth) posX = windowWidth - menuWidth;
		if (posY + menuHeight > windowHeight) posY = windowHeight - menuHeight;

		// Update this to support multi-selection
		if (filesSelected.length > 0) {
			setContextMenu({ show: true, x: posX, y: posY, selected: filesSelected });
		} else {
			setContextMenu({ show: true, x: posX, y: posY, selected: [selected] });
		}
	}
	const closeContextMenu = () => setContextMenu(initalContextMenu);

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
			{contextMenu.show &&	<ContextMenu x={contextMenu.x} y={contextMenu.y} closeContextMenu={closeContextMenu} selected={contextMenu.selected} showFilePanel={(fileId) => setFilePanelToShow(fileId)} />}
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