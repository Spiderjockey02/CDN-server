import { FileNavBar, Sidebar } from '@/components';
import { User } from '@/types';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode
  user: User
}

export default function FileLayout({ children, user }: Props) {
	return (
		<div className="wrapper" style={{ height:'100vh' }}>
			<Sidebar user={user} />
			<div className="container-fluid" style={{ overflowY: 'scroll' }}>
				<FileNavBar user={user} />
				<div className="container-fluid">
					{children}
				</div>
			</div>
		</div>
	);
}