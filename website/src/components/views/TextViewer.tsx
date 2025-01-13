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
			<h1>File Content</h1>
			<textarea rows={35} cols={200} readOnly={true} value={fileContent}>
			</textarea>
		</div>
	);
}