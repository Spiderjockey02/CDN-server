import { fileItem } from '@/types';
import Table from '../UI/Table';
import FileItemRow from '../views/FileItemRow';
import { useEffect, useState, type MouseEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';

interface Props {
  files: fileItem[]
  selectedFiles: fileItem[]
  handleSelectAllToggle: () => void
  handleCheckboxToggle: (e: MouseEvent, file: fileItem) => void
  openContextMenu: (e: MouseEvent<HTMLTableRowElement>, selected: fileItem) => void
  setFilePanelToShow: (fileId: string) => void
	showMoreDetail?: boolean
}
type sortKeyTypes = 'Name' | 'Size' | 'Date_Mod';
type SortOrder = 'ascn' | 'dscn';
export default function FileViewTable({ files, handleSelectAllToggle, handleCheckboxToggle, selectedFiles, openContextMenu, setFilePanelToShow, showMoreDetail = false }: Props) {
	const [sortKey, setSortKey] = useState<sortKeyTypes>('Name');
	const [sortOrder, setSortOrder] = useState<SortOrder>('ascn');

	function updateSortKey(sort: sortKeyTypes) {
		switch(sort) {
			case 'Name': {
				const isAscending = sortOrder === 'ascn';
				setSortOrder(isAscending ? 'dscn' : 'ascn');

				files = files.sort((a, b) => {
					return isAscending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
				});

				setSortKey(sort);
				break;
			}
			case 'Size': {
				const isAscending = sortOrder === 'ascn';
				setSortOrder(isAscending ? 'dscn' : 'ascn');

				files = files.sort((a, b) => {
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

				files = files.sort((a, b) => {
					const dateA = new Date(a.createdAt);
					const dateB = new Date(b.createdAt);
					return isAscending ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
				});
				setSortKey(sort);
				break;
			}
		}
	}

	useEffect(() => {
		updateSortKey(sortKey);
	}, []);

	return (
		<Table>
			<Table.HeaderRow>
				<Table.Header style={{ width: '50px' }} className='hide-on-mobile text-center'>
					<input className="form-check-input" type="checkbox" name="exampleRadios" id="All" onChange={handleSelectAllToggle} />
				</Table.Header>
				<Table.Header id="Name" className="th-header" onClick={() => updateSortKey('Name')} style={{ cursor: 'pointer' }}>
          Name <FontAwesomeIcon icon={sortKey == 'Name' ? (sortOrder == 'ascn' ? faSortUp : faSortDown) : faSort} />
				</Table.Header>
				<Table.Header id="Size" className="th-header" onClick={() => updateSortKey('Size')} style={{ cursor: 'pointer' }}>
          Size <FontAwesomeIcon icon={sortKey == 'Size' ? (sortOrder == 'ascn' ? faSortUp : faSortDown) : faSort} />
				</Table.Header>
				<Table.Header id="Date modified" className="th-header hide-on-mobile" onClick={() => updateSortKey('Date_Mod')} style={{ cursor: 'pointer' }}>
          Date modified <FontAwesomeIcon icon={sortKey == 'Date_Mod' ? (sortOrder == 'ascn' ? faSortUp : faSortDown) : faSort} />
				</Table.Header>
			</Table.HeaderRow>
			<Table.Body>
				{files.filter(f => f.type == 'DIRECTORY').map(_ => (
					<FileItemRow key={_.name}
						file={_} showMoreDetail={showMoreDetail}
						isChecked={selectedFiles.includes(_)} openContextMenu={openContextMenu}
						handleCheckboxToggle={handleCheckboxToggle} setShow={(fileId) => setFilePanelToShow(fileId)}
					/>
				))}
				{files.filter(f => f.type == 'FILE').map(_ => (
					<FileItemRow key={_.name}
						file={_} showMoreDetail={showMoreDetail}
						isChecked={selectedFiles.includes(_)} openContextMenu={openContextMenu}
						handleCheckboxToggle={handleCheckboxToggle} setShow={(fileId) => setFilePanelToShow(fileId)}
					/>
				))}
			</Table.Body>
		</Table>
	);
}