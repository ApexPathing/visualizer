'use client'

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ArrowUp, ArrowUpNarrowWide, ChevronDown, ChevronUp, CircleMinus, CirclePlus, GripVertical, Plus, Upload } from "lucide-react";
import { Input } from "./ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "./ui/combobox";
import { Sortable, SortableContent, SortableItem, SortableItemHandle, SortableOverlay } from "./ui/sortable";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { ColorPicker, ColorPickerArea, ColorPickerContent, ColorPickerEyeDropper, ColorPickerHueSlider, ColorPickerInput, ColorPickerSwatch, ColorPickerTrigger } from "./ui/color-picker";
import { StoreApi, UseBoundStore } from "zustand";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card } from "./ui/card";
import { Field, FieldContent, FieldLabel } from "./ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSubTrigger, DropdownMenuTrigger } from "./ui/dropdown-menu";
import SvgArcPoseIcon from "@/assets/ArcPoseIcon";


interface PathControlProps {
  poses: Pose[];
  paths: Path[];
  setPaths: Dispatch<SetStateAction<Path[]>>;
  addPath: () => void;
  updatePath: (id: number, updatedFields: Partial<Path>) => void;
  deletePath: (id: number) => void;
  deleteControlPoint: (pathId: number, currentPoints: ControlPoint[], controlPointId: number) => void;
  addExternalControlPoint: (pathId: number, currentPoints?: ControlPoint[]) => void;
  updateControlPoint: (pathId: number, currentPoints: ControlPoint[], controlPointId: number, updatedFields: Partial<ControlPoint>) => void;
  addCallback: (pathId: number, currentCallbacks?: Callback[]) => void;
  addNativeControlPoint: (pathId: number) => void;
  updateCallback: (pathId: number, currentCallbacks: Callback[], callbackId: number, updatedFields: Partial<Callback>) => void;
  deleteCallback: (pathId: number, currentCallbacks: Callback[], callbackId: number) => void;
  dtType: "holonomic" | "tank" | "butterfly";
  currentPathIndex: number
  setCurrentPathIndex: Dispatch<SetStateAction<number>>
  updateInterpolation: (pathId: number, updatedFields: Partial<Interpolation>) => void
  updateTangential: (pathId: number, updatedFields: Partial<TangentialParameter>) => void
  addNode: (pathId: number) => void
  updateNode: (pathId: number, nodeId: number, updatedFields: Partial<NodeBasedParameter>) => void
  deleteNode: (pathId: number, nodeId: number) => void
  updateConstant: (pathId: number, updatedFields: Partial<ConstantParameter>) => void
  setReRenderCanvas: Dispatch<SetStateAction<boolean>>
  updateNativePoint: (pathId: number, CPID: number, updatedFields: Partial<NativeControlPoint>) => void
  updateFirstPose: (pathId: number, updatedFields: Partial<NativeControlPoint>) => void
  updateEndPose: (pathId: number, updatedFields: Partial<NativeControlPoint>) => void
}

