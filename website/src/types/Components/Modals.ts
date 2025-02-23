import { fileItem } from '..';

export interface FileModalProps {
  file: fileItem
  closeContextMenu?: () => void
}