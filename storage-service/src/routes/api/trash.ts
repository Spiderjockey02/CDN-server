// For upload, delete, move etc endpoints
import { Router } from 'express';
import { deleteEmpty, getTrash, putRestore } from '../../controllers/trash';
import { Client } from '../../helpers';
const router = Router();

export default function(client: Client) {
	// Fetch user's trash
	router.get('/', getTrash(client));

	// Empty the bin (Delete everything in the trash)
	router.delete('/empty', deleteEmpty(client));

	// Restore a file from the trash
	router.put('/restore', putRestore(client));

	return router;
}

