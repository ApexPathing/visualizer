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
}


interface Interpolation{
  interpolationType: "linear" | "piecewise" | "constant" | "tangential" // name of the type
   // number is for constant, [number,number] is for linear, boolean is for reversed tangential
   // Interpolation[] is for piecewise and contains all other interpolations in it, [number, number, Interpolation] is
   // t value and corresponding interpolation for that t range
  interpolationParameter: number | [number,number] | boolean | Interpolation[] | [number , number, Interpolation]
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

