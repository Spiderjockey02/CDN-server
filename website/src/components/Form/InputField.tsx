import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { ChangeEventHandler, HTMLInputAutoCompleteAttribute, HTMLInputTypeAttribute, useState } from 'react';

interface Props {
  title: string
  name: string
  type?: HTMLInputTypeAttribute
  placeholder?: string
	onChange?: ChangeEventHandler<HTMLInputElement>
	errorMsg?: string
	autocomplete?: HTMLInputAutoCompleteAttribute
}

export default function InputField({ title, name, type, placeholder, onChange, errorMsg, autocomplete }: Props) {
	const [hidden, setHidden] = useState(false);

	return (
		<div className="mb-3">
			<label htmlFor={name} className="form-label">{title}:</label>
			<div className={type == 'password' ? 'input-group' : ''}>
				<input type={type == 'password' ? (hidden ? 'text' : 'password') : type} className="form-control" style={errorMsg ? { borderColor: 'red' } : {}} id={name} placeholder={placeholder} onChange={onChange} autoComplete={autocomplete} />
				{type == 'password' ?
					<Link onClick={() => setHidden(!hidden)} href="#" className='input-group-text'>
						{hidden ? <FontAwesomeIcon icon={faEye} width={15} height={15} /> : <FontAwesomeIcon icon={faEyeSlash} width={15} height={15} />}
					</Link>
					: null
				}
				{errorMsg && <div id="emailHelp" className="invalid-feedback" style={{ color: 'red', display: 'block' }}>{errorMsg}</div>}
			</div>
		</div>
	);
}