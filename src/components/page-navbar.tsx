"use client"
import { useCallback, useEffect, useState } from "react";
import { DiscordSVG, GithubSVG } from "./media-icons";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Minus, Plus, Settings as SettingsIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Paths, ReRender, Settings } from "@/hooks/use-visualizer";
import { Separator } from "./ui/separator";
import { ColorPicker, ColorPickerArea, ColorPickerContent, ColorPickerEyeDropper, ColorPickerHueSlider, ColorPickerInput, ColorPickerSwatch, ColorPickerTrigger } from "./ui/color-picker";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "./ui/combobox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";





export default function PageNavbar() {
  

  const {
    dtType,
    setDtType,
    measureSys,
    setMeasureSys,
    buildType,
    setBuildType,
    setImage
  } = Settings();

  const { 
    reRenderCanvas,
    setReRenderCanvas
  } = ReRender();
  
  
  
  
  const [currentField, setCurrentField] = useState("Decode(2025-2026)")

  const [vis,setVis] = useState<Vis[]>(

    [{
    name: "Visualizer 1",
    id: 1,
    only:true,
    }]
  )
  


  const updateVis = (id: number, updatedFields: Partial<Vis>) => {
    setVis((prev) =>
      prev.map((vis) =>
        vis.id === id ? { ...vis, ...updatedFields } : vis
      )
    );
  };

  
  const addVis = () => {
    setVis((prevVis) => {
      //TODO make the next number based on the current position in the list, so if something gets deleted, everything gets updated
      const nextNumber = prevVis.length + 1;


      const newVis: Vis = {
        id: Date.now(),
        name: `Visualizer ${nextNumber}`,
        only: false
      };
    

      return [...prevVis, newVis];
    });
  };
  const deleteVis = useCallback((id: number) => {
      setVis((prev) => prev.filter((vis) => vis.id !== id));
  }, []);

  const [value,setValue] = useState(`${vis[0].id}`)

  const fields = ["Biobuzz(2026-2027)","Decode(2025-2026)","Into The Deep(2024-2025)","Import your own"]

  const [importHidden,setImportHidden] = useState<boolean>(true) //true for hidden, false for shown


  return (
    <div className="flex w-full h-14 border rounded-lg border-border items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <img src="./logo_icon.svg" alt="Logo" className="mr-2 size-7" />
        <span className="font-bold">Apex Pathing Visualizer</span>
      </div>

      <div className="flex flex-row mr-40 gap-4">
        <ScrollArea className="w-100 h-14 border-2 rounded-md border-gray-500  ">
          <div className="flex flex-row">
            
            <Tabs className = "mt-2" value={value} onValueChange={(newValue)=>setValue(newValue)}>
              <TabsList>  
                  {vis.map((vises)=>(
                    <div key = {vises.id} className="flex flex-row">
                      
                      <TabsTrigger className = "flex flex-row" value={`${vises.id}`}>
                    
                        {vises.name}

                        
                    
                      </TabsTrigger>
                      <Button onClick={
                        ()=>{
                          deleteVis(vises.id);
                        }
                        
                        } hidden = {vises.only} size={"sm"} className="bg-transparent hover:bg-transparent ">
                        <Minus color={"#C00000"}/>
                      </Button>
                      
                    </div>
                  ))}
              </TabsList>
            </Tabs>
          </div>

        
        <ScrollBar orientation="horizontal" className=" [&>div]:bg-[#C00000] hover:[&>div]:bg-[#C00000]"/>

        </ScrollArea>

        <Button 
          onClick={()=>{
            addVis();
          }} 
        className="mt-2.5 bg-transparent hover:bg-brand-primary/25">
            <Plus/>
        </Button>
      </div>

      <div>
          <Dialog>
            <DialogTrigger>
              
              <SettingsIcon/>

            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
                <DialogDescription>
                  Here, you may customize certain parameters to your liking!
                </DialogDescription>
              </DialogHeader>

              <div>
                <h1>Measurment Unit:</h1>
                <div className="flex flex-1 w-full h-full gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setMeasureSys("in")}
                    className={`flex-1 rounded-md justify-center text-center text-xs h-7 font-semibold transition-colors ${measureSys == "in" ? "bg-brand-primary" : "bg-zinc-800 hover:bg-zinc-700"}`}
                  >
                    IN
                  </button>
                  <button
                    type="button"
                    onClick={() => setMeasureSys("cm")}
                    className={`flex-1 rounded-md justify-center text-center text-xs h-7 font-semibold transition-colors ${measureSys == "cm" ? "bg-brand-primary" : "bg-zinc-800 hover:bg-zinc-700"}`}
                  >
                    CM
                  </button>
                  <button
                    type="button"
                    onClick={() => setMeasureSys("m")}
                    className={`flex-1 rounded-md justify-center text-center text-xs h-7 font-semibold transition-colors ${measureSys == "m" ? "bg-brand-primary" : "bg-zinc-800 hover:bg-zinc-700"}`}
                  >
                    M
                  </button>
                  <button
                    type="button"
                    onClick={() => setMeasureSys("ft")}
                    className={`flex-1 rounded-md justify-center text-center text-xs h-7 font-semibold transition-colors ${measureSys == "ft" ? "bg-brand-primary" : "bg-zinc-800 hover:bg-zinc-700"}`}
                  >
                    FT
                  </button>
                </div>
              </div>

              <div>
                <h1>Drivetrain Type:</h1>
                <div className="flex flex-1 w-full gap-2 mt-1">
                  <button
                      type="button"
                      onClick={() => {
                        setDtType("holonomic")
                      }}
                      className={`flex-1 rounded-md justify-center text-center text-xs h-7 font-semibold transition-colors ${ dtType == "holonomic" ? "bg-brand-primary" : "bg-zinc-800 hover:bg-zinc-700"}`}
                    >
                      Holonomic
                    </button>
                    <button
                      type="button"
                      value={"tank"}
                      onClick={() => {
                        setDtType("tank")
                      }}
                      className={`flex-1 rounded-md justify-center text-center text-xs h-7 font-semibold transition-colors ${dtType == "tank" ? "bg-brand-primary" : "bg-zinc-800 hover:bg-zinc-700"}`}
                    >
                      Tank
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDtType("butterfly")
                      }}
                      className={`flex-1 rounded-md justify-center text-center text-xs h-7 font-semibold transition-colors ${dtType == "butterfly" ? "bg-brand-primary" : "bg-zinc-800 hover:bg-zinc-700"}`}
                    >
                      Butterfly
                    </button>
                  </div>
              </div>

              <div>
                <h1>Build Type:</h1>
                <div className="flex flex-1 w-full gap-2 mt-1">
                  <button
                      type="button"
                      onClick={() => setBuildType("quick")}
                      className={`flex-1 rounded-md justify-center text-center text-xs h-7 font-semibold transition-colors ${buildType == "quick" ? "bg-brand-primary" : "bg-zinc-800 hover:bg-zinc-700"}`}
                    >
                      Quick Build
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuildType("default")}
                      className={`flex-1 rounded-md justify-center text-center text-xs h-7 font-semibold transition-colors ${buildType == "default" ? "bg-brand-primary" : "bg-zinc-800 hover:bg-zinc-700"}`}
                    >
                      Default Build
                    </button>
                  </div>
              </div>
              <div>
                <h1>File:</h1>
                
                <Combobox  items={fields} value={currentField}  onValueChange={(value)=>{

                    if(value)setCurrentField(value);

                    if(value != "Import your own") setImportHidden(true)
                    if(value == "Decode(2025-2026)") setImage("./images/decodeField.png")
                    if(value == "Into The Deep(2024-2025)") setImage("./images/intoTheDeepField.png")
                    if(value == "Biobuzz(2026-2027)") setImage("./images/biobuzzField.png")
                    else if(value == "Import your own") setImportHidden(false)

                 }}
                 >
                  <ComboboxInput placeholder="Select a framework" />
                  <ComboboxContent className="pointer-events-auto">
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <Input type="file" hidden = {importHidden}
                 className="mt-3"
                 onChange={(event)=>{
                  const target = event.target as HTMLInputElement
                  const file = target.files?.[0]

                  if(file){
                    const url = URL.createObjectURL(file);
                    setImage(url)
                    setReRenderCanvas(!reRenderCanvas)
                  }
                  
                  

                 }}
                />
              </div>
            </DialogContent>
          </Dialog>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <a
          href="https://github.com/ApexPathing"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GithubSVG className="size-7" />
        </a>
        <a
          href="https://discord.gg/qpP4CXaHDg"
          target="_blank"
          rel="noopener noreferrer"
        >
          <DiscordSVG className="size-7" />
        </a>
      </div>
    </div>
  );
}