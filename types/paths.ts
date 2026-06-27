enum CallbackType {
  S = 'S',
  DISTANCE = 'D',
  ANGULAR = 'A'
}

interface Callback {
  id: number
  method: string | null
  value: number | null
  type: CallbackType
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