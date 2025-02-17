import '@/styles/globals.scss';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import 'bootstrap/dist/css/bootstrap.css';
import { useEffect } from 'react';
import Header from '../components/header';
import { FileProvider } from '@/components/fileManager';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
	useEffect(() => {
		require('bootstrap/dist/js/bootstrap.bundle.min.js');
	}, []);

	return (
		<SessionProvider session={session}>
			<Header />
			<FileProvider>
				<Component {...pageProps} />
			</FileProvider>
		</SessionProvider>
	);
}
