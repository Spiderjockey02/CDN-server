import { VideoPlayer, TextViewer } from '@/components';
import type { fileItem } from '@/types';
import MimeType from 'mime-types';
import { useRef } from 'react';
import Image from 'next/image';

interface Props {
  file: fileItem
  userId: string
}

export default function FileViewer({ file }: Props) {
	const imageRef = useRef<HTMLImageElement>(null);
	const mimeType = MimeType.lookup(file.name);

	function handleFullScreen() {
		if (imageRef.current) {
			if (!document.fullscreenElement) {
				imageRef.current.requestFullscreen().catch(err => console.error('Fullscreen request failed:', err));
			} else {
				document.exitFullscreen();
			}
		}
	}

	// Handle text files or unknown mime types
	if (!mimeType || mimeType.startsWith('text') || mimeType == 'application/javascript') return <TextViewer path={`/content/${file.userId}${file.path}`} />;

	// Handle PDF files
	if (mimeType == 'application/pdf') {
		return (
			<object data={`/content/${file.userId}${file.path}`} type="application/pdf" style={{ width: '100%', height: '80vh' }}>
				<p>Alternative text - include a link <a href={`/content/${file.userId}${file.path}`}>to the PDF!</a></p>
			</object>
		);
	}

	switch (mimeType.split('/')[0]) {
		case 'image':
			return (
				<div className='d-flex justify-content-center' style={{ maxHeight: 'calc(100vh - 130px)' }}>
					<Image className="center" src={`/content/${file.userId}${file.path}`} onClick={handleFullScreen} ref={imageRef}
						alt={file.name} width={1000} height={1000} style={{ width: 'auto', maxHeight: '100%', cursor: 'pointer' }}
					/>
				</div>
			);
		case 'video':
			return <VideoPlayer path={file.path} userId={file.userId} />;
		case 'audio':
		case 'application':
		default:
			<div className="text-center">
				<p>Unsupported file type: {mimeType}</p>
				<a href={`/content/${file.userId}${file.path}`} className="btn btn-primary">Download File</a>
			</div>;
	}
}