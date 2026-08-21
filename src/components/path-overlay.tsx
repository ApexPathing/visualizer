'use client';

import { useEffect, useRef, useState } from "react";
import { bsplineClass } from '@/lib/bsplineClass';

interface PathDrawProps {
  poses: Pose[];
  paths: Path[];
  updatePose: (id: number, updatedFields: Partial<Pose>) => void;
}

export default function DrawPaths({ poses, paths,updatePose }: PathDrawProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  
  
  const [imageLoaded, setImageLoaded] = useState(false);
  let current_shape_index:number;

  const shapes:poseShape[] = []
  let isDragging = false;
  let startX:number;
  let startY:number;

  let centerX:number;
  let centerY:number;
  let scaleX:number;
  let scaleY:number;

  
  

  useEffect(() => {

  
    const localPoses = poses.map(pose => ({ ...pose }));

    

    //drag and drop handler
    let is_mouse_in_pose = (x:number,y:number,pose:poseShape)=>{

      let squaredDist = (x - pose.x)**2 + (y - pose.y)**2
    
    
    return squaredDist <= pose.radius**2

    }
    let mouse_down = (event: MouseEvent) => {
      event.preventDefault();
      startX = event.clientX - rect.left;
      startY = event.clientY - rect.top;
      let index = 0;
      for(let shape of shapes){

        if(is_mouse_in_pose(startX,startY,shape)){
          isDragging = true;
          current_shape_index = index;
          
        }

        index++;

      }
    };

    let mouse_up = (event: MouseEvent) => {
      if(!isDragging){
        return
      }
      event.preventDefault();
      let current_shape = shapes[current_shape_index]
      const id = current_shape.poseId;
      updatePose(id,{
        x:(current_shape.x - centerX) / scaleX,
        y:(centerY - current_shape.y) / scaleY
      })

      isDragging = false;
    };


    let mouse_out = (event: MouseEvent) => {
      if(!isDragging){
        return;
      }
      event.preventDefault();

      let current_shape = shapes[current_shape_index]
      const id = current_shape.poseId;
      updatePose(id,{
        x:(current_shape.x - centerX) / scaleX,
        y:(centerY - current_shape.y) / scaleY
      })

      isDragging = false;
    };

    let mouse_move = (event:MouseEvent) =>{

      let mouseX = event.clientX - rect.left;
      let mouseY = event.clientY - rect.top;
      if(isDragging){
        


        let dx = mouseX - startX;
        let dy = mouseY - startY;

        let current_shape = shapes[current_shape_index];

        current_shape.x+=dx;
        current_shape.y+=dy;

        let activePose = localPoses.find(p => p.id === current_shape.poseId);
        if (activePose) {
          activePose.x = (current_shape.x - centerX) / scaleX;
          activePose.y = (centerY - current_shape.y) / scaleY;
        }
        
        draw();

        startX = mouseX;
        startY = mouseY;

        

      }else{
        return
      }
    }




  
    //canvas init
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const rect = img.getBoundingClientRect();
    

    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;


    canvas.onmousedown = mouse_down;
    canvas.onmouseup= mouse_up;
    canvas.onmouseout = mouse_out;
    canvas.onmousemove = mouse_move;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    centerX = rect.width / 2;
    centerY = rect.height / 2;

    const REAL_WIDTH_INCHES = 141.5;
    
    scaleX = rect.width / REAL_WIDTH_INCHES; 
    scaleY = rect.height / REAL_WIDTH_INCHES;


    //pose drawing
    
    poses.forEach((pose) => {
      if (pose.x === null || pose.y === null || pose.heading === null) return;
      
      const posX = centerX + (pose.x * scaleX);
      const posY = centerY - (pose.y * scaleY);
      
      shapes.push({poseId:pose.id,x:posX, y:posY, radius:7,color:pose.color})
    });

    let draw = ()=>{
      
      ctx.clearRect(0, 0, rect.width, rect.height);
      shapes.forEach((shape)=>{
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI); 
        ctx.fillStyle = shape.color;
        ctx.fill();
      })  


      //paths drawing using bspline class
      paths.forEach((path) => {
        const spline = new bsplineClass(path, localPoses);

        const points: Vector[] = [];
        const numPoints = path.controlPoints.length *200; 

        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints; 
            const point = spline.evaluate(t);
            points.push(point);
        }

        if (points.length > 0) {
          ctx.beginPath();  
          ctx.strokeStyle = path.color; 
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


    }
    
    draw();


    
   
    
  
  }, [poses, paths, imageLoaded]);

  return (
    
    <div className="flex h-full w-full items-center justify-center overflow-hidden">

      <div className="relative flex max-h-full max-w-full">
        <img
          ref={imageRef}
          src="./images/decodeField.png" 
         
          className="block max-h-full max-w-full select-none pointer-events-none"
          alt="Decode Field"
          draggable="false"
          id="field"
          unselectable = "on"
          onLoad={() => setImageLoaded(true)}
        />
        
        <canvas
          ref={canvasRef}
          id="field-canvas"
          className="absolute top-0 left-0 w-full h-full "
        />
      </div>
      
    </div>
  );
}