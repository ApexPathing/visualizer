'use client';

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { bsplineClass } from '@/lib/bsplineClass';
import { Settings } from "@/hooks/use-visualizer";
import { Cpu } from "lucide-react";

interface PathDrawProps {
  poses: Pose[];
  paths: Path[];
  updatePose: (id: number, updatedFields: Partial<Pose>) => void;
  reRender: boolean 
  currentShapeIndex:number
  setCurrentShapeIndex: Dispatch<SetStateAction<number>>
  currentPathIndex:number
  setCurrentPathIndex: Dispatch<SetStateAction<number>>
  deletePose: (id: number) => void
  updateControlPoint: (pathId: number, currentPoints: ControlPoint[], controlPointId: number, updatedFields: Partial<ControlPoint>) => void
  updateNativePoint: (pathId: number, CPID: number, updatedFields: Partial<NativeControlPoint>) => void
}

export default function DrawPaths({
  poses,
  paths,
  updatePose,
  reRender,
  currentShapeIndex,
  setCurrentShapeIndex,
  currentPathIndex,
  setCurrentPathIndex,
  updateControlPoint,
  updateNativePoint
}: PathDrawProps) {


  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  

  const{
    image
  } = Settings();
  


  
  const [imageLoaded, setImageLoaded] = useState(false);
  const currentShapeIndexRef = useRef(currentShapeIndex);
  const currentPathIndexRef = useRef(currentPathIndex);


  useEffect(() => {
    currentShapeIndexRef.current = currentShapeIndex;
    currentPathIndexRef.current = currentPathIndex;
  }, [currentShapeIndex,currentPathIndex]);

  const shapes:poseShape[] = []
  let isDraggingPose = false;
  let isDraggingNative = false;
  let startX:number;
  let startY:number;

  let centerX:number;
  let centerY:number;
  let scaleX:number;
  let scaleY:number;

  const currentNativeIdRef = useRef<number | null>(null); 
  

  
 

  useEffect(() => {

  

    let natives:ControlPoint[] = []
      
    paths.forEach((path)=>{
      path.controlPoints.forEach((CP)=>{
        if(CP.isNative) natives.push(CP)
      })
    })
    const localPoses = poses.map(pose => ({ ...pose }));

    

    //drag and drop checker
    let is_mouse_in_pose = (x:number,y:number,pose:poseShape)=>{

      const tolerance = 10;

      let squaredDist = (x - pose.x)**2 + (y - pose.y)**2
    
    
    return squaredDist <= pose.radius**2 + tolerance**2

    }

    let is_mouse_in_vector = (x:number,y:number,vector:Vector)=>{

      const tolerance = 10;

      let squaredDist = (x - vector.x)**2 + (y - vector.y)**2
    
    
    return squaredDist <= 8**2 + tolerance**2

    }



    let is_mouse_in_path = (x:number,y:number,spline:bsplineClass,path:Path)=>{
      const numPoints = path.controlPoints.length * 200;

      const tolerance = 5;

      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const pt = spline.evaluate(t);

        const cpX = centerX + (pt.x * scaleX);
        const cpY = centerY - (pt.y * scaleY);

        const squaredDist = (x - cpX) ** 2 + (y - cpY) ** 2;
        if (squaredDist <= tolerance**2) {
          return true;
        }
      }
      return false;
    }
  
    let mouse_down = (event: MouseEvent) => {
      event.preventDefault();
      startX = event.clientX - rect.left;
      startY = event.clientY - rect.top;

    
      
      for (let i = 0; i < natives.length; i++) {
        const c = natives[i].nativeParameter?.coord;
        if (!c) continue;
        const px = centerX + c.x * scaleX;
        const py = centerY - c.y * scaleY;
        if (is_mouse_in_vector(startX, startY, { x: px, y: py })) {
          currentNativeIdRef.current = natives[i].id;
          isDraggingNative = true;
          return;
        } 
      }
      
      for (let i = 0; i < shapes.length; i++) {
        if (is_mouse_in_pose(startX, startY, shapes[i])) {
          isDraggingPose = true;
          setCurrentShapeIndex(i);
          break;
        }
      }
    
      

      paths.forEach((path, i) => {
        if (is_mouse_in_path(startX, startY, new bsplineClass(path, localPoses), path)) {
          setCurrentPathIndex(i);
        }
      });
    };

    let mouse_up = (event: MouseEvent) => {
      if(isDraggingPose ){
        event.preventDefault();
        if(currentShapeIndexRef.current != -1){
          let current_shape = shapes[currentShapeIndexRef.current]
          
          const id = current_shape.poseId;
          updatePose(id,{
            x:Number(((current_shape.x - centerX) / scaleX).toFixed(3)),
            y:Number(((centerY - current_shape.y) / scaleY).toFixed(3)),
          open:""
          })
          if(ctx)
          ctx.globalAlpha = 1;
        
          
          isDraggingPose = false;
          
        }
       
      }else if(isDraggingNative) {
        const currentNative = natives.find((CP)=>CP.id == currentNativeIdRef.current)
        
        paths.forEach((path)=>{
          path.controlPoints.forEach((CP)=>{
            if(CP.id == currentNative?.id){
              updateNativePoint(path.id,CP.id,{coord:{
                x:Number(currentNative.nativeParameter?.coord.x.toFixed(3)) ?? 0,
                y:Number(currentNative.nativeParameter?.coord.y.toFixed(3)) ?? 0}})
              }
          })
        })
        isDraggingNative = false;
      }
      else{
        return
      }
    };


    let mouse_out = (event: MouseEvent) => {
      if(!isDraggingPose && !isDraggingNative){
        return;
      }
      event.preventDefault();

      let current_shape = shapes[currentShapeIndexRef.current]
      if(current_shape){
        const id = current_shape.poseId;
        updatePose(id,{
          x:Number(((current_shape.x - centerX) / scaleX).toFixed(3)),
          y:Number(((centerY - current_shape.y) / scaleY).toFixed(3))
        })
      }

      const currentNative = natives.find((CP)=>CP.id == currentNativeIdRef.current)
      if(currentNative)  {
        paths.forEach((path)=>{
          path.controlPoints.forEach((CP)=>{
            if(CP.id == currentNative.id){
              updateNativePoint(path.id,CP.id,{coord:{
                x:Number(currentNative.nativeParameter?.coord.x.toFixed(3)) ?? 0,
                y:Number(currentNative.nativeParameter?.coord.y.toFixed(3)) ?? 0}})
              }
          })
        })
      }

      isDraggingPose = false;
      isDraggingNative = false;
    };

    let mouse_move = (event:MouseEvent) =>{

      if(ctx) ctx.globalAlpha = 0.7;
      
      let mouseX = event.clientX - rect.left;
      let mouseY = event.clientY - rect.top;
      if(isDraggingPose){
        


        let dx = mouseX - startX;
        let dy = mouseY - startY;

        let current_shape = shapes[currentShapeIndexRef.current];

        current_shape.x+=dx;
        current_shape.y+=dy;

        
        draw();

        startX = mouseX;
        startY = mouseY;

        

      }else if(isDraggingNative){
        let dx = mouseX - startX;
        let dy = mouseY - startY;

        let currentNative = natives.find((CP)=>CP.id == currentNativeIdRef.current)

        const nativeCoords = currentNative?.nativeParameter?.coord;
        
        if(nativeCoords && currentNative.nativeParameter)
          currentNative.nativeParameter.coord = {
            x: nativeCoords.x + dx / scaleX,
            y: nativeCoords.y - dy / scaleY,
          };

        
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


  

   
    

    const ctx = canvas.getContext("2d");
    if (!ctx) return; 
    canvas.onmousedown = mouse_down;
    canvas.onmouseup= mouse_up;
    canvas.onmouseout = mouse_out;
    canvas.onmousemove = mouse_move;
    

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
        const numPoints = path.controlPoints.length * 200; 

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
            const cpX = centerX + (pt.x * scaleX);
            const cpY = centerY - (pt.y * scaleY);

            if (index === 0) {
              ctx.moveTo(cpX, cpY);
            } else {
              ctx.lineTo(cpX, cpY); 
            }
          });

          ctx.stroke(); 
        }


        //draw native points
        
        path.controlPoints.forEach((CP)=>{
          if(CP.isNative){
            ctx.beginPath();
            ctx.fillStyle = path.color;
            const x = centerX + ((CP.nativeParameter?.coord.x ?? 0) * scaleX);
            const y = centerY - ((CP.nativeParameter?.coord.y ?? 0) * scaleY);
            ctx.arc(x, y, 3, 0, 2 * Math.PI); 
            ctx.fill();
            ctx.beginPath();
            
            ctx.arc(x, y, 7, 0, 2 * Math.PI);  
            ctx.stroke(); 
            
          }
        })
      });

     
      
    

      shapes.forEach((shape)=>{
        if(currentShapeIndexRef.current == shapes.indexOf(shape)){
          ctx.beginPath();
          let transX = 10,transY = 10;
          let activePose = localPoses.find(p => p.id === shape.poseId);
            if (activePose) {
              activePose.x = (shape.x - centerX) / scaleX;
              activePose.y = (centerY - shape.y) / scaleY;
              if(activePose.x <= 0 && activePose.y >= 0) transX = 10, transY = 10;
              if(activePose.x >= 0 && activePose.y >= 0) transX = -10 - 75, transY = 10;
              if(activePose.x <= 0 && activePose.y <= 0) transX = 10, transY = -10 - 25;
              if(activePose.x >= 0 && activePose.y <= 0) transX = -10 - 75, transY = -10 - 25;
            }
          
          ctx.roundRect(shape.x + transX ,shape.y + transY,75,25,10);
          ctx.fillStyle = "rgba(255,0,0,0.4)";
          ctx.fill();
        }
      })

      shapes.forEach((shape)=>{

        if(currentShapeIndexRef.current != -1 && currentShapeIndexRef.current == shapes.indexOf(shape)){
          ctx.beginPath();
          let activePose = localPoses.find(p => p.id === shape.poseId);
          ctx.fillStyle = "white";
          if (activePose) {
            activePose.x = (shape.x - centerX) / scaleX;
            activePose.y = (centerY - shape.y) / scaleY;

            let transX = 15,transY = 25;

            //lowk couldve used += for ts what am i doing(too lazy to change rn T-T)
            if(activePose.x <= 0 && activePose.y >= 0) transX = 15, transY = 25 + 1;
            if(activePose.x >= 0 && activePose.y >= 0) transX = -15 - 63, transY = 25+1;
            if(activePose.x <= 0 && activePose.y <= 0) transX = 15 - 2, transY = -25 + 5;
            if(activePose.x >= 0 && activePose.y <= 0) transX = -15 - 65, transY = -25 + 6;
            

            ctx.fillText("(" + activePose.x.toFixed(2) + "," + activePose.y.toFixed(2) + ")",shape.x + transX , shape.y + transY);
          } 
          
          ctx.fill();
        } 
      })

      paths.forEach((path)=>{ 
        path.controlPoints.forEach((CP)=>{
          if(CP.isNative && CP.nativeParameter){
            if(currentNativeIdRef.current == CP.id){
              ctx.beginPath();
              ctx.fillStyle = "rgba(255,0,0,0.4)";
              const x = centerX + (CP.nativeParameter.coord.x * scaleX);
              const y = centerY - (CP.nativeParameter.coord.y * scaleY);
              let transX = 10,transY = 10;
         
             
              if(CP.nativeParameter.coord.x <= 0 && CP.nativeParameter.coord.y >= 0) transX = 10, transY = 10;
              if(CP.nativeParameter.coord.x >= 0 && CP.nativeParameter.coord.y >= 0) transX = -10 - 75, transY = 10;
              if(CP.nativeParameter.coord.x <= 0 && CP.nativeParameter.coord.y <= 0) transX = 10, transY = -10 - 25;
              if(CP.nativeParameter.coord.x >= 0 && CP.nativeParameter.coord.y <= 0) transX = -10 - 75, transY = -10 - 25;

              ctx.roundRect(x + transX,y + transY,75,25,10);
              ctx.fill();
            }
          }
        })
      })
      
      paths.forEach((path)=>{ 
        path.controlPoints.forEach((CP)=>{
          if(CP.isNative && CP.nativeParameter){
            if(currentNativeIdRef.current == CP.id){
              ctx.beginPath();
              ctx.fillStyle = "white";
              const x = centerX + (CP.nativeParameter.coord.x * scaleX);
              const y = centerY - (CP.nativeParameter.coord.y * scaleY);
              let transX = 10,transY = 10;
         

              if(CP.nativeParameter.coord.x <= 0 && CP.nativeParameter.coord.y >= 0) transX = 15, transY = 25 + 1;
              if(CP.nativeParameter.coord.x >= 0 && CP.nativeParameter.coord.y >= 0) transX = -15 - 63, transY = 25+1;
              if(CP.nativeParameter.coord.x <= 0 && CP.nativeParameter.coord.y <= 0) transX = 15 - 2, transY = -25 + 5;
              if(CP.nativeParameter.coord.x >= 0 && CP.nativeParameter.coord.y <= 0) transX = -15 - 65, transY = -25 + 6;
             
            
              ctx.fillText(
              "(" + CP.nativeParameter.coord.x.toFixed(2) + 
              "," + CP.nativeParameter.coord.y.toFixed(2) + ")", 
              x + transX ,  y + transY);
              
              ctx.fill();
            }
          }
        })
      })

    }
    
    draw();


    
   
    
  
  }, [poses, paths, imageLoaded,reRender]);


  return (
    
    <div className="flex h-full w-full items-center justify-center overflow-hidden min-h-0 min-w-0">

      <div className="relative flex max-h-full max-w-full min-h-0 min-w-0 items-center justify-center"
      style={{ maxWidth: '735px', maxHeight: '735px' }}
        >
        <img
          ref={imageRef}
          src={image}
          className="block aspect-square max-h-full max-w-full w-auto h-auto object-contain select-none pointer-events-none"
          alt="Field"
          draggable="false"
          id="field"
          unselectable = "on"
          onLoad={() => setImageLoaded(true)}
        />
        
        <canvas
          ref={canvasRef}
          id="field-canvas"
          className="absolute inset-0 w-full h-full "
        />
      </div>
      
    </div>
  );
}