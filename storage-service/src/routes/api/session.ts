import { Router } from 'express';
import { deleteResetAvatar, getRecentlyViewed, postChangeAvatar, postChangeEmail, postChangePassword } from '../../controllers/session';
import { Client } from 'src/helpers';
const router = Router();

export default function(client: Client) {
	router.post('/change-password', postChangePassword(client));

	router.post('/change-avatar', postChangeAvatar(client));

	router.delete('/reset-avatar', deleteResetAvatar(client));

	router.post('/change-email', postChangeEmail(client));

	router.get('/recently-viewed', getRecentlyViewed(client));

	return router;
}
