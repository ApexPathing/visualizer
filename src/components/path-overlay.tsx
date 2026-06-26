'use client';

import { useEffect, useRef } from "react";

interface PathDrawProps {
  poses: Pose[];
}

export default function DrawPaths({ poses }: PathDrawProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = canvas.width / 141.5;

    poses.forEach((pose) => {
      if (pose.x === null || pose.y === null || pose.heading === null) return;
      const posX = centerX + pose.x * scale;
      const posY = centerY - pose.y * scale;
      
      ctx.beginPath();
      ctx.arc(posX, posY, 2, 0, 2 * Math.PI);
      ctx.fillStyle = 'black';
      ctx.fill();
    });
  }, [poses]);

  return (
    <canvas
      ref={canvasRef}
      id="field-canvas"
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  )
}