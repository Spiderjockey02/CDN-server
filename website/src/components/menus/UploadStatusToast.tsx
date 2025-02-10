interface Props {
  percentage: number
  filename: string
  show: boolean
	timeRemaining: string
	cancelUpload: () => void
}

export default function UploadStatusToast({ percentage, filename, show, timeRemaining, cancelUpload }: Props) {
	if (!show) return null;
	return (
		<div className="toast-container position-fixed bottom-0 end-0 p-3">
			<div id="liveToast" className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
				<div className="toast-header">
					<strong className="me-auto">Uploading ({percentage}%)</strong>
					<small>{timeRemaining}</small>
					<button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close" onClick={cancelUpload}></button>
				</div>
				<div className="toast-body">
					{filename}
				</div>
			</div>
		</div>
	);
}
