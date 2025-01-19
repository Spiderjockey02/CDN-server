import type { Request, Response, NextFunction } from 'express';
import { ipRegex, Error } from '../utils';
import config from '../config';
import avatarForm from './avatar-form';
import parseForm from './parse-form';
import { decode } from 'next-auth/jwt';
import type { JWT } from 'next-auth/jwt';

export function getIP(req: Request) {
	if (req.headers) {
		// Standard headers used by Amazon EC2, Heroku, and others.
		if (ipRegex.test(req.headers['x-client-ip'] as string)) return req.headers['x-client-ip'];

		// CF-Connecting-IP - applied to every request to the origin. (Cloudflare)
		if (ipRegex.test(req.headers['cf-connecting-ip'] as string)) return req.headers['cf-connecting-ip'];

		// Fastly and Firebase hosting header (When forwared to cloud function)
		if (ipRegex.test(req.headers['fastly-client-ip'] as string)) return req.headers['fastly-client-ip'];

		// Akamai and Cloudflare: True-Client-IP.
		if (ipRegex.test(req.headers['true-client-ip'] as string)) return req.headers['true-client-ip'];

		// Default nginx proxy/fcgi; alternative to x-forwarded-for, used by some proxies.
		if (ipRegex.test(req.headers['x-real-ip'] as string)) return req.headers['x-real-ip'];

		// (Rackspace LB and Riverbed's Stingray)
		// http://www.rackspace.com/knowledge_center/article/controlling-access-to-linux-cloud-sites-based-on-the-client-ip-address
		// https://splash.riverbed.com/docs/DOC-1926
		if (ipRegex.test(req.headers['x-cluster-client-ip'] as string)) return req.headers['x-cluster-client-ip'];

		if (ipRegex.test(req.headers['x-forwarded-for'] as string)) return req.headers['x-forwarded-for'];

		if (ipRegex.test(req.headers['forwarded-for'] as string)) return req.headers['forwarded-for'];

		if (ipRegex.test(req.headers.forwarded as string)) return req.headers.forwarded;
	}

	// Remote address checks.
	if (req.socket && ipRegex.test(req.socket.remoteAddress as string)) return req.socket.remoteAddress;
	return req.ip;
}

export async function getSession(req: Request): Promise<JWT | null> {
	if (req.headers.cookie == undefined) return null;

	// get Session token from cookies
	const cookies: string[] = req.headers['cookie'].split('; ');
	const parsedcookies = cookies.map((i: string) => i.split('='));

	// Get session token (Could be secure or not so check both)
	let sessionToken = parsedcookies.find(i => i[0] == '__Secure-next-auth.session-token')?.[1];
	if (sessionToken == null) sessionToken = parsedcookies.find(i => i[0] == 'next-auth.session-token')?.[1];
	if (!sessionToken) return null;

	try {
		const session = await decode({ token: sessionToken, secret: config.NEXTAUTH_SECRET });
		// Makes sure the token is valid
		if (session == null) return null;

		// Make sure the token hasn't expired
		if (session.exp <= (new Date().getTime() / 1000)) return null;

		return session;
	} catch (err) {
		console.log(err);
		return null;
	}
}

export async function checkAdmin(req: Request, res: Response, next: NextFunction) {
	const session = await getSession(req);
	if (session == null) return Error.InvalidSession(res);

	if (session.user?.group?.name == 'Admin') return next();
	return Error.InvalidSession(res);
}

export { avatarForm, parseForm };