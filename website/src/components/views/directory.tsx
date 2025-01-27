import type { fileItem } from '../../types';
import { useState } from 'react';
import ContextMenu from '../menus/contextMenu';
import type { MouseEvent } from 'react';
import FileItemRow from './FileItemRow';
import RenameModal from '../Modals/renameFile';
import ChangeModal from '../Modals/changeFile';
import DeleteFileModal from '../Modals/deleteFile';
import FilePanelPopup from './FilePanelPopup';
type sortKeyTypes = 'Name' | 'Size' | 'Date_Mod';
type SortOrder = 'ascn' | 'dscn';
interface Props {
  folder: fileItem
}

const initalContextMenu = {
	show: false,
	x: 0,
	y: 0,
	selected: [] as fileItem[],
};

export default function Directory({ folder }: Props) {
	const [, setSortKey] = useState<sortKeyTypes>('Name');
	const [sortOrder, setSortOrder] = useState<SortOrder>('ascn');
	const [contextMenu, setContextMenu] = useState(initalContextMenu);
	const [filesSelected, setFilesSelected] = useState<fileItem[]>([]);
	const [allSelected, setAllSelected] = useState(false);
	const [filePanelToShow, setFilePanelToShow] = useState('');

	function updateSortKey(sort: sortKeyTypes) {
		switch(sort) {
			case 'Name': {
				const isAscending = sortOrder === 'ascn';
				setSortOrder(isAscending ? 'dscn' : 'ascn');

				folder.children = folder.children.sort((a, b) => {
					return isAscending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
				});

				setSortKey(sort);
				break;
			}
			case 'Size': {
				const isAscending = sortOrder === 'ascn';
				setSortOrder(isAscending ? 'dscn' : 'ascn');

				folder.children = folder.children.sort((a, b) => {
					if (a.type === 'DIRECTORY' && b.type === 'DIRECTORY') {
						return isAscending
							? a._count.children - b._count.children
							: b._count.children - a._count.children;
					} else if (a.type === 'FILE' && b.type === 'FILE') {
						return isAscending
							? a.size - b.size
							: b.size - a.size;
					} else {
						return a.type === 'DIRECTORY' ? -1 : 1;
					}
				});

				setSortKey(sort);
				break;
			}
			case 'Date_Mod': {
				const isAscending = sortOrder === 'ascn';
				setSortOrder(isAscending ? 'dscn' : 'ascn');

				folder.children = folder.children.sort((a, b) => {
					const dateA = new Date(a.createdAt);
					const dateB = new Date(b.createdAt);
					return isAscending ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
				});
				setSortKey(sort);
				break;
			}
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

	function handleSelectAllToggle() {
		if (allSelected) {
			// Uncheck all
			setFilesSelected([]);
		} else {
			// Select all files
			setFilesSelected(folder.children);
		}
		setAllSelected(!allSelected);
	}

	return (
		<div>
			{contextMenu.show &&	<ContextMenu x={contextMenu.x} y={contextMenu.y} closeContextMenu={closeContextMenu} selected={contextMenu.selected} />}
			{folder.children.map((_) => <RenameModal key={_.id} file={_} />)}
			{folder.children.map((_) => <ChangeModal key={_.id} file={_} />)}
			{folder.children.map((_) => <DeleteFileModal key={_.id} file={_} />)}
			{folder.children.map((_) => <FilePanelPopup key={_.id} file={_} show={filePanelToShow == _.id} setShow={(s) => setFilePanelToShow(s)} />)}
			<table className="table" id="myTable">
				<thead>
					<tr>
						<th scope="col" className="th-header dot" style={{ width:'5%', textAlign:'center', borderTopLeftRadius: '5px' }}>
							<div className="form-check form-check-inline hide">
								<input className="form-check-input" type="checkbox" name="exampleRadios" id="All" onChange={handleSelectAllToggle} />
							</div>
						</th>
						<th id="Type" className="th-header" scope="col" style={{ width:'5%', textAlign:'center' }}>
							<i className="far fa-file"></i>
						</th>
						<th id="Name" className="th-header" scope="col" onClick={() => updateSortKey('Name')}>
              Name <i className="bi bi-arrow-down-up"></i>
						</th>
						<th id="Size" className="th-header" scope="col" onClick={() => updateSortKey('Size')}>
              Size <i className="bi bi-arrow-down-up"></i>
						</th>
						<th id="Date modified" className="th-header" style={{ borderTopRightRadius: '5px' }} scope="col" onClick={() => updateSortKey('Date_Mod')} >
              Date modified <i className="bi bi-arrow-down-up"></i>
						</th>
					</tr>
				</thead>
				<tbody>
					{folder.children.filter(f => f.type == 'DIRECTORY').map(_ => (
						<FileItemRow key={_.name}
							file={_}
							isChecked={filesSelected.includes(_)} openContextMenu={openContextMenu}
							handleCheckboxToggle={handleCheckboxToggle} setShow={(fileId) => setFilePanelToShow(fileId)}
						/>
					))}
					{folder.children.filter(f => f.type == 'FILE').map(_ => (
						<FileItemRow key={_.name}
							file={_}
							isChecked={filesSelected.includes(_)} openContextMenu={openContextMenu}
							handleCheckboxToggle={handleCheckboxToggle} setShow={(fileId) => setFilePanelToShow(fileId)}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
}
