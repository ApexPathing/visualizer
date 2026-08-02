'use client';

import { useEffect, useRef, useState } from "react";
import { bsplineClass } from '@/lib/bsplineClass';

interface PathDrawProps {
  poses: Pose[];
  paths: Path[];
}

export default function DrawPaths({ poses, paths }: PathDrawProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const rect = img.getBoundingClientRect();
    

    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const REAL_WIDTH_INCHES = 141.5
  ;
    
    const scaleX = rect.width / REAL_WIDTH_INCHES; 
    const scaleY = rect.height / REAL_WIDTH_INCHES;

    
    poses.forEach((pose) => {
      if (pose.x === null || pose.y === null || pose.heading === null) return;
      
      const posX = centerX + (pose.x * scaleX);
      const posY = centerY - (pose.y * scaleY);
      
      ctx.beginPath();
      ctx.arc(posX, posY, 7, 0, 2 * Math.PI); 
      ctx.fillStyle = 'green';
      ctx.fill();
    });

    
    paths.forEach((path) => {
      const spline = new bsplineClass(path, poses);

      const points: Vector[] = [];
      const numPoints = 100; 

      for (let i = 0; i <= numPoints; i++) {
          const t = i / numPoints; 
          const point = spline.evaluate(t);
          points.push(point);
      }

      if (points.length > 0) {
        ctx.beginPath();  
        ctx.strokeStyle = '#2563eb'; 
        ctx.lineWidth = 3;          

        points.forEach((pt, index) => {
          const canvasX = centerX + (pt.x * scaleX);
          const canvasY = centerY - (pt.y * scaleY);

          if (index === 0) {
            ctx.moveTo(canvasX, canvasY);
          } else {
            ctx.lineTo(canvasX, canvasY); 
          }
        });

        ctx.stroke(); 
      }
    });
    
  
  }, [poses, paths, imageLoaded]);

  return (
    
    <div className="flex h-full w-full items-center justify-center overflow-hidden">

      <div className="relative flex max-h-full max-w-full">
        <img
          ref={imageRef}
          src="./images/decodeField.png" 
         
          className="block max-h-full max-w-full"
          alt="Decode Field"
          draggable="false"
          id="field"
          onLoad={() => setImageLoaded(true)}
        />
        
        <canvas
          ref={canvasRef}
          id="field-canvas"
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
      </div>
      
    </div>
  );
}