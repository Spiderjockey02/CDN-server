import { fileItem } from '..';

export interface FileContextMenuProps {
  x: number
  y: number
  selected: fileItem[]
  closeContextMenu: () => void
  showFilePanel: (fileId: string) => void
}

export interface TrashContextMenuProps {
  x: number
  y: number
  selected: fileItem[]
  closeContextMenu: () => void
}