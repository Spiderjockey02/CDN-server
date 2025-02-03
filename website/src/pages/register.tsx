import { useState } from 'react';
import { useRouter } from 'next/router';
import type { BaseSyntheticEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ErrorPopup from '../components/menus/Error-pop';
import axios from 'axios';
import { getServerSession } from 'next-auth/next';
import type { GetServerSidePropsContext } from 'next';
import { AuthOption } from './api/auth/[...nextauth]';
import InputForm from '@/components/Form/InputForm';
type ErrorTypes = {
 type: 'username' | 'email' | 'password' | 'age' | 'misc'
 message: string
}

export default function Register() {
	const [disabled, setDisabled] = useState(true);
	const [errors, setErrors] = useState<ErrorTypes[]>([]);
	const [user, setUser] = useState({
		username: '',
		email: '',
		password: '',
		password2: '',
	});
	const [birth, setBirth] = useState<Date | null>(null);


	const router = useRouter();

	const handleSubmit = async (event: BaseSyntheticEvent) => {
		event.preventDefault();

		// Check if a username was entered
		if (user.username.length == 0) {
			return setErrors([{ type: 'username', message: 'This field is missing.' }]);
		} else if (user.username.includes('bad')) {
			// Sanitise usernames (Show error of what characters are invalid)
			return setErrors([{ type: 'username', message: 'Contains prohibited words/letters.' }]);
		}

		// Check if an email was entered
		if (user.email.length == 0) return setErrors([{ type: 'email', message: 'This field is missing.' }]);

		// Make sure passwords match
		if (user.password.length == 0 || user.password2.length == 0) {
			return setErrors([{ type: 'password', message: 'This field is missing.' }]);
		} else if (user.password != user.password2) {
			return setErrors([{ type: 'password', message: 'The passwords do not match.' }]);
		} else if (user.password.length <= 8) {
			return setErrors([{ type: 'password', message: 'Your password must be more than 8 characters.' }]);
		}

		// Make sure DOB was entered
		if (birth == null) return setErrors([{ type: 'age', message: 'This field is missing.' }]);

		// Make sure the user isn't younger than 16 years old.
		if (birth >= new Date(new Date().setFullYear(new Date().getFullYear() - 16))) {
			return setErrors([{ type: 'age', message: 'You must be 16 years and older to use this site.' }]);
		}

		// Create the new user
		const { data } = await axios.post('/api/auth/register', {
			data: {
				username: user.username,
				email: user.email,
				password: user.password,
				password2: user.password,
			},
		});

		// Check if an error was included
		if (data.error) return setErrors([{ type: data.error.type, message: data.error.text }]);
		if (data.success) router.push('/login');
	};

	const changeState = () => setDisabled(!disabled);

	return (
		<section className='d-flex flex-row align-items-center' style={{ 'backgroundColor': '#eee', padding: '0', minHeight: '100vh' }}>
			<div className="container">
				{errors.find(i => i.type == 'misc') &&
      	 <ErrorPopup text={errors.find(i => i.type == 'misc')?.message as string}/>
				}
				<div className="row d-flex justify-content-center align-items-center">
					<div className="col-lg-12 col-xl-11">
						<div className="card text-black" style={{ 'borderRadius': '25px' }}>
							<div className="card-body p-md-5">
								<div className="row">
									<div className="col-lg-6 order-2 order-lg-1">
										<p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Sign up</p>
										<form className="mx-1 mx-md-4" onSubmit={handleSubmit}>
											<InputForm title="Username" name="username" onChange={(e) => setUser(u => ({ ...u, username: e.target.value }))} errorMsg={errors.find(e => e.type == 'username')?.message} />

											<InputForm title="Email" name="email" type='email' onChange={(e) => setUser(u => ({ ...u, email: e.target.value }))} errorMsg={errors.find(e => e.type == 'email')?.message} />

											<div className="d-flex flex-row align-items-center">
												<div className="row">
													<div className="col-sm-6">
														<InputForm title="Password" name="password" type='password' autocomplete='new-password' onChange={(e) => setUser(u => ({ ...u, password: e.target.value }))} errorMsg={errors.find(e => e.type == 'password')?.message} />
													</div>
													<div className="col-sm-6">
														<InputForm title="Repeat password" name="password2" type='password' autocomplete='new-password' onChange={(e) => setUser(u => ({ ...u, password2: e.target.value }))} errorMsg={errors.find(e => e.type == 'password')?.message} />
													</div>
												</div>
											</div>
											<div className="form-outline row flex-fill">
												<InputForm type="date" title="Date of birth" name="dob" autocomplete="bday" onChange={(e) => setBirth(e.target.valueAsDate)} errorMsg={errors.find(e => e.type == 'age')?.message} />
											</div>
											&nbsp;
											<div className="form-check d-flex justify-content-center mb-5">
												<input className="form-check-input me-2" type="checkbox" value="" id="T&S" onClick={changeState}/>
												<label className="form-check-label" htmlFor="T&S">
                  				I agree to the <Link href="/terms-of-service">Terms of service</Link>.
												</label>
											</div>

											<div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
												<button type="submit" className="btn btn-primary btn-lg" disabled={disabled}>Register</button>
											</div>
										</form>
										<p>Already have an account? <Link href="/login">Click here</Link></p>
									</div>
									<div className="col-lg-6 d-flex align-items-center order-1 order-lg-2">
										<Image src="/register.webp"
											className="img-fluid" alt="Sample image" width={530} height={280}/>
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
