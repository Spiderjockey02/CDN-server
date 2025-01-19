import { Request, Response } from 'express';
import { Error, sanitiseObject } from '../utils';
import bcrypt from 'bcrypt';
import { getSession } from '../middleware';
import emailValidate from 'deep-email-validator';
import { Client } from 'src/helpers';

// Endpoint: POST /api/auth/login
export const postLogin = (client: Client) => {
	return async (req: Request, res: Response) => {
		const { password, email } = req.body;

		try {
			const user = await client.userManager.fetchbyParam({ email });
			if (!user) return Error.InvalidLogin(res);

			// Check to ensure passwords match
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) return Error.InvalidLogin(res);

			res.json({ success: 'User successfully logged in', user: sanitiseObject(user) });
		} catch (err) {
			client.logger.error(err);
			Error.GenericError(res, 'Failed to fetch user information.');
		}
	};
};

// Endpoint: POST /api/auth/register
export const postRegister = (client: Client) => {
	return async (req: Request, res: Response) => {
	// Only post request
		const { username, email, password, password2 } = req.body.data;

		// Check all fields were filled in
		if (!username) return Error.IncorrectQuery(res, { type: 'username', text: 'Missing field' });
		if (!email) return Error.IncorrectQuery(res, { type: 'email', text: 'Missing field' });
		if (!password) return Error.IncorrectQuery(res, { type: 'password', text: 'Missing field' });
		if (!password2) return Error.IncorrectQuery(res, { type: 'password', text: 'Missing field' });

		// check if passwords match
		if (password !== password2) return Error.IncorrectQuery(res, { type: 'password', text: 'Passwords dont match!' });

		// check if password is more than 6 characters
		if (password.length <= 8) return Error.IncorrectQuery(res, { type: 'password', text: 'Password must be atleast 8 characters long!' });

		// Check if email already is being used
		const isEmailAlreadyBeingUsed = await client.userManager.fetchbyParam({ email });
		if (isEmailAlreadyBeingUsed !== null) return Error.IncorrectQuery(res, { type: 'email', text: 'Email already being used.' });

		const isEmailValid = await emailValidate(email);
		if (!isEmailValid.valid) return Error.IncorrectQuery(res, { type: 'email', text: 'Email is invalid.' });

		// Encrypt password (Dont save raw password to database)
		let Hashpassword;
		try {
			const salt = await bcrypt.genSalt(10);
			Hashpassword = await bcrypt.hash(password, salt);
		} catch (err) {
			client.logger.error(err);
			return Error.GenericError(res, 'Failed to register new user.');
		}

		// Save the new user to database + make sure to create folder
		try {
			const user = await client.userManager.create({ email, name: username, password: Hashpassword });
			await client.notificationManager.create({ userId: user.id, text: 'Please remember to verify your email.' });
			res.json({ success: 'User successfully created' });
		} catch (err) {
			client.logger.error(err);
			Error.GenericError(res, 'Failed to register new user.');
		}
	};
};

// Endpoint: GET /api/auth/session/:userId
export const getSessionUserId = (client: Client) => {
	return async (req: Request, res: Response) => {
		try {
			const session = await getSession(req);
			if (!session?.user) return Error.InvalidSession(res);
			const userId = req.params.userId;

			const user = await client.userManager.fetchbyParam({ id: userId });
			res.json({ user: sanitiseObject(user) });
		} catch (err) {
			client.logger.error(err);
			Error.GenericError(res, 'Failed to fetch session information.');
		}
	};
};