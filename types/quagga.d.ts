declare module 'quagga' {
  export function init(config: any): Promise<void>;
  export function start(): void;
  export function stop(): void;
  export function onDetected(callback: (result: any) => void): void;
  export function offDetected(callback: (result: any) => void): void;
}

declare module '*.css' {
  const content: string;
  export default content;
} 