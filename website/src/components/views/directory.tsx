import type { fileItem } from '../../types';
import { useState } from 'react';
import ContextMenu from '../menus/contextMenu';
import type { MouseEvent } from 'react';
import FileItemRow from './FileItemRow';
type sortKeyTypes = 'Name' | 'Size' | 'Date_Mod';
type SortOrder = 'ascn' | 'dscn';
interface Props {
  files: fileItem
  dir: string
	userId: string
}

const initalContextMenu = {
	show: false,
	x: 0,
	y: 0,
	selected: { name: '', type: '', size: 0, modified: '' } as unknown as fileItem,
};

export default function Directory({ files, dir, userId }: Props) {
	const [sortKey, setSortKey] = useState<sortKeyTypes>('Name');
	const [sortOrder, setSortOrder] = useState<SortOrder>('ascn');
	const [contextMenu, setContextMenu] = useState(initalContextMenu);
	const [filesSelected, setFilesSelected] = useState<string[]>([]);
	const [allSelected, setAllSelected] = useState(false);


	function updateSortKey(sort: sortKeyTypes) {
		switch(sort) {
			case 'Name': {
				setSortOrder(sortOrder == 'ascn' ? 'dscn' : 'ascn');
				if (sortOrder == 'ascn') {
					files.children = files.children.sort((a, b) => a.name > b.name ? 1 : -1);
				} else {
					files.children = files.children.sort((a, b) => a.name < b.name ? 1 : -1);
				}
				setSortKey(sort);
				break;
			}
			case 'Size': {
				setSortOrder(sortOrder == 'ascn' ? 'dscn' : 'ascn');
				if (sortOrder == 'ascn') {
					files.children = files.children.sort((a, b) => a.size > b.size ? 1 : -1);
				} else {
					files.children = files.children.sort((a, b) => a.size < b.size ? 1 : -1);
				}
				setSortKey(sort);
				break;
			}
			case 'Date_Mod': {
				setSortOrder(sortOrder == 'ascn' ? 'dscn' : 'ascn');
				if (sortOrder == 'ascn') {
					files.children = files.children.sort((a, b) => a.modified > b.modified ? 1 : -1);
				} else {
					files.children = files.children.sort((a, b) => a.modified < b.modified ? 1 : -1);
				}
				setSortKey(sort);
				break;
			}
		}
	}

	function openContextMenu(e: MouseEvent<HTMLTableRowElement>, selected: fileItem) {
		e.preventDefault();
		const { pageX, pageY } = e;

		// Update this to support multi-selection
		if (filesSelected.length > 0) {
			setContextMenu({ show: true, x: pageX, y: pageY, selected });
		} else {
			setContextMenu({ show: true, x: pageX, y: pageY, selected });
		}

	}
	const closeContextMenu = () => setContextMenu(initalContextMenu);

	function handleCheckboxToggle(e: MouseEvent, fileName: string) {
		e.stopPropagation();
		setFilesSelected((prevSelected) =>
			prevSelected.includes(fileName)
				? prevSelected.filter((name) => name !== fileName)
				: [...prevSelected, fileName],
		);
	}

	function handleSelectAllToggle() {
		if (allSelected) {
			// Uncheck all
			setFilesSelected([]);
		} else {
			// Select all files
			const allFileNames = files.children.map((file) => file.name);
			setFilesSelected(allFileNames);
		}
		setAllSelected(!allSelected);
	}

	return (
		<div>
			{contextMenu.show &&	<ContextMenu x={contextMenu.x} y={contextMenu.y} closeContextMenu={closeContextMenu} selected={contextMenu.selected} />}
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
					{files.children.filter(f => f.type == 'DIRECTORY').map(_ => (
						<FileItemRow key={_.name}
							dir={dir} file={_}
							userId={userId}
							isChecked={filesSelected.includes(_.name)} openContextMenu={openContextMenu}
							handleCheckboxToggle={handleCheckboxToggle}
						/>
					))}
					{files.children.filter(f => f.type == 'FILE').map(_ => (
						<FileItemRow key={_.name}
							dir={dir} file={_}
							userId={userId}
							isChecked={filesSelected.includes(_.name)} openContextMenu={openContextMenu}
							handleCheckboxToggle={handleCheckboxToggle}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
}
