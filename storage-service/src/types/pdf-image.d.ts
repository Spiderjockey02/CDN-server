declare module 'pdf-image' {
  export interface PDFImageOptions {
    outputDirectory?: string;
    convertOptions?: Record<string, string>;
    graphicsMagick?: boolean;
  }

  export class PDFImage {
  	constructor(pdfPath: string, options?: PDFImageOptions);

  	/**
   * Convert the specified page of the PDF to an image.
   * @param pageNumber - The page index (0-based).
   * @returns A promise resolving with the path to the generated image.
   */
  	convertPage(pageNumber: number): Promise<string>;
  }
}
