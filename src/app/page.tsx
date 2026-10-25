'use client'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

import PathControls from "@/components/path-controls";
import { Paths, Poses, ReRender, Settings } from "@/hooks/use-visualizer";
import PoseControls from "@/components/pose-controls";
import DrawPaths from "@/components/path-overlay";
import { Dispatch, SetStateAction, useState } from "react";


export default function Home() {
  const {
    poses,
    deletePose,
    addPose,
    updatePose,
    setPoses,
  } = Poses();

  const {
    paths,
    setPaths,
    addPath,
    updatePath,
    deletePath,
    addControlPoint,
    updateControlPoint,
    deleteControlPoint,
    addCallback,
    updateCallback,
    deleteCallback
  } = Paths();


  const {
    dtType
  } = Settings();

  const {
    reRenderCanvas,
    setReRenderCanvas
  } = ReRender();
  
  const [currentShapeIndex,setCurrentShapeIndex] = useState(0);
 

  

  return (
    <div className="flex flex-row h-[calc(100vh-104px)]">
      <ResizablePanelGroup
        orientation="horizontal"
        className="min-h-full max-w-md rounded-lg border min-w-full"
        onLayoutChanged={()=>setReRenderCanvas(!reRenderCanvas)}
      >
        <ResizablePanel maxSize="1000px" minSize="350px" collapsible>
          <span>
            <PoseControls
              poses={poses}
              deletePose={deletePose}
              addPose={addPose}
              updatePose={updatePose}
              setPoses={setPoses}
              currentShapeIndex={currentShapeIndex}
            />
          </span>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel minSize="600px" defaultSize="800px">
          <DrawPaths 
          poses={poses} 
          paths={paths}
          updatePose={updatePose} 
          reRender = {reRenderCanvas} 
          currentShapeIndex={currentShapeIndex}
          setCurrentShapeIndex={setCurrentShapeIndex}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel maxSize="1000px" minSize="350px" collapsible>
          <div className="h-full items-center justify-center">
            <span className="font-semibold">
              <PathControls
                poses={poses}
                paths={paths}
                setPaths={setPaths}
                addPath={addPath}
                updatePath={updatePath}
                deletePath={deletePath}
                addControlPoint={addControlPoint}
                updateControlPoint={updateControlPoint}
                deleteControlPoint={deleteControlPoint}
                addCallback={addCallback}
                updateCallback={updateCallback}
                deleteCallback={deleteCallback}
                dtType = {dtType}
              />
            </span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}