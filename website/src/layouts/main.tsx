import { Footer, HomeNavbar } from '@/components';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function MainLayout({ children }: Props) {
	return (
		<>
			<HomeNavbar />
			<div style={{ paddingTop: '60px' }}>
				{children}
			</div>
			<Footer />
		</>
	);
}