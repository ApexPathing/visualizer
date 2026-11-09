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
    updateFirstPose,
    updateEndPose,
    addExternalControlPoint,
    addNativeControlPoint,
    updateControlPoint,
    updateNativePoint,
    deleteControlPoint,
    addCallback,
    updateCallback,
    deleteCallback,
    updateInterpolation,
    updateTangential,
    addNode,
    updateNode,
    deleteNode,
    updateConstant
  } = Paths();


  const {
    dtType
  } = Settings();

  const {
    reRenderCanvas,
    setReRenderCanvas
  } = ReRender();
  
  const [currentShapeIndex,setCurrentShapeIndex] = useState(0);
  const [currentPathIndex,setCurrentPathIndex] = useState(0);
 
  

  

  return (
    <div className="flex flex-col h-[calc(100vh-104px)]">
      <ResizablePanelGroup
        orientation="horizontal"
        className="max-h max-w-md rounded-lg border min-w-full"
        onLayoutChanged={()=>setReRenderCanvas(!reRenderCanvas)}
      >
        <ResizablePanel maxSize="1000px" minSize="300px" collapsible>
          <span>
            <PoseControls
              poses={poses}
              deletePose={deletePose}
              addPose={addPose}
              updatePose={updatePose}
              setPoses={setPoses}
              currentShapeIndex={currentShapeIndex}
              setCurrentShapeIndex = {setCurrentShapeIndex}
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
          currentPathIndex={currentPathIndex}
          setCurrentPathIndex={setCurrentPathIndex}
          deletePose={deletePose}
          updateControlPoint={updateControlPoint}
          updateNativePoint={updateNativePoint}
          updatePath={updatePath}
          updateFirstPose={updateFirstPose}
          updateEndPose={updateEndPose}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel maxSize="1000px" minSize="330px" collapsible>
          <div className="h-full items-center justify-center">
            <span className="font-semibold">
              <PathControls
                poses={poses}
                paths={paths}
                setPaths={setPaths}
                addPath={addPath}
                updatePath={updatePath}
                deletePath={deletePath}
                addExternalControlPoint={addExternalControlPoint}
                addNativeControlPoint={addNativeControlPoint}
                updateControlPoint={updateControlPoint}
                deleteControlPoint={deleteControlPoint}
                addCallback={addCallback}
                updateCallback={updateCallback}
                deleteCallback={deleteCallback}
                dtType = {dtType}
                currentPathIndex={currentPathIndex}
                setCurrentPathIndex={setCurrentPathIndex}
                updateInterpolation={updateInterpolation}
                updateTangential={updateTangential}
                addNode={addNode}
                updateNode={updateNode}
                deleteNode={deleteNode}
                updateConstant={updateConstant}
                setReRenderCanvas={setReRenderCanvas}
                updateNativePoint={updateNativePoint}
                updateFirstPose={updateFirstPose}
                updateEndPose={updateEndPose}
              />
            </span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* <div className="rounded-lg border-border mt-4 flex w-full h-8 border items-center justify-between px-6">
        HI
      </div> */}
    </div>
  );
}