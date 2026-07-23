'use client';

import { useEffect, useRef } from "react";
import { bsplineClass } from '@/lib/bsplineClass';
import Konva from "konva";

interface PathDrawProps {
  poses: Pose[];
  paths: Path[];
}

export default function DrawPaths({ poses, paths }: PathDrawProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;


    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const REAL_WIDTH_INCHES = 141.5;
    const pixelsPerInch = rect.width / REAL_WIDTH_INCHES; 

    // 1. Draw your Pose circles
    poses.forEach((pose) => {
      if (pose.x === null || pose.y === null || pose.heading === null) return;
      
      const posX = centerX + (pose.x * pixelsPerInch);
      const posY = centerY - (pose.y * pixelsPerInch);
      
      ctx.beginPath();
      ctx.arc(posX, posY, 7, 0, 2 * Math.PI); 
      ctx.fillStyle = 'green';
      ctx.fill();
    });


    

    
    

    paths.forEach((path)=>{
      const spline = new bsplineClass(path,poses);

      const points: Vector[] = [];
      const numPoints = 50; 

      for (let i = 0; i <= numPoints; i++) {
          const t = i / numPoints; 
          const point = spline.evaluate(t);
          points.push(point);
      }

      //this was kinda ai-ed mb
      if (points.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = '#2563eb'; 
        ctx.lineWidth = 3;           

        points.forEach((pt, index) => {
        
          const canvasX = centerX + (pt.x * pixelsPerInch);
          const canvasY = centerY - (pt.y * pixelsPerInch);

          if (index === 0) {
            ctx.moveTo(canvasX, canvasY);
          } else {
            ctx.lineTo(canvasX, canvasY); 
          }
        });

        ctx.stroke(); 
      }
    })
  }, [poses, paths]);

  return (
    <canvas
      ref={canvasRef}
      id="field-canvas"
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  );
}