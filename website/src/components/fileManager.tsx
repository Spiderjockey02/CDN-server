import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import type { fileItem } from '@/types';

type Action =
  | { type: 'SET_FILE'; payload: fileItem | null }
  | { type: 'CLEAR_FILE' };

// Reducer function to handle actions
const fileReducer = (state: fileItem | null, action: Action): fileItem | null => {
	switch (action.type) {
		case 'SET_FILE':
			return action.payload;
		case 'CLEAR_FILE':
			return null;
		default:
			return state;
	}
};

// Create context
export const FileContext = createContext<fileItem | null>(null);
export const FileDispatchContext = createContext<React.Dispatch<Action> | undefined>(undefined);

interface FileProviderProps {
  children: ReactNode;
}

// Provider component
export const FileProvider: React.FC<FileProviderProps> = ({ children }) => {
	const [file, dispatch] = useReducer(fileReducer, null);

	return (
		<FileContext.Provider value={file}>
			<FileDispatchContext.Provider value={dispatch}>
				{children}
			</FileDispatchContext.Provider>
		</FileContext.Provider>
	);
};

// Custom hooks for convenience
export const useFile = (): fileItem | null => {
	const context = useContext(FileContext);
	if (context === undefined) {
		throw new Error('useFile must be used within a FileProvider');
	}
	return context;
};

export const useFileDispatch = (): React.Dispatch<Action> => {
	const context = useContext(FileDispatchContext);
	if (context === undefined) {
		throw new Error('useFileDispatch must be used within a FileProvider');
	}
	return context;
};