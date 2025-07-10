declare module 'quagga' {
  interface QuaggaConfig {
    inputStream: {
      name: string;
      type: string;
      target: HTMLElement;
      constraints: {
        width: number;
        height: number;
        facingMode: string;
      };
    };
    decoder: {
      readers: string[];
    };
  }

  interface QuaggaResult {
    codeResult: {
      code: string;
    };
    boxes: any[];
    box: any;
    line: any;
  }

  interface QuaggaStatic {
    init(config: QuaggaConfig, callback: (err: any) => void): void;
    start(): void;
    stop(): void;
    onDetected(callback: (result: QuaggaResult) => void): void;
    onProcessed(callback: (result: QuaggaResult) => void): void;
    canvas: {
      dom: {
        overlay: HTMLCanvasElement;
      };
    };
    ImageDebug: {
      drawPath(path: any, options: any, context: CanvasRenderingContext2D, style: any): void;
    };
  }

  const Quagga: QuaggaStatic;
  export default Quagga;
} 