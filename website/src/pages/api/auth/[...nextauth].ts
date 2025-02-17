import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextApiRequest, NextApiResponse } from 'next';
import config from '@/config';
import type { AuthOptions } from 'next-auth';
import { encode } from 'next-auth/jwt';
import axios from 'axios';

export const AuthOption = {
	providers: [
		CredentialsProvider({
			id: 'credentials',
			name: 'credentials',
			credentials: {
				email: { label: 'email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) return null;
				try {
					const { data } = await axios.post(`${config.backendURL}/api/auth/login`, {
						password: credentials.password,
						email: credentials.email,
					});
					return (data.success) ? data.user : data.error;
				} catch (error) {
					if (axios.isAxiosError(error)) throw new Error(error.response?.data.error);
					throw new Error('Failed to login');
				}
			},
		}),
	],
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60,
	},
	secret: process.env.NEXTAUTH_SECRET,
	callbacks: {
		async jwt({ token, user }) {
			if (typeof user !== typeof undefined) token.user = user;
			return token;
		},
		async session({ session, token }) {
			if (token.user !== null) {
				const { data } = await axios.get(`${config.backendURL}/api/auth/session/${token.sub}`, {
					headers: {
						'content-type': 'application/json;charset=UTF-8',
						cookie: `next-auth.session-token=${await encode({ token, secret: process.env.NEXTAUTH_SECRET as string })};`,
					},
				});
				if (data.user) session.user = data.user;
			}

			// Ensure the user's account has not been deleted or removed (from the backend)
			if (token.user == null || session.user == null) return null;
			return session;
		},
		redirect: ({ url, baseUrl }) => {
			return url.startsWith(baseUrl) ? Promise.resolve(url)	: Promise.resolve(baseUrl);
		},
	},
	theme: {
		colorScheme: 'auto',
		brandColor: '',
		logo: '/vercel.svg',
	},
	pages: {
		signIn: '/login',
	},
	// Enable debug messages in the console if you are having problems
	debug: true,
} as AuthOptions;

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
	return NextAuth(req, res, AuthOption);
}
