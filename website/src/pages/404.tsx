import MainLayout from '@/layouts/main';
import Link from 'next/link';

export default function FourOhFour() {
	return (
		<MainLayout>
			<div className="page-wrap d-flex flex-row align-items-center" style={{ backgroundColor:'#f1f6fe', minHeight: '70vh' }}>
				<div className="container justify-content-center text-center">
					<span className="display-1">404</span>
					<div className="lead">The page you are looking for was not found.</div>
					<Link href="/" className="btn btn-link">Back to Home</Link>
				</div>
			</div>
		</MainLayout>
	);
}
