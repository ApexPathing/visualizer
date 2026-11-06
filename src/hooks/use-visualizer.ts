import { useState, useCallback } from "react";
import { create } from 'zustand'

export const Poses = () => {
  const [poses, setPoses] = useState<Pose[]>([]);

  const addPose = () => {
    setPoses((prevPoses) => {
      const nextNumber = prevPoses.length + 1;

      const newPose: Pose = {
        id: Date.now(),
        name: `pose${nextNumber}`,
        x: 0,
        y: 0,
        heading: 0,
        radius: 0,
        arcPose: false,
        local: false,
        color: '#008000',
        open: " "
      };

      return [...prevPoses, newPose];
    });
  };

  const updatePose = (id: number, updatedFields: Partial<Pose>) => {
    setPoses((prev) =>
      prev.map((pose) =>
        pose.id === id ? { ...pose, ...updatedFields } : pose
      )
    );
  };

  const deletePose = useCallback((id: number) => {
    setPoses((prev) => prev.filter((pose) => pose.id !== id));
  }, []);

  

  return { poses, deletePose, addPose, updatePose, setPoses };
}



export const Paths = () => {
  const [paths, setPaths] = useState<Path[]>([]);

  const addPath = () => {
    setPaths((prevPaths) => {
      const nextNumber = prevPaths.length + 1;
    
      const newPath: Path = {
        id: Date.now(),
        name: `path${nextNumber}`,
        controlPoints: [],
        callbacks: [],
        holonomic: true,
        color: "#2563eb",
        open: " ",


        interpolation:{
          interpolationType: "tangential",
          tangentialParameter: {tangentialType:"forward"},
          smoothToEndParameter:[0,0],
          constantParameter: {constantType:"start",heading:undefined},
          nodeBasedParameter:[]
        }
      };
      
      return [...prevPaths, newPath];
    });
  };

  const updatePath = (id: number, updatedFields: Partial<Path>) => {
    setPaths((prev) =>
      prev.map((path) =>
        path.id === id ? { ...path, ...updatedFields } : path
      )
    );
  };

  const deletePath = useCallback((id: number) => {
    setPaths((prev) => prev.filter((path) => path.id !== id));
  }, [setPaths]);

  const addExternalControlPoint = (pathId: number, currentPoints: ControlPoint[] = []) => {
    const newPoint: ControlPoint = {
      id: Date.now(),
      poseId: null,
      pathId: pathId,
      isNative:false
    };
    updatePath(pathId, {
      controlPoints: [...currentPoints, newPoint]
    });
  };

  const addNativeControlPoint = (pathId:number)=>{
    const path = paths.find((p)=>p.id==pathId)
    const controlPoints = path?.controlPoints

    const newCP:ControlPoint = {
      id:Date.now(),
      poseId:null,
      pathId:pathId,
      isNative:true,
      nativeCoords:{
        x:0,
        y:0
      }
    }

    updatePath(pathId,{
      controlPoints: [...controlPoints ?? [], newCP]
    })
  }

  const updateControlPoint = (pathId: number, currentPoints: ControlPoint[], controlPointId: number, updatedFields: Partial<ControlPoint>) => {
    const updatedPoints = currentPoints.map((point) =>
      point.id === controlPointId ? { ...point, ...updatedFields } : point
    );
    updatePath(pathId, { controlPoints: updatedPoints });
  };
  const updateNativeCoords = (pathId:number,CPID:number,updatedFields:Partial<Vector>)=>{
     const path = paths.find((p)=>p.id==pathId)
     if(path){
      path.controlPoints.forEach((CP)=> CP.id == CPID &&
       updateControlPoint(pathId,path.controlPoints,CPID,{nativeCoords:{...CP.nativeCoords ?? {x:0,y:0}, ...updatedFields}}))
    }
  }

  const deleteControlPoint = (pathId: number, currentPoints: ControlPoint[], controlPointId: number) => {
    const filteredPoints = currentPoints.filter((point) => point.id !== controlPointId);
    updatePath(pathId, { controlPoints: filteredPoints });
  };

  const addCallback = (pathId: number, currentCallbacks: Callback[] = []) => {
    const newCallback: Callback = {
      id: Date.now(),
      method: "",
      value: 0,
      valueType: "D"
    };
    updatePath(pathId, {
      callbacks: [...currentCallbacks, newCallback]
    });
  };
  const updateCallback = (pathId: number, currentCallbacks: Callback[], callbackId: number, updatedFields: Partial<Callback>) => {
    const updatedCallbacks = currentCallbacks.map((callback) =>
      callback.id === callbackId ? { ...callback, ...updatedFields } : callback
    );
    updatePath(pathId, { callbacks: updatedCallbacks });
  };
  const deleteCallback = (pathId: number, currentCallbacks: Callback[], callbackId: number) => {
    const filteredCallbacks = currentCallbacks.filter((callback) => callback.id !== callbackId);
    updatePath(pathId, { callbacks: filteredCallbacks });
  };

  

  const updateInterpolation = (pathId:number, updatedFields:Partial<Interpolation>) =>{
    const interpolation = paths[paths.findIndex((path)=>path.id ==pathId)].interpolation

    const newInterpolation = {...interpolation, ... updatedFields}
    

    updatePath(pathId,{interpolation:newInterpolation})
  }
  const updateConstant = (pathId:number, updatedFields:Partial<ConstantParameter>) =>{
    const path = paths.find((p)=>p.id==pathId)
    const constantParameter = path?.interpolation.constantParameter
    if(constantParameter){
     
      updateInterpolation(path.id,{constantParameter:{...constantParameter, ... updatedFields}})
    }
  }
  const updateTangential = (pathId: number, updatedFields: Partial<TangentialParameter>) => {
    const path = paths.find((p) => p.id === pathId);
    if (!path) return;
  
    const currentTangential:TangentialParameter = path.interpolation.tangentialParameter ?? {tangentialType:"forward"};
  
    
    const newTangentialParameter = {
      ...currentTangential,
      ...updatedFields
    };
  
   
    updatePath(pathId, {
      interpolation: {
        ...path.interpolation,
        tangentialParameter: newTangentialParameter
      }
    });
  };


  const addNode = (pathId:number)=>{
    const path = paths.find((p)=>p.id==pathId)
    const nodes = path?.interpolation.nodeBasedParameter

    const newNode = {
      id:Date.now(),
      s: 0.5,
      angle:0
    }

    if(path && nodes) updateInterpolation(pathId,{nodeBasedParameter:[...nodes, newNode]})
  }

  const updateNode = (pathId:number,nodeId:number,updatedFields:Partial<NodeBasedParameter>)=>{

    const path = paths.find((p)=>p.id==pathId)
    const nodes = path?.interpolation.nodeBasedParameter;
    const node = nodes?.find((node)=>node.id==nodeId)

    if(node && nodes){
      const newNodes:NodeBasedParameter[] = nodes.map((n)=>node.id == n.id? {...node, ... updatedFields} : n)

      updateInterpolation(pathId,{nodeBasedParameter:newNodes})
    }
  }


  const deleteNode = (pathId:number, nodeId:number) =>{
    const path = paths.find((p)=>p.id==pathId)
    const nodes = path?.interpolation.nodeBasedParameter;
    if(nodes){
      const updatedNodes = nodes.filter((node)=>node.id != nodeId)
      updateInterpolation(pathId,{nodeBasedParameter:updatedNodes})
    }
  }

 
  
  

  return {
    paths,
    setPaths,
    addPath,
    updatePath,
    deletePath,
    addExternalControlPoint,
    updateControlPoint,
    updateNativeCoords,
    deleteControlPoint,
    addCallback,
    addNativeControlPoint,
    updateCallback,
    deleteCallback,
    updateInterpolation,
    updateTangential,
    addNode,
    updateNode,
    deleteNode,
    updateConstant
  }
}




export const Settings = create<Settings>()((set) => ({
  dtType: "holonomic",
  setDtType: (updated) => set({dtType:updated}),
  measureSys: "in",
  setMeasureSys: (updated) => set({measureSys:updated}),
  buildType: "default",
  setBuildType:(updated) => set({buildType:updated}),
  image: "./images/biobuzzField.png",
  setImage: (updated) =>set({image: updated})
}))

export const ReRender = () => {

  //this will work by sending a state change from the page.tsx to the path-overlay ot re-render it, hopefully fixing the resize problem
  const [reRenderCanvas,setReRenderCanvas] = useState<boolean>(true)

  return{
    reRenderCanvas,
    setReRenderCanvas
  }
}

