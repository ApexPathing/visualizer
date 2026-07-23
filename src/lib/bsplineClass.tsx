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

        let poses:Pose[] = []
        path.controlPoints.forEach((cPoint)=>{

            const currentPose = fullPoses.find((pose)=> pose.id === cPoint.poseId)

            if(currentPose){
                poses.push(currentPose)
            }
        })


        

        //this is where all of the conversions will happen


        //first, make sure the list has a valid amount of poses

        if(poses.length < 2) return;

        //then, make sure all values are valid


        if (poses.some(pose => pose.x == null || pose.y == null)) {
            return;
        }

        //convert all poses to vectors
        
        let poseVector:Vector[] = []
        poses.forEach((pose) => {
            
            const temp:Vector = {
                x:pose.x ?? 0, // if pose.x is null, give a value of 0. Our filter above will automatically 
                // return if any of the values are null, so this will never happen, it just lets the Vector class have 
                // pure number types instead of  number | null
                y:pose.y ?? 0
            };
    
            poseVector.push(temp)
        });

        //assign posevectors to our object
    

        //the first thing we need to do is to get the ghost points
        
        //the formula is P_0+(-1(P_1-P_0)) where P_0 is the axis point(that you reflect across, otherwise known as the endpoint) 
        // and P_1 is the point being reflected(otherwise known as the second, or second to last point)
    
    
        

        let ghostPoints:Vector[] = []// make a list for the ghost points
    
        const neg1 = poses.length-1
        const neg2 = poses.length-2
    
        //will give error cus the value "might be null" even though we filtered for it already, so just add an if statement
        if((poseVector[0].x!=null && poseVector[1].x!=null && poseVector[neg1].x!=null && poseVector[neg2].x!=null 
            && poseVector[0].y!=null && poseVector[1].y!=null && poseVector[neg1].y!=null && poseVector[neg2].y!=null)
        ){
            ghostPoints = [
                {
                    x:poseVector[0].x+((poseVector[1].x - poseVector[0].x) * -1),
                    y:poseVector[0].y+((poseVector[1].y - poseVector[0].y) * -1)
                },
                {
                    x:poseVector[neg1].x+((poseVector[neg2].x - poseVector[neg1].x) * -1),
                    y:poseVector[neg1].y+((poseVector[neg2].y - poseVector[neg1].y) * -1)
    
                }
            ]
        }

    
        //combine ghost points and posevectors into splinePoints

        //now that our ghost points are sorted out, we can make the array that will be put into the spline
        let splinePoints:Vector[] = [];

        splinePoints.push(ghostPoints[0])
        splinePoints.push(...poseVector)
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