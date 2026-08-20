"use client"
import { useCallback, useEffect, useState } from "react";
import { DiscordSVG, GithubSVG } from "./media-icons";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Minus, Plus } from "lucide-react";




export default function PageNavbar() {

  //there was some error with date.now for this, so its using a counter instead
  let counter = 0;

  const [vis,setVis] = useState<Vis[]>(

    [{
    name: "Visualizer 1",
    id: counter,
    only:true,
    }]
  )
  counter+=1


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
        id: counter,
        name: `Visualizer ${nextNumber}`,
        only: false
      };
      counter+=1

      return [...prevVis, newVis];
    });
  };
  const deleteVis = useCallback((id: number) => {
      setVis((prev) => prev.filter((vis) => vis.id !== id));
  }, []);

  const [value,setValue] = useState(`${vis[0].id}`)




  return (
    <div className="flex w-full h-14 border border-border items-center justify-between px-6">
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