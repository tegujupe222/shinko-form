import React, { useEffect, useRef, useState } from 'react';
import Quagga from 'quagga';

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onError: (error: string) => void;
  isActive: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onError, isActive }) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isActive || isInitialized) return;

    if (scannerRef.current) {
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment"
          },
        },
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "code_39_vin_reader",
            "codabar_reader",
            "upc_reader",
            "upc_e_reader",
            "i2of5_reader"
          ]
        }
      }, (err) => {
        if (err) {
          onError('バーコードリーダーの初期化に失敗しました: ' + err);
          return;
        }
        setIsInitialized(true);
        Quagga.start();
      });

      Quagga.onDetected((result) => {
        const code = result.codeResult.code;
        if (code) {
          onScan(code);
        }
      });

      Quagga.onProcessed((result) => {
        if (result) {
          const drawingCanvas = Quagga.canvas.dom.overlay;
          const drawingCtx = drawingCanvas.getContext('2d');
          if (drawingCtx && drawingCanvas.getAttribute("width") && drawingCanvas.getAttribute("height")) {
            if (result.boxes) {
              drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")!), parseInt(drawingCanvas.getAttribute("height")!));
              result.boxes.filter((box) => box !== result.box).forEach((box) => {
                Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
              });
            }
            if (result.box) {
              Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "blue", lineWidth: 2 });
            }
            if (result.codeResult && result.codeResult.code) {
              Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
            }
          }
        }
      });
    }

    return () => {
      if (isInitialized) {
        Quagga.stop();
        setIsInitialized(false);
      }
    };
  }, [isActive, isInitialized, onScan, onError]);

  useEffect(() => {
    if (isActive && isInitialized) {
      Quagga.start();
    } else if (!isActive && isInitialized) {
      Quagga.stop();
    }
  }, [isActive, isInitialized]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="relative">
      <div ref={scannerRef} className="w-full max-w-md mx-auto" />
             <div className="mt-4 text-center">
         <p className="text-sm text-gray-600 dark:text-gray-300">
           バーコードをリーダーに向けてください
         </p>
       </div>
    </div>
  );
};

export default BarcodeScanner; 