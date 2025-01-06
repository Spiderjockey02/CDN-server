import { Router } from 'express';
import { getAvatar, getThumbnail, getContent, getStatistics } from '../controllers';
import { Client } from 'src/helpers';
const router = Router();

export default function(client: Client) {
	router.get('/avatar/:userId?', getAvatar());

	router.get('/thumbnail/:userid/:path(*)', getThumbnail(client));

	router.get('/content/:userid/:path(*)', getContent(client));

	router.get('/api/statistics', getStatistics(client));
	return router;
}