export default function PathControls({
  poses,
  paths,
  setPaths,
  addPath,
  updatePath,
  deletePath,
  deleteControlPoint,
  addExternalControlPoint,
  addNativeControlPoint,
  updateControlPoint,
  addCallback,
  updateCallback,
  deleteCallback,
  dtType,
  currentPathIndex,
  setCurrentPathIndex,
  updateInterpolation,
  updateTangential,
  addNode,
  updateNode,
  deleteNode,
  updateConstant,
  setReRenderCanvas,
  updateNativePoint,
  updateFirstPose,
  updateEndPose
}: PathControlProps) {

  //copied from Dylan's code in pose-controls, thanks Dylan!

  function handleInputBlur(e: React.FocusEvent<HTMLInputElement>, min: number, max: number) {
    if (e.target.value !== "") {
      const parsed = parseFloat(e.target.value);
      if (!isNaN(parsed)) {
        const final = Math.max(min, Math.min(max, parsed));
        e.target.value = final.toString();
      }
    }
  }

  function handleNumberInput(e:React.ChangeEvent<HTMLInputElement>){
    const parsed = parseFloat(e.target.value)
    let final = parsed;
    if(isNaN(parsed))final = 0;
    return final;
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!paths[currentPathIndex]) return;
    scrollToSection(`${paths[currentPathIndex].id}`)

    // boundaries
    paths.forEach((path)=>{
      path.controlPoints.forEach((CP)=>{
        if(CP.isNative && CP.nativeParameter?.coord){
          if(CP.nativeParameter.coord.x > 70.75) 
            updateNativePoint(path.id,CP.id,{coord:{x:70.75,y:CP.nativeParameter.coord.y}})
          else if(CP.nativeParameter.coord.x < -70.75)
            updateNativePoint(path.id,CP.id,{coord:{x:-70.75,y:CP.nativeParameter.coord.y}})

          if(CP.nativeParameter.coord.y > 70.75) 
            updateNativePoint(path.id,CP.id,{coord:{y:70.75,x:CP.nativeParameter.coord.x}})
          else if(CP.nativeParameter.coord.y < -70.75)
            updateNativePoint(path.id,CP.id,{coord:{y:-70.75,x:CP.nativeParameter.coord.x}})
        }
      })
      
      const FP = path.firstPose;
      if(FP.isNative && FP.nativeParameter?.coord){
        if(FP.nativeParameter.coord.x > 70.75) 
          updateFirstPose(path.id,{coord:{x:70.75,y:FP.nativeParameter.coord.y}})
        else if(FP.nativeParameter.coord.x < -70.75)
          updateFirstPose(path.id,{coord:{x:-70.75,y:FP.nativeParameter.coord.y}})

        if(FP.nativeParameter.coord.y > 70.75) 
          updateFirstPose(path.id,{coord:{y:70.75,x:FP.nativeParameter.coord.x}})
        else if(FP.nativeParameter.coord.y < -70.75)
          updateFirstPose(path.id,{coord:{y:-70.75,x:FP.nativeParameter.coord.x}})

      }

      const EP = path.endPose;
      if(EP.isNative && EP.nativeParameter?.coord){
        if(EP.nativeParameter.coord.x > 70.75) 
          updateEndPose(path.id,{coord:{x:70.75,y:EP.nativeParameter.coord.y}})
        else if(EP.nativeParameter.coord.x < -70.75)
          updateEndPose(path.id,{coord:{x:-70.75,y:EP.nativeParameter.coord.y}})
        if(EP.nativeParameter.coord.y > 70.75) 
          updateEndPose(path.id,{coord:{y:70.75,x:EP.nativeParameter.coord.x}})
        else if(EP.nativeParameter.coord.y < -70.75)
          updateEndPose(path.id,{coord:{y:-70.75,x:EP.nativeParameter.coord.x}})

      }

      //connected path stuff

      paths.forEach((path,index)=>{
        if(index != 0){

          const prevPath = paths[index -1]
          if (path.firstPose !== prevPath.endPose) updatePath(path.id, { firstPose: prevPath.endPose })
          
        }
      })
    })

    
  }, [paths, currentPathIndex,updateControlPoint])

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-row">
        <Button className="grow mt-4 ml-5" onClick={addPath}>
          <Plus className="mr-2 h-4 w-4" /> Add Path
        </Button>
        <Button className="flex mt-4 mr-5" onClick={() => {
          paths.forEach((path) => {
            updatePath(path.id, { open: " " })
          })
        }}>

          <ChevronDown color={"white"} className="mr-1 ml-1 h-4 w-4" />
        </Button>

      </div>

      <ScrollArea className="w-full flex-1 min-h-0 p-4">
        <Sortable
          value={paths}
          onValueChange={setPaths}
          getItemValue={(path) => path.id}
        >
          <SortableContent className="flex flex-col w-full">
            {paths.map((path) => (
              <SortableItem key={path.id} value={path.id} id={`${path.id}`} className="hover:transparent" asChild>
                <div className="p-1">
                  <Accordion type="single" collapsible value={`${path.id + path.open}`} className={`w-full ${currentPathIndex == paths.indexOf(path) && "bg-red-900"} rounded-lg`}>
                    <AccordionItem value={`${path.id}`} onClick={() => setCurrentPathIndex(paths.indexOf(path))} className="border-none">
                      <div className="relative flex items-center w-full min-h-10 py-1">
                        <div className="relative z-10 flex flex-1 items-center justify-between gap-4 pointer-events-none pr-8">
                          <div className="flex items-center gap-2 flex-1 pointer-events-auto">
                            <SortableItemHandle>
                              <div
                                role="button"
                                className="flex items-center justify-center h-8 w-8 rounded-md cursor-grab active:cursor-grabbing text-zinc-400 hover:text-white"
                              >
                                <GripVertical className="h-4 w-4" />
                              </div>
                            </SortableItemHandle>

                            <Input
                              id={`name-${path.id}`}
                              type="text"
                              placeholder="Path Name"
                              defaultValue={path.name}
                              className="transition-colors focus-visible:border-brand-primary focus-visible:ring-brand-primary bg-zinc-900"
                              onChange={(e) => updatePath(path.id, { name: e.target.value })}
                            />
                          </div>

                          <div className="flex items-center gap-1 pointer-events-auto">
                            <ColorPicker defaultFormat="hex" value={path.color}
                              onValueChange={(color) => updatePath(path.id, { color: color })}>
                              <ColorPickerTrigger asChild>
                                <ColorPickerSwatch className="mb-px h-5 w-5" />
                              </ColorPickerTrigger>
                              <ColorPickerContent>
                                <ColorPickerArea />
                                <div className="flex items-center gap-2">
                                  <ColorPickerEyeDropper />
                                  <div className="flex flex-1 flex-col gap-2">
                                    <ColorPickerHueSlider />
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <ColorPickerInput withoutAlpha className="pointer-events-none" />
                                </div>
                              </ColorPickerContent>
                            </ColorPicker>

                            <Button
                              className="bg-transparent hover:bg-brand-primary/25"
                              onClick={() => deletePath(path.id)}
                            >
                              <CircleMinus className="h-8 w-8 text-brand-primary" color="currentColor" />
                            </Button>
                          </div>
                        </div>

                        <AccordionTrigger
                          onClick={() => {
                            if (path.open == "") {
                              updatePath(path.id, { open: " " })
                            } else if (path.open == " ") {
                              updatePath(path.id, { open: "" })
                            }

                            setCurrentPathIndex(paths.indexOf(path))
                          }}
                          className="absolute inset-0 z-0 flex h-full w-full items-center justify-between p-0 pr-4 border-none hover:no-underline text-zinc-400"
                        >
                          <span className="sr-only">Toggle Path</span>
                        </AccordionTrigger>
                      </div>

                      <AccordionContent className="pt-2 h-full">
                        <div className="flex flex-col ml-5 pr-3">
                          <div
                            className="flex flex-1 w-full gap-2 my-1"
                            hidden={dtType != "butterfly"}
                          >
                            <button
                              type="button"
                              onClick={() => updatePath(path.id, { holonomic: true })}
                              className={`flex-1 rounded-md justify-center text-center text-xs h-7 font-semibold transition-colors ${path.holonomic ? "bg-brand-primary" : "bg-zinc-900 hover:bg-zinc-700"}`}
                            >
                              Holonomic
                            </button>
                            <button
                              type="button"
                              onClick={() => updatePath(path.id, { holonomic: false })}
                              className={`flex-1 rounded-md justify-center text-center text-xs h-7 font-semibold transition-colors ${!path.holonomic ? "bg-brand-primary" : "bg-zinc-900 hover:bg-zinc-700"}`}
                            >
                              Tank
                            </button>
                          </div>

                          <Accordion type="single" collapsible defaultValue="item-1" className="w-full" >
                            <AccordionItem value="item-1" className="border-none">
                              <div className="flex flex-row w-full items-center">
                                <AccordionTrigger className="hover:no-underline">
                                  <div className="flex w-fit text-xs flex-row mr-2">
                                    Control Points ({path.controlPoints?.length || 0})
                                  </div>
                                </AccordionTrigger>
                                <Button
                                  className="ml-2 bg-transparent hover:bg-lime-500/25"
                                  onClick={() => addNativeControlPoint(path.id)}
                                >
                                  <CirclePlus className="h-4 w-4 text-lime-500" color="currentColor" />
                                </Button>
                              </div>

                              <AccordionContent className="flex flex-col h-full mt-1">
                                <Sortable
                                  value={path.controlPoints || []}
                                  onValueChange={(newPoints) => updatePath(path.id, { controlPoints: newPoints })}
                                  getItemValue={(item) => item.id}
                                >
                                  <Button className="grow ml-3 mr-3 mb-2" onClick={()=>addExternalControlPoint(path.id, path.controlPoints)}>Add External</Button>
                                  <SortableContent className="flex flex-col gap-2">

                                  
                                    <div className="flex flex-row items-center justify-between py-1">
                                      <div className="flex flex-row mt-1">
                                        <div className="mt-1 mr-3">Start:</div>
                                        <div className="mt-1.25 mr-0.5">X:</div>
                                        <Input
                                          placeholder="X"
                                          min={-70.75}
                                          max={70.75}
                                          step={0.1}
                                          value={path.firstPose.nativeParameter?.coord.x}
                                          onChange={(e)=>{
                                            updateFirstPose(path.id,{coord:{
                                              x:handleNumberInput(e),
                                              y:path.firstPose.nativeParameter?.coord.y ?? 0
                                            }})
                                          }}
                                          onBlur={(e)=>handleInputBlur(e,-70.75,70.75)}
                                          className="min-w-20 transition-colors focus-visible:border-red-500 focus-visible:ring-red-500 bg-zinc-900"
                                        />
                                        <div className=" ml-1.5 mr-0.5 mt-1.25">Y:</div>
                                        <Input
                                          placeholder="Y"
                                          min={-70.75}
                                          max={70.75}
                                          value={path.firstPose.nativeParameter?.coord.y}
                                          onChange={(e)=>{
                                            updateFirstPose(path.id,{coord:{
                                              y:handleNumberInput(e),
                                              x:path.firstPose.nativeParameter?.coord.y ?? 0
                                            }})
                                          }}
                                          onBlur={(e)=>handleInputBlur(e,-70.75,70.75)}
                                          className="min-w-20 transition-colors focus-visible:border-red-500 focus-visible:ring-red-500 bg-zinc-900"
                                        />
                                      </div>
                                    </div>
                                    {(path.controlPoints || []).map((controlPoint) => (
                                      <SortableItem key={controlPoint.id} value={controlPoint.id} asChild>
                                        <div className="flex flex-row items-center justify-between py-1">
                                          <div className="flex flex-row items-center w-full gap-2">
                                            <Button
                                              variant="ghost"
                                              className="bg-transparent hover:bg-transparent p-0 h-auto"
                                              onClick={() => deleteControlPoint(path.id, path.controlPoints, controlPoint.id)}
                                            >
                                              <CircleMinus className="h-4 w-4 text-brand-primary" color="currentColor" />
                                            </Button>
                                            {!controlPoint.isNative ?
                                            <Combobox
                                              items={poses.filter(pose =>
                                                pose.name !== "" &&
                                                (pose.id === controlPoint.poseId || path.controlPoints.every(cp => cp.poseId !== pose.id))
                                              )}
                                              value={poses.find(p => p.id === controlPoint.poseId)?.name || ""}
                                              onValueChange={(value) => {
                                                const selectedPose = poses.find((p) => p.name === value);
                                                updateControlPoint(path.id, path.controlPoints, controlPoint.id, {
                                                  poseId: selectedPose ? selectedPose.id : -1
                                                });
                                                setReRenderCanvas(false)
                                              }}
                                            >
                                              <ComboboxInput placeholder="Select a Pose" className="flex flex-1 w-full bg-zinc-900" />
                                              <ComboboxContent>
                                                <ComboboxEmpty>No poses found</ComboboxEmpty>
                                                <ComboboxList>
                                                  {(pose: Pose) => (
                                                    <ComboboxItem key={pose.id} value={pose.name}>
                                                      {pose.name}
                                                    </ComboboxItem>
                                                  )}
                                                </ComboboxList>
                                              </ComboboxContent>
                                            </Combobox>
                                            
                                            :
                                            <div className="flex flex-row mt-1">
                                              <DropdownMenu modal={false}>
                                                <DropdownMenuTrigger className="mr-2 -ml-1 -mt-0.5 bg-transparent hover:bg-transparent p-0 h-auto">
                                                   <SvgArcPoseIcon className= "size-4 text-[#00cafc]"/>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                  <DropdownMenuGroup>
                                                    <DropdownMenuCheckboxItem 
                                                    checked = {controlPoint.nativeParameter?.arcPose}
                                                    onCheckedChange={(checked)=>{
                                                      updateNativePoint(path.id,controlPoint.id,{arcPose:checked})
                                                    }} 
                                                    onSelect={(e) => e.preventDefault()}>
                                                      Arc Pose
                                                    </DropdownMenuCheckboxItem>
                                                    <DropdownMenuItem 
                                                    onSelect={(e) => e.preventDefault()}
                                                    onPointerMove={(e) => e.preventDefault()} 
                                                    onPointerLeave={(e) => e.preventDefault()}
                                                    >
                                                      <Input
                                                        value={controlPoint.nativeParameter?.radius ?? 0}
                                                        onChange={(e)=>{
                                                          
                                                          updateNativePoint(path.id,controlPoint.id,{radius:handleNumberInput(e)})
                                                        }}
                                                      />
                                                    </DropdownMenuItem>
                                                  </DropdownMenuGroup>
                                                </DropdownMenuContent>
                                              </DropdownMenu>
                                            <div className="mt-1.25 mr-0.5">X:</div>
                                            <Input
                                             placeholder="X"
                                             min={-70.75}
                                             max={70.75}
                                             step={0.1}
                                             value={controlPoint.nativeParameter?.coord.x}
                                             onChange={(e)=>{
                                                updateNativePoint(path.id,controlPoint.id,{
                                                  coord:{x:handleNumberInput(e),y:controlPoint.nativeParameter?.coord.y ?? 0}
                                                })
                                             }}
                                             onBlur={(e)=>handleInputBlur(e,-70.75,70.75)}
                                             className="min-w-20 transition-colors focus-visible:border-red-500 focus-visible:ring-red-500 bg-zinc-900"
                                            />
                                            <div className=" ml-1.5 mr-0.5 mt-1.25">Y:</div>
                                            <Input
                                              placeholder="Y"
                                              min={-70.75}
                                              max={70.75}
                                              value={controlPoint.nativeParameter?.coord.y}
                                              onChange={(e)=>{
                                                updateNativePoint(path.id,controlPoint.id,{
                                                  coord:{y:handleNumberInput(e),x:controlPoint.nativeParameter?.coord.x ?? 0}
                                                })
                                              }}
                                              onBlur={(e)=>handleInputBlur(e,-70.75,70.75)}
                                              className="min-w-20 transition-colors focus-visible:border-red-500 focus-visible:ring-red-500 bg-zinc-900"
                                            />
                                            </div>
                                            }
                                          </div>

                                          <SortableItemHandle asChild>
                                            <Button variant="ghost" size="icon" className="size-8 cursor-grab -ml-1 active:cursor-grabbing text-zinc-400 hover:text-white">
                                              <GripVertical className="h-4 w-4" />
                                            </Button>
                                          </SortableItemHandle>
                                        </div>
                                      </SortableItem>
                                    ))}
                                    <div className="flex flex-row items-center justify-between py-1">
                                      <div className="flex flex-row mt-1">
                                        <div className="mt-1 mr-7">End:</div>
                                        <div className="mt-1.25 mr-0.5">X:</div>
                                        <Input
                                          placeholder="X"
                                          min={-70.75}
                                          max={70.75}
                                          step={0.1}
                                          value={path.endPose.nativeParameter?.coord.x}
                                          onChange={(e)=>{
                                            updateEndPose(path.id,{coord:{
                                              x:handleNumberInput(e),
                                              y:path.endPose.nativeParameter?.coord.y ?? 0
                                            }})
                                          }}
                                          onBlur={(e)=>handleInputBlur(e,-70.75,70.75)}
                                          className="min-w-20 transition-colors focus-visible:border-red-500 focus-visible:ring-red-500 bg-zinc-900"
                                        />
                                        <div className=" ml-1.5 mr-0.5 mt-1.25">Y:</div>
                                        <Input
                                          placeholder="Y"
                                          min={-70.75}
                                          max={70.75}
                                          value={path.endPose.nativeParameter?.coord.y}
                                          onChange={(e)=>{
                                            updateEndPose(path.id,{coord:{
                                              y:handleNumberInput(e),
                                              x:path.endPose.nativeParameter?.coord.x ?? 0
                                            }})
                                          }}
                                          onBlur={(e)=>handleInputBlur(e,-70.75,70.75)}
                                          className="min-w-20 transition-colors focus-visible:border-red-500 focus-visible:ring-red-500 bg-zinc-900"
                                        />
                                      </div>
                                    </div>
                                  </SortableContent>

                                  <SortableOverlay>
                                    <div className="size-full rounded-md bg-primary/10 border border-primary/20" />
                                  </SortableOverlay>
                                </Sortable>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>

                          <Accordion type="single" collapsible defaultValue="item-1" className="w-full" >
                            <AccordionItem value="item-1" className="border-none">
                              <div className="flex flex-row w-full items-center">
                                <AccordionTrigger className="hover:no-underline" >
                                  <div className="flex w-fit flex-row text-xs gap-2 mr-2">
                                    Callbacks ({path.callbacks?.length || 0})
                                  </div>
                                </AccordionTrigger>

                                <Button
                                  className="ml-2 bg-transparent hover:bg-lime-500/25"
                                  onClick={() => addCallback(path.id, path.callbacks)}
                                >
                                  <CirclePlus className="h-4 w-4 text-lime-500" color="currentColor" />
                                </Button>
                              </div>
                              <AccordionContent className="flex h-full flex-col gap-2">
                                { /* TODO: When we add support for converting distance to s value, make sure that they are compared by s value, not just the raw distance */}
                                {(path.callbacks.sort((a, b) => (a.value ?? 0) - (b.value ?? 0)) || []).map((callback) => (
                                  <div className="flex flex-row mt-2 items-center gap-2 text-2xl" key={callback.id}>
                                    <Button className="bg-transparent hover:bg-transparent p-0 h-auto" onClick={() => deleteCallback(path.id, path.callbacks, callback.id)}>
                                      <CircleMinus color="#C00000" />
                                    </Button>
                                    <div className="flex flex-row items-center w-full gap-1">
                                      <Input
                                        id="callback-input"
                                        type="number"
                                        placeholder="Value"
                                        defaultValue={callback.value ?? 0}
                                        onChange={(e) => { // TODO: Handle distance values with units (currently just behaves like an s value regardless)
                                          let final = null;
                                          if (e.target.value !== "") {
                                            const parsed = parseFloat(e.target.value);
                                            if (!isNaN(parsed)) { final = Math.max(0, Math.min(1, parsed)); }
                                          }
                                          updateCallback(path.id, path.callbacks, callback.id, { value: final });
                                        }}
                                        onBlur={(e) => {
                                          if (e.target.value !== "") {
                                            const parsed = parseFloat(e.target.value);
                                            if (!isNaN(parsed)) {
                                              const final = Math.max(0, Math.min(1, parsed));
                                              e.target.value = final.toString();
                                            }
                                          }
                                        }}
                                        className="min-w-16 max-w-20 transition-colors focus-visible:border-red-500 focus-visible:ring-red-500 bg-zinc-900"
                                      />

                                      <div className="ml-1" title="Select whether the value is an S value (normalized 0-1 distance), D (distance units), or A (angular units)">
                                        <Combobox
                                          items={["S", "D", "A"]}
                                          value={callback.valueType}
                                          onValueChange={(value) => {
                                            updateCallback(path.id, path.callbacks, callback.id, {
                                              valueType: value ?? "D"
                                            });
                                          }}
                                        >
                                          <ComboboxInput
                                            className="min-w-14 max-w-14 focus-visible:border-red-500 focus-visible:ring-red-500 bg-zinc-900"
                                          />
                                          <ComboboxContent>
                                            <ComboboxList>
                                              {(item) => (
                                                <ComboboxItem key={item as string} value={item as string}>
                                                  {item as string}
                                                </ComboboxItem>
                                              )}
                                            </ComboboxList>
                                          </ComboboxContent>
                                        </Combobox>
                                      </div>

                                      <div className="self-center-transform">:</div>

                                      <Input
                                        id={`callback-method-${callback.id}`}
                                        type="text"
                                        value={callback.method ?? ""}
                                        onChange={(e) => {
                                          updateCallback(path.id, path.callbacks, callback.id, {
                                            method: e.target.value
                                          });
                                        }}
                                        placeholder="Method"
                                        className="w-full transition-colors focus-visible:border-red-500 focus-visible:ring-red-500 bg-zinc-900"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                        <div className="flex flex-col">
                          <div className="grid grid-cols-2 grid-rows-2 pl-3 pr-3 pt-1 pb-2 gap-1">

                            <Button
                              className={`${path.interpolation.interpolationType == "tangential" ? "bg-brand-primary" : "bg-zinc-900 hover:bg-zinc-700"}`}
                              onClick={() => updateInterpolation(path.id, { interpolationType: "tangential" })}
                            >
                              Tangential
                            </Button>

                            <Button
                              className={`${path.interpolation.interpolationType == "constant" ? "bg-brand-primary" : "bg-zinc-900 hover:bg-zinc-700"}`}
                              onClick={() => updateInterpolation(path.id, { interpolationType: "constant" })}
                            >
                              Constant
                            </Button>

                            <Button
                              className={`${path.interpolation.interpolationType == "smoothToFinish" ? "bg-brand-primary" : "bg-zinc-900 hover:bg-zinc-700"}`}
                              onClick={() => updateInterpolation(path.id, { interpolationType: "smoothToFinish" })}
                            >
                              Smooth To End
                            </Button>

                            <Button
                              className={`${path.interpolation.interpolationType == "nodeBased" ? "bg-brand-primary" : "bg-zinc-900 hover:bg-zinc-700"}`}
                              onClick={() => updateInterpolation(path.id, { interpolationType: "nodeBased" })}
                            >
                              Node Based
                            </Button>
                          </div>
                          <div>

                            <Field className="flex flex-col" hidden={path.interpolation.interpolationType != "tangential"}>

                              <FieldLabel className="ml-3 mt-1.75">Tangent Type:</FieldLabel>
                              <FieldContent>
                                <div className="flex justify-center gap-2 ml-3 mr-3 flex-col rounded-lg">
                                  <Combobox
                                    items={["forward", "backward", "optimal", "custom"]}
                                    value={path.interpolation.tangentialParameter?.tangentialType ?? "forward"}
                                    onValueChange={(value) => {
                                      if (value)
                                        updateTangential(path.id, { tangentialType: value })

                                      if (value == "custom" && path.interpolation.tangentialParameter?.customOffset === undefined) {
                                        updateTangential(path.id, { tangentialType: "custom", customOffset: 0 })
                                      }
                                    }}
                                  >
                                    <ComboboxInput placeholder="Select a Tangential Type" className="flex flex-1 w-full bg-zinc-900" />
                                    <ComboboxContent>
                                      <ComboboxEmpty>No Options found</ComboboxEmpty>
                                      <ComboboxList>
                                        {(item) => (
                                          <ComboboxItem key={item} value={item}>
                                            {item}
                                          </ComboboxItem>
                                        )}
                                      </ComboboxList>
                                    </ComboboxContent>
                                  </Combobox>
                                  <Input
                                    hidden={path.interpolation.tangentialParameter?.tangentialType != "custom"}
                                    type="number"
                                    className="flex justify-center transition-colors focus-visible:border-brand-primary focus-visible:ring-brand-primary bg-zinc-900"
                                    min={-180}
                                    max={180}
                                    placeholder="Offset Angle"
                                    value={path.interpolation.tangentialParameter?.customOffset ?? 0}
                                    onChange={(e) => {
                                      updateTangential(path.id, { customOffset: handleNumberInput(e)})
                                    }}
                                    onBlur={(e) => handleInputBlur(e, -180, 180)}
                                  />
                                </div>
                              </FieldContent>
                            </Field>
                            <div
                              hidden={path.interpolation.interpolationType != "constant"}
                              className="flex justify-center ml-3 mr-3 mt-2 flex-col"
                            >
                              <Field title="Angle is based on the first or last pose's heading values" className="flex flex-col w-full">
                                <FieldLabel className="block">
                                  <div className="block">Constant Angle:</div>
                                </FieldLabel>
                                <FieldContent>
                                  <Combobox
                                    items={["start", "end"]}
                                    value={path.interpolation.constantParameter?.constantType ?? "start"}
                                    onValueChange={(value) => {
                                      if (value)
                                        updateInterpolation(path.id, { constantParameter: {
                                          constantType:value,
                                          heading:path.interpolation.constantParameter?.heading} 
                                        })
                                    }}
                                  >
                                    <ComboboxInput placeholder="Select a Constant Type" className="flex flex-1 w-full bg-zinc-900" />
                                    <ComboboxContent>
                                      <ComboboxEmpty>No Options found</ComboboxEmpty>
                                      <ComboboxList>
                                        {(item) => (
                                          <ComboboxItem key={item} value={item}>
                                            {item}
                                          </ComboboxItem>
                                        )}
                                      </ComboboxList>
                                    </ComboboxContent>
                                  </Combobox>
                                </FieldContent>
                              </Field>

                              <div className="bg-zinc-900 mt-2 rounded-lg">
                                        {path.controlPoints.length >= 1 && (
                                          path.interpolation.constantParameter?.constantType == "start" 
                                            ? 
                                              !path.controlPoints.at(0)?.isNative
                                            :
                                              !path.controlPoints.at(-1)?.isNative
                                            ) ?
                                          <div className="flex justify-center h-7 mt-1">
                                            <p className="mb-px"
                                            hidden = {path.interpolation.constantParameter?.constantType != "start"}
                                            >
                                                Using start pose's heading
                                            </p>
                                            <p className="pb-2" hidden = {path.interpolation.constantParameter?.constantType != "end"}
                                            >
                                                Using end pose's heading
                                            </p>
                                          </div>
                                        :
                                          <p className="flex justify-center mt-3" hidden = {
                                            path.controlPoints.length > 0
                                          }>
                                            Add a control point
                                          </p>
                                        }
                                        <Input
                                          hidden = {
                                            path.interpolation.constantParameter?.constantType == "start" 
                                            ? 
                                              !path.controlPoints.at(0)?.isNative
                                            :
                                              !path.controlPoints.at(-1)?.isNative
                                            
                                          }
                                          type="number"
                                          className="flex justify-center transition-colors focus-visible:border-brand-primary focus-visible:ring-brand-primary bg-zinc-900"
                                          min={-180}
                                          max={180}
                                          placeholder="Constant Angle"
                                          value={path.interpolation.constantParameter?.heading ?? 0}
                                          onChange={(e) => {
                                            
                                            updateConstant(path.id,{heading:handleNumberInput(e)})
                                          }}
                                          onBlur={(e) => handleInputBlur(e, -180, 180)}
                                        />
                              </div>
                            </div>
                            <div
                              hidden={path.interpolation.interpolationType != "smoothToFinish"}
                              className="flexjustify-center ml-3 mr-3 mt-2 rounded-lg gap-1"
                            >
                              {path.controlPoints.length > 0 ? (
                                <div className="flex flex-row gap-1 ">
                                  <div className="flex-1 bg-zinc-900 border  rounded-lg h-12 flex flex-col justify-center">
                                    <p hidden={path.controlPoints[0].isNative} className="text-sm pt-3 text-center">
                                      Using start pose's heading
                                    </p>
                                    <Input
                                      hidden={!path.controlPoints[0].isNative}
                                      type = "number"
                                      min={-180}
                                      max={180}
                                      className="w-full text-center grow  border-none"
                                      value={path.interpolation.smoothToEndParameter?.[0] ?? 0}
                                      onChange={(e)=>{
                                        
                                        updateInterpolation(path.id,{smoothToEndParameter:[
                                          handleNumberInput(e),
                                          path.interpolation.smoothToEndParameter?.[1] ?? 0
                                        ]})
                                      }}
                                      onBlur={(e)=>handleInputBlur(e,-180,180)}
                                    />
                                  </div>
                                  
                                  <div className="flex-1 bg-zinc-900 border rounded-lg h-12 flex flex-col justify-center">
                                    <p hidden={path.controlPoints.at(-1)?.isNative} className="text-sm pt-3 text-center">
                                      Using end pose's heading
                                    </p>
                                    <Input
                                      hidden={!path.controlPoints.at(-1)?.isNative}
                                      type = "number"
                                      min={-180}
                                      max={180}
                                      className="w-full text-center grow  border-none"
                                      value={path.interpolation.smoothToEndParameter?.[1] ?? 0}
                                      onChange={(e)=>{
                                        updateInterpolation(path.id,{smoothToEndParameter:[
                                          path.interpolation.smoothToEndParameter?.[1] ?? 0,
                                          handleNumberInput(e)
                                        ]})
                                      }}
                                      onBlur={(e)=>handleInputBlur(e,-180,180)}
                                    />
                                  </div>
                                </div>
                                )
                                :
                                <div>
                                  <p className="bg-zinc-900 p-4 flex justify-center mt-3 rounded-lg" >
                                    Add a control point
                                  </p>
                                </div>
                              }
                            </div>
                            <div hidden={path.interpolation.interpolationType != "nodeBased"} className="bg-zinc-900 rounded-lg mr-3 ml-3">
                              <Accordion type="single" className="w-full" collapsible >
                                <AccordionItem value="item-1" className="w-full">
                                  <div className="flex flex-row">
                                    <Button
                                      className="ml-2 mr-1 mt-1 bg-transparent hover:bg-lime-500/25"
                                      onClick={() => {
                                        addNode(path.id)
                                      }}
                                    >
                                      <CirclePlus className="h-4 w-4 text-lime-500" color="currentColor" />
                                    </Button>

                                    <AccordionTrigger className="hover:no-underline">
                                      <div className="flex w-full grow flex-row text-md items-center -mt-0.5 ml-3 mr-2 ">
                                        Nodes
                                      </div>
                                    </AccordionTrigger>
                                  </div>
                                  <AccordionContent className="h-fit">
                                    <div>
                                      {path.interpolation.nodeBasedParameter?.map((node) => (
                                        <div key={node.id} className="flex flex-row"> 
                                          <div className="flex ml-3 pr-1 mt-2 grow gap-1 text-xs flex-row">
                                            <div className="mt-0.75 flex flex-row gap-3 "><div>{"S"}</div> <div> {" ->"} </div><div className="-ml-2">angle:</div></div>
                                            <Input
                                            step={0.1}
                                            
                                              type="number"
                                              className="-mt-1 min-w-10 flex justify-center transition-colors focus-visible:border-brand-primary focus-visible:ring-brand-primary bg-zinc-900"
                                              min={0}
                                              max={1}
                                              value={node.s}
                                              onChange={(e)=>{
                                                updateNode(path.id,node.id,{s:handleNumberInput(e)})
                                              }}
                                              onBlur={(e)=>handleInputBlur(e,0,1)}
                                              placeholder="S" />
                                            <p className="ml-2 mt-0.75">{"->"}</p>
                                            <Input
                                              type="number"
                                              className="-mt-1 min-w-5 mr-2 flex justify-center transition-colors focus-visible:border-brand-primary focus-visible:ring-brand-primary bg-zinc-900"
                                              min={-180}
                                              max={180}
                                              value={node.angle}
                                              onChange={(e)=>{
                                                updateNode(path.id,node.id,{angle:handleNumberInput(e)})
                                              }}
                                              onBlur={(e)=>handleInputBlur(e,-180,180)}
                                              placeholder="Angle"/>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            className="mr-5 -mt-1 bg-transparent hover:bg-transparent p-0 h-auto"
                                            onClick={() => {
                                              deleteNode(path.id,node.id)
                                            }}
                                          >
                                            <CircleMinus className="h-4 w-4 text-brand-primary" color="currentColor" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </SortableItem>
            ))}
          </SortableContent>
          <SortableOverlay>
            <div className="size-full rounded-md bg-primary/10 border border-primary/20" />
          </SortableOverlay>
        </Sortable>
      </ScrollArea>
    </div>
  );
}