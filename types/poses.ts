interface Pose {
  id: number
  name: string
  x: number | null
  y: number | null
  heading: number | null
  radius: number | null
  arcPose: boolean
  local: boolean
  color:string
}

//this interface is for calculating the bspline, 
// as it doesn't need the other things for poses which will just be plugged into the b spline
interface Vector{
  x:number //these two values are null to match the type of the poses, it will never actually be null
  y:number 
}

interface poseShape{
  poseId:number
  x:number
  y:number
  radius:number
  color:string
}