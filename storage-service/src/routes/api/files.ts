// For upload, delete, move etc endpoints
import { Router } from 'express';
import { postCopyFile, postCreateFolder, deleteFile, getDownloadFile, getFiles, postMoveFile, postFileUpload, postRenameFile, getSearchFile } from '../../controllers/files';
import { Client } from 'src/helpers';
const router = Router();

export default function(client: Client) {
	// Fetch user's uploaded files
	router.get('/?:path(*)', getFiles(client));

	// Upload a new file
	router.post('/upload', postFileUpload(client));

	// Delete a file/folder
	router.delete('/delete', deleteFile(client));

	// Move a file/folder to a new directory
	router.post('/move', postMoveFile(client));

	// Copy a file to a new directory
	router.post('/copy', postCopyFile(client));

	// Download folder
	router.get('/download', getDownloadFile(client));

	// Rename a file/folder
	router.post('/rename', postRenameFile(client));

	// Search for a file
	router.get('/search', getSearchFile(client));

	// Create a new folder
	router.post('/create-folder', postCreateFolder(client));

	return router;
}

