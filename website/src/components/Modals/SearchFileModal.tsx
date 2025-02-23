export default function SearchFileModal() {
	return (
		<div className="modal fade" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
			<div className="modal-dialog modal-dialog-centered">
				<div className="modal-content">
					<form action="/search" method="GET">
						<div className="modal-header">
							<h1 className="modal-title fs-5" id="exampleModalLabel">Search for file</h1>
							<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div className="modal-body">
							<input type="text" id="myInput" className="form-input form-control text-truncate" style={{ border:'none', backgroundColor:'#f4f4f4' }} placeholder="Search files and folders" name="query" autoComplete="off" />
								&nbsp;
							<div className="row">
								<div className="form-group col-6">
									<label htmlFor="inputGroupSelect01">File type(s)</label>
									<select className="form-select" id="fileTypeSelector" name="fileType">
										<option value="0">Any type</option>
										<option value="1">Files</option>
										<option value="2">Folders</option>
									</select>
								</div>
								<div className="form-group col-6">
									<label htmlFor="inputGroupSelect01">Date updated</label>
									<select className="form-select" id="dateUpdatedSelector" name="dateUpdated">
										<option value="0">Any time</option>
										<option value="1">Past day</option>
										<option value="2">Past week</option>
										<option value="3">Past month</option>
										<option value="4">Past year</option>
									</select>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
							<button type="submit" className="btn btn-primary">Search</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}