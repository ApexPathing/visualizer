'use client'

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button";

import { Dispatch, SetStateAction } from "react";
import { CircleMinus, CirclePlus, GripVertical, Plus } from "lucide-react";
import { Input } from "./ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "./ui/combobox";
import { Sortable, SortableContent, SortableItem, SortableItemHandle, SortableOverlay } from "./ui/sortable";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

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
  deleteCallback
}: PathControlProps) {
  poses = poses || [];

  return (
    <div className="flex h-full flex-col">
      <Button className="flex mt-4 mx-4" onClick={addPath}>
        <Plus /> Add Path
      </Button>

      <ScrollArea className="w-full flex-1 min-h-0 p-4">
        <Sortable
          value={paths}
          onValueChange={setPaths}
          getItemValue={(path) => path.id}
        >
          <Table>
            <SortableContent asChild>
              <TableBody>
                {paths.map((path) => (
                  <SortableItem key={path.id} value={path.id} asChild>
                    <TableRow>
                      <TableCell className="w-fit">
                        <SortableItemHandle asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <GripVertical className="h-4 w-4" />
                          </Button>
                        </SortableItemHandle>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex text-white flex-col">
                          <Accordion type="single" collapsible defaultValue="item-1" className="w-full" >
                            <AccordionItem value="item-1">
                              <div className="flex flex-row w-full">
                                <AccordionTrigger>
                                  <div className="flex w-fit flex-row gap-2 mr-2">
                                    <Input
                                      id={`path-${path.id}-name`}
                                      type="text"
                                      placeholder="Path Name"
                                      value={path.name}
                                      className="transition-colors mr-2 focus-visible:border-red-500 focus-visible:ring-red-500"
                                      onChange={(e) => updatePath(path.id, { name: e.target.value })}
                                      onClick={(e) => e.stopPropagation()}
                                      onKeyDown={(e) => {
                                        if (e.key === " ") {
                                          e.preventDefault();
                                        }
                                      }}
                                    />
                                  </div>
                                </AccordionTrigger>
                                <Button className="ml-2 mt-2 bg-[#11111] hover:bg-[#11111]" onClick={() => deletePath(path.id)}>
                                  <CircleMinus color="#C00000" />
                                </Button>
                              </div>

                              <AccordionContent className="flex h-full">
                                <div className="flex flex-col ml-5 w-fit ">
                                  <Accordion type="single" collapsible defaultValue="item-1" className="w-full" >
                                    <AccordionItem value="item-1">
                                      <div className="flex flex-row w-fit">
                                        <AccordionTrigger>
                                          <div className="flex w-fit text-xs flex-row gap-2 mr-2">
                                            Control Points
                                          </div>
                                        </AccordionTrigger>
                                        <Button
                                          className="ml-2 mt-1 bg-transparent hover:bg-transparent"
                                          onClick={() => addControlPoint(path.id, path.controlPoints)}
                                        >
                                          <CirclePlus color="#03fc0f" />
                                        </Button>
                                      </div>
                                      <AccordionContent className="flex flex-col h-full">
                                        <Sortable
                                          value={path.controlPoints || []}
                                          onValueChange={(newPoints) => updatePath(path.id, { controlPoints: newPoints })}
                                          getItemValue={(item) => item.id}
                                        >
                                          <Table>
                                            <TableHeader>
                                              <TableRow className="bg-accent/50" />
                                            </TableHeader>
                                            <SortableContent asChild>
                                              <TableBody>
                                                {(path.controlPoints || []).map((controlPoint) => (
                                                  <SortableItem key={controlPoint.id} value={controlPoint.id} asChild>
                                                    <TableRow>
                                                      <TableCell className="font-medium">
                                                        <div className="flex flex-row w-fit" key={controlPoint.id}>
                                                          <div className="flex">
                                                            <Button
                                                              className="bg-transparent hover:bg-transparent"
                                                              onClick={() => deleteControlPoint(path.id, path.controlPoints, controlPoint.id)}
                                                            >
                                                              <CircleMinus color="#C00000" />
                                                            </Button>
                                                          </div>
                                                          <div className="flex flex-row">
                                                            <Combobox
                                                              items={poses.map((p) => p)}
                                                              onValueChange={(value) => {
                                                                updateControlPoint(path.id, path.controlPoints, controlPoint.id, {
                                                                  poseId: (value as number) || -1
                                                                });
                                                              }}
                                                            >
                                                              <ComboboxInput placeholder="Select a Pose" />
                                                              <ComboboxContent>
                                                                <ComboboxEmpty>No poses found</ComboboxEmpty>
                                                                <ComboboxList>
                                                                  {(pose: Pose) => (
                                                                    <ComboboxItem key={pose.id} value={pose.id}>
                                                                      {pose.name}
                                                                    </ComboboxItem>
                                                                  )}
                                                                </ComboboxList>
                                                              </ComboboxContent>
                                                            </Combobox>
                                                          </div>
                                                        </div>
                                                      </TableCell>
                                                      <TableCell className="w-fit">
                                                        <SortableItemHandle asChild>
                                                          <Button variant="ghost" size="icon" className="size-8">
                                                            <GripVertical className="h-4 w-4" />
                                                          </Button>
                                                        </SortableItemHandle>
                                                      </TableCell>
                                                    </TableRow>
                                                  </SortableItem>
                                                ))}
                                              </TableBody>
                                            </SortableContent>
                                          </Table>
                                          <SortableOverlay>
                                            <div className="size-full rounded-none bg-primary/10" />
                                          </SortableOverlay>
                                        </Sortable>
                                      </AccordionContent>
                                    </AccordionItem>
                                  </Accordion>
                                  <Accordion type="single" collapsible defaultValue="item-1" className="w-full" >
                                    <AccordionItem value="item-1">
                                      <div className="flex flex-row w-full">
                                        <AccordionTrigger>
                                          <div className="flex w-fit flex-row text-xs gap-2 mr-2">
                                            Callbacks
                                          </div>
                                        </AccordionTrigger>

                                        <Button className=" ml-2 mt-1 bg-[#11111] hover:bg-[#11111]" onClick={() => addCallback(path.id, path.callbacks)}>
                                          <CirclePlus color="#03fc0f" />
                                        </Button>
                                      </div>
                                      <AccordionContent className="flex h-full flex-col">
                                        {(path.callbacks || []).map((callback) => (
                                          <div className="flex flex-row mt-2 items-center gap-2 text-2xl" key={callback.id}>
                                            <Button className="bg-transparent hover:bg-transparent" onClick={() => deleteCallback(path.id, path.callbacks, callback.id)}>
                                              <CircleMinus color="#C00000" />
                                            </Button>
                                            <div className="flex flex-row items-center w-full gap-0.5">
                                              <Input
                                                id="callback-input"
                                                type="number"
                                                placeholder="Dist"
                                                value={callback.value}
                                                onChange={(e) => {
                                                  updateCallback(path.id, path.callbacks, callback.id, {
                                                    value: parseFloat(e.target.value) || 0
                                                  });
                                                }}
                                                onClick={() => {
                                                  if (callback.value == 0) {
                                                    updateCallback(path.id, path.callbacks, callback.id, { value: 0 });
                                                  }
                                                }}
                                                className="h-7 min-w-16 max-w-20 transition-colors focus-visible:border-red-500 focus-visible:ring-red-500"
                                              />

                                              <div className="ml-1">
                                                <Combobox
                                                  items={["S", "D"]}
                                                  onValueChange={(value) => {
                                                    updateCallback(path.id, path.callbacks, callback.id, {
                                                      distValue: value === "D"
                                                    });
                                                  }}
                                                >
                                                  <ComboboxInput
                                                    placeholder=""
                                                    className="h-7 min-w-14 max-w-14 focus-visible:border-red-500 focus-visible:ring-red-500"
                                                  />
                                                  <ComboboxContent>
                                                    <ComboboxList>
                                                      {(item) => (
                                                        <ComboboxItem key={item} value={item}>
                                                          {item}
                                                        </ComboboxItem>
                                                      )}
                                                    </ComboboxList>
                                                  </ComboboxContent>
                                                </Combobox>
                                              </div>

                                              <div className="self-center transform -translate-y-0.5 text-white">:</div>

                                              <Input
                                                id="method-input"
                                                type="text"
                                                value={callback.method}
                                                onChange={(e) => {
                                                  updateCallback(path.id, path.callbacks, callback.id, {
                                                    method: e.target.value
                                                  });
                                                }
                                                }
                                                placeholder="Method"
                                                className="h-7 min-w-33 max-w-full transition-colors focus-visible:border-red-500 focus-visible:ring-red-500"
                                              />
                                            </div>
                                          </div>
                                        ))}
                                      </AccordionContent>
                                    </AccordionItem>
                                  </Accordion>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      </TableCell>
                    </TableRow>
                  </SortableItem>
                ))}
              </TableBody>
            </SortableContent>
          </Table>
          <SortableOverlay>
            <div className="size-full rounded-none bg-primary/10" />
          </SortableOverlay>
        </Sortable>
      </ScrollArea>
    </div>
  );
}