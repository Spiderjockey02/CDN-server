import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fileItem } from '../types';
import mimeType from 'mime-types';
import { faFile, faFileAlt, faFileImage, faFileVideo, faFolder, faImages, faMusic } from '@fortawesome/free-solid-svg-icons';

export function formatBytes(bytes: number) {
	if (bytes == 0) return '0 Bytes';
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
		i = Math.floor(Math.log(bytes) / Math.log(1024));

	return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(file: fileItem) {
	// Check folder stuff
	if (!file.extension && file.children) {
		return (file.children.filter(item => ['image', 'video'].includes((mimeType.lookup(item.extension) || '').split('/')[0])).length / file.children.length >= 0.60)
			? <FontAwesomeIcon icon={faImages} /> : <FontAwesomeIcon icon={faFolder} /> ;
	}

	// Get the icon from file type
	const type = mimeType.lookup(file.extension);
	if (type == false) return <FontAwesomeIcon icon={faFile} />;

	switch (type.split('/')[0]) {
		case 'image':
			return <FontAwesomeIcon icon={faFileImage} />;
		case 'video':
			return <FontAwesomeIcon icon={faFileVideo} />;
		case 'text':
			return <FontAwesomeIcon icon={faFileAlt} />;
		case 'music':
			return <FontAwesomeIcon icon={faMusic} />;
		default:
			return <FontAwesomeIcon icon={faFile} />;
	}
}