'use client';
import { Stage, Layer, Circle, Image, Group} from 'react-konva';
import { useRef, useState } from 'react';



interface PathDrawProps {
  poses: Pose[];
  paths: Path[];
  updatePose: (id: number, updatedFields: Partial<Pose>) => void;
}

export default function Overlay({ poses, paths , updatePose}: PathDrawProps){
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const REAL_WIDTH_INCHES = 141.5;
    const pixelsPerInch = window.innerWidth / REAL_WIDTH_INCHES; 
    

    
  return (
    <div className='absolute inset-0 z-10 flex items-center justify-center'>
        <Stage width={window.innerHeight} height={window.innerHeight}>
            <Layer>
                <Group>
                    {poses.map((pose)=>(
                    <Circle
                        key = {pose.id}
                        x={window.innerWidth/2}
                        y={window.innerHeight/2}
                        radius={10}
                        fill="red"
                        strokeWidth={4}
                        draggable
                        onMouseEnter={(e) => {
                            document.body.style.cursor = 'pointer';
                        }}
                        onMouseLeave={(e) => {
                            document.body.style.cursor = 'default';
                        }}
                        onDragEnd={(e) => {
                            if(pose.x && pose.y)
                            updatePose(pose.id,{
                                x: (centerX - pose.x) / pixelsPerInch,
                                y: (centerY + pose.y) / pixelsPerInch
                            })
                        }}
                    />
                    ))}
                </Group>
            </Layer>
        </Stage>
    </div>
  );
};
