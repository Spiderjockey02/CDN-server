import { ModalProps } from '@/types/Components/UI';

export default function Modal({ id, title, description, onSubmit }: ModalProps) {
	return (
		<div className="modal fade" id={id} aria-hidden="true">
			<div className="modal-dialog modal-dialog-centered">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title text-truncate">{title}</h5>
						<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
					</div>
					<div className="modal-body">
        		{description}
					</div>
					<div className="modal-footer">
						<form onSubmit={onSubmit} method="post">
							<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              &nbsp;
							<button className="btn btn-primary" type="submit" id="imagefile">Delete</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}