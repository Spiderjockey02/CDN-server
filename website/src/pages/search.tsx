import FileLayout from '@/layouts/file';
import { useSession } from 'next-auth/react';
import { GetServerSidePropsContext } from 'next/types';
import { AuthOption } from './api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { fileItem } from '@/types';
import FilePanelPopup from '@/components/views/FilePanelPopup';
import { FileItemRow } from '@/components';

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
			<div>
				{files.map((_) => (
					filePanelToShow == _.id && <FilePanelPopup key={_.id} file={_} show={filePanelToShow == _.id} setShow={(s) => setFilePanelToShow(s)} />
				))}
				<table className="table" id="myTable">
					<thead>
						<tr>
							<th scope="col" className="th-header dot" style={{ width:'5%', textAlign:'center' }}>
								<div className="form-check form-check-inline hide">
									<input className="form-check-input" type="checkbox" name="exampleRadios" id="All" />
								</div>
							</th>
							<th id="Type" className="th-header" scope="col" style={{ width:'5%', textAlign:'center' }}>
								<i className="far fa-file"></i>
							</th>
							<th id="Name" className="th-header" scope="col" >
								Name <i className="bi bi-arrow-down-up"></i>
							</th>
							<th id="Size" className="th-header" scope="col">
								Size <i className="bi bi-arrow-down-up"></i>
							</th>
							<th id="Date modified" className="th-header" scope="col">
								Date modified <i className="bi bi-arrow-down-up"></i>
							</th>
						</tr>
					</thead>
					<tbody>
						{files.map(_ => (
							<FileItemRow key={_.name}
								file={_}
								isChecked={filesSelected.includes(_)} openContextMenu={openContextMenu}
								handleCheckboxToggle={handleCheckboxToggle} setShow={(fileId) => setFilePanelToShow(fileId)}
							/>
						))}
					</tbody>
				</table>
			</div>
		</FileLayout>
	);
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const session = await getServerSession(context.req, context.res, AuthOption);
	if (session == null) return;
	console.log();
	return { props: { query: context.query } };
}