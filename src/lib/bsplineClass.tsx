export class bsplineClass{

    //init actually used global variables
    cx:number[][] = []
    cy:number[][] = []
    numSegments = 0
    CMatrix = [
                [-1.0 / 6.0, 3.0 / 6.0, -3.0 / 6.0, 1.0 / 6.0],
                [3.0 / 6.0, -6.0 / 6.0, 3.0 / 6.0, 0.0],
                [-3.0 / 6.0, 0.0, 3.0 / 6.0, 0.0],
                [1.0 / 6.0, 4.0 / 6.0, 1.0 / 6.0, 0.0]
                ]

    constructor(path:Path,fullPoses:Pose[]){


        

        
        //this is where all of the conversions will happen


        //first, make sure the list has a valid amount of control points

        if(path.controlPoints.length < 2) return;

       

        

        //extract controlPoint and convert to vector
        //algorithm idea: 


        //loop through control points
            //   if control point is native, just add it to the vector
            //   else create a new vector to hold the pose x and y
                //  if the pose is an arcPose store its index in a temporary array
                //  else add -1 to the array
        //once all of the values are added, loop through the new vector array
        //  if the current vector's index has a non -1 value in the arcPose array
            //  run arcPose calculations and add the vectors to the array
        let pathVector:Vector[] = []
        let arcPoses:([index:number,id:number])[] = []
        path.controlPoints.forEach((CP)=>{


            if(CP.isNative){
                pathVector.push(CP.nativeCoords ?? {x:0,y:0})
                arcPoses.push([-1,-1])
            }
            else{
                const pose = fullPoses.find((p)=>p.id == CP.poseId)
                const index = fullPoses.findIndex((p)=>p.id == CP.poseId)
                
                if(pose && pose.x !=null && pose.y !=null){
                    const newVector = {
                        x:pose.x,
                        y:pose.y
                    }

                    
                    if(pose?.arcPose) arcPoses.push([index,pose.id])
                    else arcPoses.push([-1,-1])
                    
                    pathVector.push(newVector)
                }
            }

        })


        pathVector.forEach((vector,index)=>{
            if(arcPoses[index][0]!= -1){

                const pose = fullPoses.find((p)=>p.id==arcPoses[index][1])
                let r = pose?.radius ?? 0
                    
                    //if endpoints
                    if(index != 0 && index != (pathVector.length -1)){

                    //get vectors
                    const leftVector = pathVector[index-1]
                    
                    const rightVector = pathVector[index+1]


                    //get distance from center vector
                    const leftDist = Math.sqrt(
                        (leftVector.x - vector.x)**2
                        +
                        (leftVector.y - vector.y)**2
                    )

                    const rightDist = Math.sqrt(
                        (rightVector.x - vector.x)**2
                        +
                        (rightVector.y - vector.y)**2
                    )

                    //make sure that the radius isn't more than the radius
                    if(rightDist < r || leftDist < r){
                        r = Math.min(rightDist,leftDist)
                    }

                    //formula created by me :)
                    const leftArcPose = {
                        x: vector.x + (((leftVector.x - vector.x)/leftDist) * r),
                        y: vector.y + (((leftVector.y - vector.y)/leftDist) * r)
                    }
                
                    const rightArcPose = {
                        x: vector.x + (((rightVector.x - vector.x)/rightDist) * r),
                        y: vector.y + (((rightVector.y - vector.y)/rightDist) * r)
                    }
                    pathVector = [...pathVector.splice(index,1, leftArcPose,vector,rightArcPose)]
                }

            }
        })




        //assign all of the Vectors  to our object
    

        //the first thing we need to do is to get the ghost points
        
        //the formula is P_0+(-1(P_1-P_0)) where P_0 is the axis point(that you reflect across, or endpoint) 
        // and P_1 is the point being reflected(either the second or the second to last point)
    
        if (pathVector.length < 2) return; // make sure there are enough points

        let ghostPoints:Vector[] = []// make a list for the ghost points
    
        const neg1 = pathVector.length-1
        const neg2 = pathVector.length-2
    
        //will give error cus the value "might be null" even though we filtered for it already, so just add an if statement
        if((pathVector[0].x!=null && pathVector[1].x!=null && pathVector[neg1].x!=null && pathVector[neg2].x!=null 
            && pathVector[0].y!=null && pathVector[1].y!=null && pathVector[neg1].y!=null && pathVector[neg2].y!=null)
        ){

            //long ahh if statement btw
            ghostPoints = [
                {
                    x:pathVector[0].x+((pathVector[1].x - pathVector[0].x) * -1),
                    y:pathVector[0].y+((pathVector[1].y - pathVector[0].y) * -1)
                },
                {
                    x:pathVector[neg1].x+((pathVector[neg2].x - pathVector[neg1].x) * -1),
                    y:pathVector[neg1].y+((pathVector[neg2].y - pathVector[neg1].y) * -1)
    
                }
            ]
        }

    
        //combine ghost points and pathVectors into splinePoints

        //now that our ghost points are sorted out, we can make the array that will be put into the spline
        let splinePoints:Vector[] = [];

        splinePoints.push(ghostPoints[0])
        splinePoints.push(...pathVector)
        splinePoints.push(ghostPoints[1])


        //now for the actual calculations for the bspline


        const numSegments = splinePoints.length-3
        this.numSegments = numSegments
        let cx:number[][] = []
        let cy:number[][] = []

        //create the b spline segments, 4 control points per segment, each contribute to the whole spline, keeping it 4th degree
        //as joel's bspline class states in the pathing repo, "they are evaluated using a sliding 4-point window"

        for(let i = 0; i<numSegments;i++){
            const p0:Vector = splinePoints[i]
            const p1:Vector = splinePoints[i + 1]
            const p2:Vector = splinePoints[i + 2]
            const p3:Vector = splinePoints[i + 3]


            const xWindow = [p0.x,p1.x,p2.x,p3.x]
            const yWindow = [p0.y,p1.y,p2.y,p3.y]

            //multiply our Cmatrix and x/y window for cx and cy
            //made a function so its easier
            
            //adding to the end of the array, a little different than java cus u cant specify the length and loop through it
            const tempx:number[] = multiplyMatrices(this.CMatrix,xWindow)
            cx.push(tempx)
            const tempy:number[] = multiplyMatrices(this.CMatrix,yWindow)
            cy.push(tempy)

            this.cx = cx
            this.cy = cy
        }
    }


    
    evaluate(t:number){
        if (!this.cx || this.cx.length === 0) return { x: 0, y: 0 };

        if (t >= 1.0) t = 0.999999;
        if (t < 0.0) t = 0.0;

        const continuousIndex = t * this.numSegments
        const segment =  Math.trunc(continuousIndex) //should do the same thing as type casting to int
        const localT = continuousIndex - segment

        
        const cX = this.cx[segment]
        const cY = this.cy[segment]


        const x = ((cX[0] * localT + cX[1]) * localT + cX[2]) * localT + cX[3]
        const y = ((cY[0] * localT + cY[1]) * localT + cY[2]) * localT + cY[3]

        const returnValue:Vector = {
            x:x,
            y:y
        }
        return returnValue;
    }

}


function multiplyMatrices(matrix:number[][], window:number[]){


    const result:number[] = [];

    for (let i = 0; i < matrix.length; i++) {
        let sum:number = 0.0;
        for (let j = 0; j < matrix[0].length; j++) {
            sum += matrix[i][j] * window[j];
        }
        result.push(sum)
    }
    return result;
}