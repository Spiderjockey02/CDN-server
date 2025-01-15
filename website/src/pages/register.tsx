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
type ErrorTypes = {
 type: 'username' | 'email' | 'password' | 'age' | 'misc'
 error: string
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
	const [birth, setBirth] = useState({
		day: 0,
		month: 0,
		year: 0,
	});


	const router = useRouter();

	const handleSubmit = async (event: BaseSyntheticEvent) => {
		event.preventDefault();

		// Check if a username was entered
		if (user.username.length == 0) {
			return setErrors([{ type: 'username', error: 'This field is missing' }]);
		} else if (user.username.includes('bad')) {
			// Sanitise usernames (Show error of what characters are invalid)
			return setErrors([{ type: 'username', error: 'Contains prohibited words/letters.' }]);
		}

		// Check if an email was entered
		if (user.email.length == 0) return setErrors([{ type: 'email', error: 'This field is missing' }]);

		// Make sure passwords match
		if (user.password.length == 0 || user.password2.length == 0) {
			return setErrors([{ type: 'password', error: 'This field is missing' }]);
		} else if (user.password != user.password2) {
			return setErrors([{ type: 'password', error: 'The passwords do not match' }]);
		} else if (user.password.length <= 8) {
			return setErrors([{ type: 'password', error: 'Your password must be more than 8 characters' }]);
		}

		// Make sure it's a valid date of birth (for example not 30 days in February)
		if (typeof Date.parse(`${birth.month} ${birth.day} ${birth.year}`) !== 'number') {
			return setErrors([{ type: 'age', error: 'Invalid date of birth' }]);
		} else if (birth.year >= (new Date().getFullYear() - 13)) {
			// Make sure the user isn't younger than 13 years old.
			return setErrors([{ type: 'age', error: 'You are too young to use this website.' }]);
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
		if (data.error) return setErrors([{ type: data.error.type, error: data.error.text }]);
		if (data.success) router.push('/login');
	};

	const changeState = () => setDisabled(!disabled);

	return (
		<section className="vh-100" style={{ 'backgroundColor': '#eee' }}>
			<div className="container h-100">
				{errors.find(i => i.type == 'misc') &&
      	 <ErrorPopup text={errors.find(i => i.type == 'misc')?.error as string}/>
				}
				<div className="row d-flex justify-content-center align-items-center h-100">
					<div className="col-lg-12 col-xl-11">
						<div className="card text-black" style={{ 'borderRadius': '25px' }}>
							<div className="card-body p-md-5">
								<div className="row justify-content-center">
									<div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">
										<p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Sign up</p>
										<form className="mx-1 mx-md-4" onSubmit={handleSubmit}>
											<div className="d-flex flex-row align-items-center mb-4">
												<i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
												<div className="form-outline flex-fill mb-0">
													{errors.find(i => i.type == 'username') ?
														<label className="form-label text-danger" htmlFor="username">Username - {errors.find(i => i.type == 'username')?.error}</label>
														: <label className="form-label" htmlFor="username">Username</label>
													}
													<input type="text" id="username" className="form-control" name="username" onChange={(e) => setUser(u => ({ ...u, username: e.target.value }))} />
												</div>
											</div>

											<div className="d-flex flex-row align-items-center mb-4">
												<i className="fas fa-user fa-lg me-3 fa-fw"></i>
												<div className="form-outline flex-fill mb-0">
													{errors.find(i => i.type == 'email') ?
														<label className="form-label text-danger" htmlFor="email">Email - {errors.find(i => i.type == 'email')?.error}</label>
														: <label className="form-label" htmlFor="email">Email</label>
													}
													<input type="email" id="email" className="form-control" name="email" onChange={(e) => setUser(u => ({ ...u, email: e.target.value }))} />
												</div>
											</div>

											<div className="d-flex flex-row align-items-center mb-4">
												<i className="fas fa-lock fa-lg me-3 fa-fw"></i>
												<div className="row">
													<div className="col-sm-6">
														<div className="form-outline flex-fill mb-0">
															{errors.find(i => i.type == 'password') ?
																<label className="form-label text-danger" htmlFor="password">Password - {errors.find(i => i.type == 'password')?.error}</label>
																: <label className="form-label" htmlFor="password">Password</label>
															}
															<input type="password" id="password" className="form-control" onChange={(e) => setUser(u => ({ ...u, password: e.target.value }))} />
														</div>
													</div>
													<div className="col-sm-6">
														<div className="form-outline flex-fill mb-0">
															<label className="form-label" htmlFor="password">Repeat Password</label>
															<input type="password" id="password2" className="form-control" onChange={(e) => setUser(u => ({ ...u, password2: e.target.value }))} />
														</div>
													</div>
												</div>
											</div>

											<div className="d-flex flex-row align-items-center mb-4">
												<div className="form-outline row flex-fill mb-0" style={{ 'paddingLeft': '15px' }}>
													{errors.find(i => i.type == 'age') ?
														<label className="form-label text-danger">Date of birth - {errors.find(i => i.type == 'age')?.error}</label>
														: <label className="form-label">Date of birth</label>
													}
													<div className="col-sm-4">
														<select className="form-select" aria-label="Default select example" id="day" name="day" onChange={(e) => setBirth(b => ({ ...b, day:  Number(e.target.value) }))}>
															<option defaultValue="true" disabled>Day</option>
															{[...Array(31)].map((_, index) => (
																<option key={index} value={String(index + 1)}>{index + 1}</option>
															))}
														</select>
													</div>
													<div className="col-sm-4">
														<select className="form-select" aria-label="Default select example" id="month" name="month" onChange={(e) => setBirth(b => ({ ...b, month: Number(e.target.value) }))}>
															<option defaultValue="true" disabled>Month</option>
															{[ 'January', 'February', 'March', 'April', 'May', 'June',
																'July', 'August', 'September', 'October', 'November', 'December' ].map((i, index) => (
																<option key={index} value={String(index)}>{i}</option>
															))}
														</select>
													</div>
													<div className="col-sm-4">
														<select className="form-select" aria-label="Default select example" id="year" name="year" onChange={(e) => setBirth(b => ({ ...b, year:  Number(e.target.value) }))}>
															<option defaultValue="true" disabled>Year</option>
															{[...Array(100)].map((_, index) => (
																<option key={index} value={String(new Date().getFullYear() - index)}>{new Date().getFullYear() - index}</option>
															))}
														</select>
													</div>
												</div>
											</div>

											<div className="form-check d-flex justify-content-center mb-5">
												<input className="form-check-input me-2" type="checkbox" value="" id="T&S" onClick={changeState}/>
												<label className="form-check-label" htmlFor="T&S">
                  				I agree to the <a href="/terms">Terms of service</a>.
												</label>
											</div>

											<div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
												<button type="submit" className="btn btn-primary btn-lg" disabled={disabled}>Register</button>
											</div>
										</form>
										<p>Already have an account? <Link href="/login">Click here</Link></p>
									</div>
									<div className="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
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
