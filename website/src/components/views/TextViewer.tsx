import axios from 'axios';
import { useEffect, useState } from 'react';

interface Props {
  path: string
}

export default function TextReader({ path }: Props) {
	const [fileContent, setFileContent] = useState('');

	async function loadContent() {
		try {
			const { data } = await axios.get(`${path}`);
			setFileContent(data);
		} catch (err) {
			console.error('Error fetching file content:', err);
		}
	}

	useEffect(() => {
		loadContent();
	}, []);

	return (
		<div>
			&nbsp;
			<textarea rows={35} readOnly={true} value={fileContent} style={{ width: '100%' }}>
			</textarea>
		</div>
	);
}