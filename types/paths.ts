interface Callback {
  id: number
  method: string
  value: number // TODO: Replace with just s and convert from distance to s when creating
  distValue: boolean // true if the value is a distance, false if it is an s value
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
  prevEndPose: ControlPoint | null
}