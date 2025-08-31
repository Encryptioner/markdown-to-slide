declare module 'html2canvas' {
  interface Options {
    scale?: number;
    useCORS?: boolean;
    allowTaint?: boolean;
    backgroundColor?: string | null;
    logging?: boolean;
    width?: number;
    height?: number;
    scrollX?: number;
    scrollY?: number;
  }

  function html2canvas(element: HTMLElement, options?: Options): Promise<HTMLCanvasElement>;
  export default html2canvas;
}

declare module 'jspdf' {
  export interface jsPDFOptions {
    orientation?: 'portrait' | 'landscape' | 'p' | 'l';
    unit?: 'pt' | 'mm' | 'cm' | 'in' | 'px' | 'pc' | 'em' | 'ex';
    format?: string | [number, number];
  }

  export class jsPDF {
    constructor(options?: jsPDFOptions);
    addImage(
      imageData: string | HTMLCanvasElement | HTMLImageElement,
      format: string,
      x: number,
      y: number,
      width: number,
      height: number,
      alias?: string,
      compression?: string,
      rotation?: number
    ): jsPDF;
    addPage(): jsPDF;
    save(filename?: string): jsPDF;
    internal: {
      pageSize: {
        getWidth(): number;
        getHeight(): number;
      };
    };
  }
}