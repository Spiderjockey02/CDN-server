import { ChangeEventHandler, HTMLInputTypeAttribute } from 'react';

interface Props {
  title: string
  name: string
  type?: HTMLInputTypeAttribute
  placeholder?: string
	onChange?: ChangeEventHandler<HTMLInputElement>
	errorMsg?: string
}

export default function InputForm({ title, name, type, placeholder, onChange, errorMsg }: Props) {
	return (
		<div className="mb-3">
			<label htmlFor={name} className="form-label">{title}</label>
			<input type={type} className="form-control" style={errorMsg ? { borderColor: 'red' } : {}} id={name} placeholder={placeholder} onChange={onChange} />
			{errorMsg && <div id="emailHelp" className="form-text" style={{ color: 'red' }}>{errorMsg}</div>}
		</div>
	);
}