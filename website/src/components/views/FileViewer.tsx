import MimeType from 'mime-types';
import Image from 'next/image';
import type { fileItem } from '@/types';
import { VideoPlayer, TextViewer } from '@/components';

interface Props {
  file: fileItem
  userId: string
}

export default function FileViewer({ file }: Props) {
	const mimeType = MimeType.lookup(file.name);
	if (mimeType == false) return <TextViewer path={`/content/${file.userId}${file.path}`} />;


	switch (mimeType.split('/')[0]) {
		case 'image':
			return <Image className="center" src={`/content/${file.userId}${file.path}`}
				alt={file.name} width={1000} height={1000} style={{ maxHeight: '80vh', maxWidth: '80vw', height: 'auto' }}
			/>;
		case 'video':
			return <VideoPlayer path={file.path} userId={file.userId} />;
		case 'text':
			return <TextViewer path={`/content/${file.userId}${file.path}`} />;
		case 'audio':
		case 'application':
	}
}