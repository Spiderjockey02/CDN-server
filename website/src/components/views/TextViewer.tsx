import { TextViewerProps } from '@/types/Components/Views';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export default function TextViewer({ path }: TextViewerProps) {
	const [fileContent, setFileContent] = useState('');

	const loadContent = useCallback(async () => {
		const controller = new AbortController();

		try {
			const { data } = await axios.get(path, { signal: controller.signal });
			setFileContent(data);
		} catch (err) {
			if (!axios.isCancel(err)) console.error('Error fetching file content:', err);
		}

		return () => controller.abort();
	}, [path]);

	useEffect(() => {
		loadContent();
	}, [loadContent]);

	return (
		<textarea rows={35} readOnly value={fileContent} style={{ width: '100%' }} />
	);
}