'use client'

import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CircleMinus, GripVertical, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Sortable, SortableContent, SortableItem, SortableItemHandle, SortableOverlay } from "./ui/sortable";

interface PoseControlProps {
  deletePose: (id: number) => void;
  poses: Pose[];
  addPose: () => void;
  updatePose: (id: number, updatedFields: Partial<Pose>) => void;
  setPoses: Dispatch<SetStateAction<Pose[]>>;
}

export default function PoseControls ({
  poses, deletePose, addPose, updatePose, setPoses
}: PoseControlProps) {

  
  function checkForDuplicateName(e: React.FocusEvent<HTMLInputElement>, poseId: number) {
    if (e.target.value.trim() === "") { updatePose(poseId, { name: "" }); return; }
    if (!poses.every(p => e.target.value !== p.name)) {
      let suffix = 1;
      let newName = e.target.value;
      while (!poses.every(p => newName !== p.name)) {
        newName = `${e.target.value}_${suffix}`;
        suffix++;
      }
      updatePose(poseId, { name: newName });
      e.target.value = newName;
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>, poseId: number, field: keyof Pose, min: number, max: number) {
    let final = null;
    if (e.target.value !== "") {
      const parsed = parseFloat(e.target.value);
      if (!isNaN(parsed)) { final = Math.max(min, Math.min(max, parsed)); }
    }
    updatePose(poseId, { [field]: final });
  }

  function handleInputBlur(e: React.FocusEvent<HTMLInputElement>, poseId: number, field: keyof Pose, min: number, max: number) {
    if (e.target.value !== "") {
      const parsed = parseFloat(e.target.value);
      if (!isNaN(parsed)) {
        const final = Math.max(min, Math.min(max, parsed));
        e.target.value = final.toString();
      }
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Button className="flex mt-4 mx-4" onClick={addPose}>
        <Plus className="mr-2 h-4 w-4" /> Add Pose
      </Button>

      <ScrollArea className="w-full flex-1 min-h-0 p-4">
        <Sortable
          value={poses}
          onValueChange={setPoses}
          getItemValue={(pose) => pose.id}
        >
          <SortableContent className="flex flex-col w-full">
            {poses.map((pose) => (
              <SortableItem key={pose.id} value={pose.id} className="hover:transparent" asChild>
                <div className="p-1">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={`${pose.id}`} className="border-none">
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
                              id={`name-${pose.id}`}
                              type="text"
                              placeholder="Pose Name"
                              defaultValue={pose.name}
                              className="transition-colors focus-visible:border-red-500 focus-visible:ring-red-500 bg-zinc-900"
                              onChange={(e) => updatePose(pose.id, { name: e.target.value })}
                              onBlur={(e) => checkForDuplicateName(e, pose.id)}
                            />
                          </div>

                          <div className="flex items-center pointer-events-auto">
                            <Button
                              className="bg-transparent hover:bg-brand-primary/25"
                              onClick={() => deletePose(pose.id)}
                            >
                              <CircleMinus className="h-8 w-8 text-brand-primary" color="currentColor" />
                            </Button>
                          </div>
                        </div>

                        <AccordionTrigger
                          className="absolute inset-0 z-0 flex h-full w-full items-center justify-between p-0 pr-2 border-none hover:no-underline text-zinc-400"
                        >
                          <span className="sr-only">Toggle Pose</span>
                        </AccordionTrigger>
                      </div>

                      <AccordionContent className="pt-2 pb-4">
                        <div className="flex flex-col gap-4 ml-4">
                          <div className="grid grid-cols-2 gap-2">
                            <Field>
                              <FieldLabel htmlFor={`x-${pose.id}`} className="text-white text-xs">
                                X (unit):
                              </FieldLabel>
                                <Input
                                  id={`x-${pose.id}`}
                                  type="number"
                                  placeholder="X"
                                  min={-70.75}
                                  max={70.75}
                                  className="w-20 transition-colors focus-visible:border-red-500 focus-visible:ring-red-500 bg-zinc-900"
                                  defaultValue={pose.x ?? 0}
                                  onChange={(e) => handleInputChange(e, pose.id, 'x', -70.75, 70.75)}
                                  onBlur={(e) => handleInputBlur(e, pose.id, 'x', -70.75, 70.75)}
                                />
                            </Field>
                            <Field>
                              <FieldLabel htmlFor={`y-${pose.id}`} className="text-white text-xs">
                                Y (unit):
                              </FieldLabel>
                              <Input
                                id={`y-${pose.id}`}
                                type="number"
                                placeholder="Y"
                                min={-70.75}
                                max={70.75}
                                className="w-20 transition-colors focus-visible:border-red-500 focus-visible:ring-red-500 bg-zinc-900"
                                defaultValue={pose.y ?? 0}
                                onChange={(e) => handleInputChange(e, pose.id, 'y', -70.75, 70.75)}
                                onBlur={(e) => handleInputBlur(e, pose.id, 'y', -70.75, 70.75)}
                              />
                            </Field>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Field>
                              <FieldLabel htmlFor={`heading-${pose.id}`} className="text-white text-xs">
                                Heading (unit):
                              </FieldLabel>
                              <Input
                                id={`heading-${pose.id}`}
                                type="number"
                                placeholder="Heading"
                                min={0}
                                max={360}
                                className="w-20 transition-colors focus-visible:border-red-500 focus-visible:ring-red-500 bg-zinc-900"
                                defaultValue={pose.heading ?? 0}
                                onChange={(e) => handleInputChange(e, pose.id, 'heading', 0, 360)}
                                onBlur={(e) => handleInputBlur(e, pose.id, 'heading', 0, 360)}
                              />
                            </Field>

                            <Field>
                              <FieldLabel htmlFor={`radius-${pose.id}`} className="text-white text-xs">
                                Radius (unit):
                              </FieldLabel>
                              <Input
                                id={`radius-${pose.id}`}
                                type="number"
                                placeholder="Radius"
                                disabled={!pose.arcPose} // TODO: Add limits and clamping for radius (make sure to account for units)
                                className="w-20 transition-all duration-300 ease-in-out focus-visible:border-red-500 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-40 bg-zinc-900"
                                defaultValue={pose.radius ?? 0}
                                onChange={(e) => handleInputChange(e, pose.id, 'radius', 0, 100)}
                                onBlur={(e) => handleInputBlur(e, pose.id, 'radius', 0, 100)} // TODO: Proper limits
                              />
                            </Field>
                          </div>

                          <div className="flex flex-row gap-4">
                            <div className="flex items-center space-x-2 mt-1">
                              <Switch
                                id={`arc-pose-${pose.id}`}
                                checked={pose.arcPose}
                                onCheckedChange={(checked: boolean) => {
                                  updatePose(pose.id, { arcPose: checked, radius: checked ? 2 : 0 });
                                }}
                              />
                              <label htmlFor={`arc-pose-${pose.id}`} className="text-xs cursor-pointer select-none">
                                Arc Pose
                              </label>
                            </div>

                            <div className="flex flex-1 w-full gap-2 mt-1">
                              <button
                                type="button"
                                onClick={() => updatePose(pose.id, { local: true })}
                                className={`flex-1 rounded-md justify-center text-center text-xs h-7 font-semibold transition-colors ${pose.local ? "bg-brand-primary" : "bg-zinc-800 hover:bg-zinc-700"}`}
                              >
                                Local
                              </button>
                              <button
                                type="button"
                                onClick={() => updatePose(pose.id, { local: false })}
                                className={`flex-1 rounded-md justify-center text-center text-xs h-7 font-semibold transition-colors ${!pose.local ? "bg-brand-primary" : "bg-zinc-800 hover:bg-zinc-700"}`}
                              >
                                Global
                              </button>
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
            <div className="size-full rounded-none bg-primary/10" />
          </SortableOverlay>
        </Sortable>
      </ScrollArea>
    </div>
  );
}