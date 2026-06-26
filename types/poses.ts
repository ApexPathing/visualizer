interface Pose {
  id: number
  name: string
  x: number | null
  y: number | null
  heading: number | null
  radius: number | null
  arcPose: boolean
  local: boolean
}