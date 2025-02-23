export interface PopupProps {
  text: string
	onClose?: () => void
}

export interface UploadStatusToastProps {
  percentage: number
  filename: string
  show: boolean
	timeRemaining: string
	cancelUpload: () => void
}