'use client'

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ChevronDown, CircleMinus, CirclePlus, GripVertical, Plus } from "lucide-react";
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

interface PathControlProps {
  poses: Pose[];
  paths: Path[];
  setPaths: Dispatch<SetStateAction<Path[]>>;
  addPath: () => void;
  updatePath: (id: number, updatedFields: Partial<Path>) => void;
  deletePath: (id: number) => void;
  deleteControlPoint: (pathId: number, currentPoints: ControlPoint[], controlPointId: number) => void;
  addControlPoint: (pathId: number, currentPoints?: ControlPoint[]) => void;
  updateControlPoint: (pathId: number, currentPoints: ControlPoint[], controlPointId: number, updatedFields: Partial<ControlPoint>) => void;
  addCallback: (pathId: number, currentCallbacks?: Callback[]) => void;
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
}

export default function PathControls({
  poses,
  paths,
  setPaths,
  addPath,
  updatePath,
  deletePath,
  deleteControlPoint,
  addControlPoint,
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
  deleteNode
}: PathControlProps) {



  //copied from Dylan's code in pose-controls and tweaked for interpolation, thanks Dylan!

  function handleInputBlur(e: React.FocusEvent<HTMLInputElement>, min: number, max: number) {
    if (e.target.value !== "") {
      const parsed = parseFloat(e.target.value);
      if (!isNaN(parsed)) {
        const final = Math.max(min, Math.min(max, parsed));
        e.target.value = final.toString();
      }
    }
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!paths[currentPathIndex]) return;
    scrollToSection(`${paths[currentPathIndex].id}`)
  }, [paths, currentPathIndex])

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
                                  onClick={() => addControlPoint(path.id, path.controlPoints)}
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
                                  <SortableContent className="flex flex-col gap-2">
                                    {(path.controlPoints || []).map((controlPoint) => (
                                      <SortableItem key={controlPoint.id} value={controlPoint.id} asChild>
                                        <div className="flex flex-row items-center justify-between gap-4 py-1">
                                          <div className="flex flex-row items-center w-full gap-2">
                                            <Button
                                              variant="ghost"
                                              className="bg-transparent hover:bg-transparent p-0 h-auto"
                                              onClick={() => deleteControlPoint(path.id, path.controlPoints, controlPoint.id)}
                                            >
                                              <CircleMinus className="h-4 w-4 text-brand-primary" color="currentColor" />
                                            </Button>
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
                                          </div>

                                          <SortableItemHandle asChild>
                                            <Button variant="ghost" size="icon" className="size-8 cursor-grab active:cursor-grabbing text-zinc-400 hover:text-white">
                                              <GripVertical className="h-4 w-4" />
                                            </Button>
                                          </SortableItemHandle>
                                        </div>
                                      </SortableItem>
                                    ))}
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
                              Linear
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
                                      const parsed = parseFloat(e.target.value)
                                      let final = parsed;

                                      if (isNaN(parsed)) final = 0;
                                      if (parsed === null || isNaN(parsed) || parsed === undefined) final = 0;
                                      updateTangential(path.id, { customOffset: final })
                                    }}
                                    onBlur={(e) => handleInputBlur(e, -180, 180)}
                                  />
                                </div>
                              </FieldContent>
                            </Field>
                            <div
                              hidden={path.interpolation.interpolationType != "constant"}
                              className="flex justify-center ml-3 mr-3 mt-2"
                            >
                              <Field title="Angle is based on the first or last pose's heading values" className="flex flex-col w-full">
                                <FieldLabel className="block">
                                  <div className="block">Constant Angle</div>
                                  <div className="block mt-1 text-[10px]">{"Uses heading of Control Point at the front or end of this path."}</div>

                                </FieldLabel>
                                <FieldContent>

                                  <Combobox
                                    items={["front", "end"]}
                                    value={path.interpolation.constantParameter ?? "front"}
                                    onValueChange={(value) => {
                                      if (value)
                                        updateInterpolation(path.id, { constantParameter: value })
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
                            </div>
                            <div
                              hidden={path.interpolation.interpolationType != "smoothToFinish"}
                              className="flex flex-row justify-center ml-3 mr-3 gap-1 mt-2 border rounded-lg bg-zinc-900"
                            >
                              <div className="m-3">Defined by headings of start and end control points of this path.</div>
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
                                      <div className="flex w-full grow flex-row text-md -mt-0.5 ml-3 mr-2 ">
                                        Nodes
                                      </div>
                                    </AccordionTrigger>
                                  </div>
                                  <AccordionContent className="h-fit">
                                    <div>
                                      {path.interpolation.nodeBasedParameter?.map((node) => (
                                        <div key={node.id} className="flex flex-row"> 
                                          <div className="flex ml-4 pr-1 mt-2 grow gap-3 flex-row">
                                            {"S:"}
                                            <Input
                                            step={0.1}
                                              type="number"
                                              className="-mt-1 min-w-10 flex justify-center transition-colors focus-visible:border-brand-primary focus-visible:ring-brand-primary bg-zinc-900"
                                              min={0}
                                              max={1}
                                              value={node.s}
                                              onChange={(e)=>{
                                                const parsed = parseFloat(e.target.value)
                                                let final = parsed;
                                                if(isNaN(parsed) || parsed === undefined) final = 0;
                                                updateNode(path.id,node.id,{s:final})
                                              }}
                                              onBlur={(e)=>handleInputBlur(e,0,1)}
                                              placeholder="S" />
                                            <p className="ml-2 gap-2">{"->"}</p>
                                            <Input
                                              type="number"
                                              className="-mt-1 min-w-5 mr-2 flex justify-center transition-colors focus-visible:border-brand-primary focus-visible:ring-brand-primary bg-zinc-900"
                                              min={-180}
                                              max={180}
                                              value={node.angle}
                                              onChange={(e)=>{
                                                const parsed = parseFloat(e.target.value)
                                                let final = parsed;
                                                if(isNaN(parsed) || parsed === undefined) final = 0;
                                                updateNode(path.id,node.id,{angle:final})
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