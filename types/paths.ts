interface Callback {
  id: number
  method: string | null
  value: number | null
  valueType: "S" | "D" | "A" // S for normalized distance, D for distance units, A for angular units
}

interface ControlPoint {
  id: number
  poseId: number | null // ID of the pose this control point is associated with
  pathId: number | null // ID of the path this control point is associated with
  isNative: boolean
  nativeCoords?: Vector
}

interface nativeControlPoint{
  id:number
  coord:Vector
}


interface Interpolation{
  interpolationType: "smoothToFinish" | "nodeBased" | "constant" | "tangential"
  smoothToEndParameter? : [number,number]//start, end
  tangentialParameter? : TangentialParameter
  constantParameter? : ConstantParameter
  nodeBasedParameter? : NodeBasedParameter[]
}



interface ConstantParameter{
  constantType:"start" | "end",
  heading: number | undefined
}

interface TangentialParameter{
  tangentialType: "forward" | "backward" | "optimal" | "custom"
  customOffset?:number
}

interface NodeBasedParameter{
  id : number
  s:number
  angle:number
}


interface Path {
  id: number
  name: string
  controlPoints: ControlPoint[]
  callbacks: Callback[]
  holonomic: boolean
  color: string
  open: string
  interpolation: Interpolation
}

