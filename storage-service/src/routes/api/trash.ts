// For upload, delete, move etc endpoints
import { Router } from 'express';
import { getTrash } from '../../controllers/trash';
import { Client } from '../../helpers';
const router = Router();

export default function(client: Client) {
	// Fetch user's trash
	router.get('/', getTrash(client));

	return router;
}

