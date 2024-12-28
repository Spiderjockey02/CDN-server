import { fileItem } from '../types';
import mimeType from 'mime-types';

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
			? '<i class="far fa-images"></i>' : '<i class="far fa-folder"></i>';
	}

	// Get the icon from file type
	const type = mimeType.lookup(file.extension);
	if (type == false) return '<i class="far fa-file">';

	switch (type.split('/')[0]) {
		case 'image':
			return '<i class="far fa-file-image"></i>';
		case 'video':
			return '<i class="far fa-file-video"></i>';
		case 'text':
			return'<i class="far fa-file-alt"></i>';
		case 'music':
			return '<i class="fa-solid fa-file-music"></i>';
		default:
			return '<i class="far fa-file">';
	}
}