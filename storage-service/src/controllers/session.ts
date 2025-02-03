import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { avatarForm, getSession } from '../middleware';
import { Error, sanitiseObject } from '../utils';
import emailValidate from 'deep-email-validator';
import { Client } from 'src/helpers';
import { Prisma } from '@prisma/client';

// Endpoint: POST /api/session/change-password
export const postChangePassword = (client: Client) => {
	return async (req: Request, res: Response) => {
		try {
			const session = await getSession(req);
			if (!session?.user) return Error.InvalidSession(res);

			const { currentPassword, password, password2 } = req.body;

			// Check for missing fields
			if (!password) return res.json({ type: 'pwd1', error: 'Missing field' });
			if (!password2) return res.json({ type: 'pwd2', error: 'Missing field' });

			// check if passwords match
			if (password !== password2) return res.json({ type: 'pwd1', error: 'The passwords do not match' });

			// check if password is more than 8 characters
			if (password?.length <= 8) return res.json({ type: 'pwd1', error: 'Your password must be more than 8 characters' });

			const user = await client.userManager.fetchbyParam({ id: session.user.id });
			if (!user) return res.json({ type: 'misc', error: 'Invalid request' });

			const isMatch = await bcrypt.compare(currentPassword, user.password as string);
			if (!isMatch) return res.json({ type: 'current', error: 'Password is Incorrect' });

			const salt = await bcrypt.genSalt(10);
			const hashedPwd = await bcrypt.hash(password, salt);
			await client.userManager.update({ id: session.user.id, password: hashedPwd });
			res.json({ success: 'Successfully updated password.' });
		} catch (err) {
			client.logger.error(err);
			res.json({ type: 'misc', error: 'Failed to update password.' });
		}
	};
};

// Endpoint: POST /api/session/change-avatar
export const postChangeAvatar = (client: Client) => {
	return async (req: Request, res: Response) => {
		try {
			const session = await getSession(req);
			if (!session?.user) return Error.InvalidSession(res);

			// Parse and save file(s)
			await avatarForm(req, session.user.id);
			return res
				.json({ success: 'Successfully uploaded user\'s avatar' });
		} catch (err) {
			client.logger.error(err);
			Error.GenericError(res, 'Failed to upload file.');
		}
	};
};

// Endpoint: POST /api/session/change-email
export const postChangeEmail = (client: Client) => {
	return async (req: Request, res: Response) => {
		try {
			const session = await getSession(req);
			if (!session?.user) return Error.InvalidSession(res);
			const { email } = req.body;

			const isEmailValid = await emailValidate(email);
			if (!isEmailValid.valid) return Error.IncorrectQuery(res, 'Invalid email.');

			// Update user's email
			await client.userManager.update({ id: session.user.id, email });
			res.json({ success: 'Successfully updated email.' });
		} catch (err) {
			client.logger.error(err);
			if (err instanceof Prisma.PrismaClientKnownRequestError) {
				if (err.code === 'P2002') return Error.GenericError(res, 'Email is already in use.');
			} else {
				Error.GenericError(res, 'Failed to update email.');
			}
		}
	};
};

// Endpoint: GET /api/session/recently-viewed
export const getRecentlyViewed = (client: Client) => {
	return async (req: Request, res: Response) => {
		try {
			const session = await getSession(req);
			if (!session?.user) return Error.InvalidSession(res);

			const files = await client.recentlyViewedFileManager.fetchUserLatest(session.user.id);
			res.json({ files: sanitiseObject(files) });
		} catch (err) {
			client.logger.error(err);
			Error.GenericError(res, 'Failed to fetch recently viewed files.');
		}
	};
};

// Endpoint DELETE /api/session/reset-avatar
export const deleteResetAvatar = (client: Client) => {
	return async (req: Request, res: Response) => {
		try {
			const session = await getSession(req);
			if (!session?.user) return Error.InvalidSession(res);

			await client.FileManager.deleteAvatar(session.user.id);
			res.json({ success: 'Successfully deleted avatar' });
		} catch (err) {
			client.logger.error(err);
			Error.GenericError(res, 'Failed to delete user\'s avatar.');
		}
	};
};

// Endpoint DELETE /api/session/notifications/:id
export const deleteNotification = (client: Client) => {
	return async (req: Request, res: Response) => {
		const notifId = req.params.id;

		try {
			const session = await getSession(req);
			if (!session?.user) return Error.InvalidSession(res);

			// Get the notification from the database and make sure it exists and is owned by the person in session.
			const notification = await client.notificationManager.getById(notifId);
			if (!notification) return Error.IncorrectQuery(res, 'Notification not found.');
			if (notification.userId !== session.user.id) return Error.InvalidSession(res);

			await client.notificationManager.delete(notifId);
			res.json({ success: 'Successfully deleted notification.' });
		} catch (err) {
			client.logger.error(err);
			Error.GenericError(res, 'Failed to delete user\'s avatar.');
		}
	};
};