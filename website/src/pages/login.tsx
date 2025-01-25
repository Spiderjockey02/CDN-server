import { useState } from 'react';
import type { BaseSyntheticEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import type { SignInResponse } from 'next-auth/react';
import ErrorPopup from '../components/menus/Error-pop';
import type { GetServerSidePropsContext } from 'next';
import { getServerSession } from 'next-auth/next';
import Link from 'next/link';
import { AuthOption } from './api/auth/[...nextauth]';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';
import InputForm from '@/components/Form/InputForm';

type ErrorTypes = {
 type: | 'email' | 'password' | 'misc'
 message: string
}

export default function SignIn() {
	const [errors, setErrors] = useState<ErrorTypes[]>([]);
	const [user, setUser] = useState({
		email: '',
		password: '',
	});
	const router = useRouter();

	const handleSubmit = async (event: BaseSyntheticEvent) => {
		event.preventDefault();
		const err = [] as ErrorTypes[];

		// Make sure both fields are filled in
		if (user.email.length == 0) err.push({ type: 'email', message: 'This field is missing.' });
		if (user.password.length == 0) err.push({ type: 'password', message: 'This field is missing.' });

		// Show errors if there are any
		if (err.length !== 0) return setErrors(err);

		// Try and sign in the user
		const res = await signIn('credentials', {
			redirect: false,
			callbackUrl: `${window.location.search.split('=')[1]}`,
			email: user.email,
			password: user.password,
		}) as SignInResponse;

		// Show errors if any
		if (res.error) {
			if (res.error == 'Invalid username or password.') {
				return setErrors([
					{ type: 'password', message: res.error }, { type: 'email', message: res.error },
				]);
			}
			return setErrors([{ type: 'misc', message: 'Failed to login.' }]);
		}

		// Move to the callback URL so user knows they are logged in
		router.push(res.url as string);
	};

	return (
		<section className='d-flex flex-row align-items-center' style={{ 'backgroundColor': '#eee', padding: '0', minHeight: '100vh' }}>
			<div className="container h-100">
				{errors.find(e => e.type == 'misc') && (
					<ErrorPopup text={`${errors.find(e => e.type == 'misc')?.message}`}/>
				)}
				<div className="row d-flex justify-content-center align-items-center h-100">
					<div className="col-lg-8 col-xl-7">
						<div className="d-flex justify-content-center align-items-center vh-100">
							<div className="card w-100" style={{ 'borderRadius': '25px' }}>
								<div className="card-body d-flex flex-column align-items-center">
									<h1 className="h1 fw-bold mb-4">Login</h1>
									<form className="w-100" onSubmit={handleSubmit}>
										<div className="mb-3 w-100">
											<InputForm title='Email' type="email" name='email' onChange={(e) => setUser(u => ({ ...u, email: e.target.value }))} errorMsg={errors.find(e => e.type == 'email')?.message} />
										</div>
										<div className="mb-3 w-100">
											<InputForm title='Password' type="password" name='password' autocomplete='current-password' onChange={(e) => setUser(u => ({ ...u, password: e.target.value }))} errorMsg={errors.find(e => e.type == 'password')?.message} />
										</div>
										<div className="d-flex justify-content-center mb-3">
											<button type="submit" className="btn btn-primary btn-lg">Login</button>
										</div>
										<p className="text-center">Need an account? <Link href="/register">Register</Link></p>
									</form>
									<div className="d-flex justify-content-around w-100 visually-hidden">
										<form action="/api/auth/signin/twitter" method="post">
											<button className='btn btn-secondary' type="submit">
												<FontAwesomeIcon icon={faXTwitter}/> Twitter
											</button>
										</form>
										<form action="/api/auth/signin/twitter" method="post">
											<button className='btn btn-secondary' type="submit">
												<FontAwesomeIcon icon={faXTwitter}/> Twitter
											</button>
										</form>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const session = await getServerSession(context.req, context.res, AuthOption);

	// Only show this page if they are not logged in
	if (session) {
		return {
			redirect: {
				destination: '/files',
				permanent: false,
			},
		};
	} else {
		return { props: {} };
	}
}
