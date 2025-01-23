import MimeType from 'mime-types';
import Image from 'next/image';
import type { fileItem } from '@/types';
import { VideoPlayer, TextViewer } from '@/components';
import { useRef, useState } from 'react';

interface Props {
  file: fileItem
  userId: string
}

export default function FileViewer({ file }: Props) {
	const [, setIsFullscreen] = useState(false);
	const imageRef = useRef<HTMLImageElement>(null);
	const mimeType = MimeType.lookup(file.name);

	function handleFullScreen() {
		if (!document.fullscreenElement) {
			imageRef.current?.requestFullscreen().catch(err => {
				console.error('Fullscreen request failed:', err);
			});
			setIsFullscreen(true);
		} else {
			document.exitFullscreen();
			setIsFullscreen(false);
		}
	}

	if (mimeType == false) return <TextViewer path={`/content/${file.userId}${file.path}`} />;
	switch (mimeType.split('/')[0]) {
		case 'image':
			return (
				<div className='d-flex justify-content-center' style={{ maxHeight: 'calc(100vh - 130px)' }}>
					<Image className="center" src={`/content/${file.userId}${file.path}`} onClick={handleFullScreen} ref={imageRef}
						alt={file.name} width={1000} height={1000} style={{ maxWidth: '100%', maxHeight: '100%', height: 'auto', width: 'auto', cursor: 'pointer' }}
					/>
				</div>
			);
		case 'video':
			return <VideoPlayer path={file.path} userId={file.userId} />;
		case 'text':
			return <TextViewer path={`/content/${file.userId}${file.path}`} />;
		case 'audio':
		case 'application':
	}
}