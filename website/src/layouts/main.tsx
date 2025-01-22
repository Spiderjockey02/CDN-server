import { Footer, HomeNavbar } from '@/components';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function MainLayout({ children }: Props) {
	return (
		<>
			<HomeNavbar />
			{children}
			<Footer />
		</>
	);
}