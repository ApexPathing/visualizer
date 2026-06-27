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

interface Path {
  id: number
  name: string
  controlPoints: ControlPoint[]
  callbacks: Callback[]
  quickBuild: boolean
  holonomic: boolean
}