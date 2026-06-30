'use client';

import { bspline } from "@/lib/bspline";
import { useEffect, useRef, useState } from "react";

interface PathDrawProps {
  poses: Pose[];
  paths: Path[];
}

export default function DrawPaths({ poses, paths}: PathDrawProps) {

  
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

    poses.forEach((pose) => {
      if (pose.x === null || pose.y === null || pose.heading === null) return;
      
      const posX = centerX + (pose.x * pixelsPerInch);
      const posY = centerY - (pose.y * pixelsPerInch);
      
      ctx.beginPath();
      ctx.arc(posX, posY, 7, 0, 2 * Math.PI); 
      ctx.fillStyle = 'green';
      ctx.fill();
    });
  }, [poses]);

  return (
    <canvas
      ref={canvasRef}
      id="field-canvas"
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  );
}