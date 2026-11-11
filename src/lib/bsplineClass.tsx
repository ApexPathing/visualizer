import { Elsie_Swash_Caps } from "next/font/google";

export class bsplineClass {

    //init actually used global variables
    cx: number[][] = []
    cy: number[][] = []
    arcPoseVectors: {vector: Vector, arcPose: boolean, radius: number}[]
    numSegments = 0
    CMatrix = [
        [-1.0 / 6.0, 3.0 / 6.0, -3.0 / 6.0, 1.0 / 6.0],
        [3.0 / 6.0, -6.0 / 6.0, 3.0 / 6.0, 0.0],
        [-3.0 / 6.0, 0.0, 3.0 / 6.0, 0.0],
        [1.0 / 6.0, 4.0 / 6.0, 1.0 / 6.0, 0.0]
    ]

    constructor(path: Path, fullPoses: Pose[]) {





        //this is where all of the conversions will happen
    





        //ok, so i had to change stuff up for native arcposes
        //now, it will be easier to write, just needs a huge rewrite

        //first, lets add all the vectors to the thing

        let arcPoseVectors: { vector: Vector, arcPose: boolean, radius: number }[] = []

        //connect paths

        //can either be a native or pose reference
        if(path.firstPose.isNative && path.firstPose.nativeParameter){
            arcPoseVectors.push({
                vector:path.firstPose.nativeParameter.coord,
                arcPose:false,
                radius:0})
        }else{
            //pose reference
            const pose = fullPoses.find((pose)=>pose.id == path.firstPose?.poseId)
            if(pose){
                arcPoseVectors.push({
                    vector:{
                        x: pose.x ?? 0,
                        y: pose.y ?? 0
                    },
                    arcPose:false,
                    radius:0
                })
            }
        }
        

        //loop through each control point

        path.controlPoints.forEach((CP) => {
            //check if it is native or not

            if (!CP.isNative) {
                //if it is not, we need to find it's pose

                const pose = fullPoses.find((pose) => pose.id == CP.poseId)
                // add data to list

                if (pose)// find has a possibility to return a null value if the object doesnt exist, we know it will exist tho
                    arcPoseVectors.push({
                        vector: {
                            x: pose.x ?? 0,
                            y: pose.y ?? 0
                        },
                        arcPose: pose?.arcPose,
                        radius: pose.radius ?? 0
                    })
            }
            else {
                //if it is native, it is simpler,
                //just need to push the existing values in the native control point
                if (CP.nativeParameter?.coord) //bc it is an optional value in type, could be undefined(wont tho bc of the way the code is written)
                    arcPoseVectors.push({
                        vector: CP.nativeParameter.coord,
                        arcPose: CP.nativeParameter.arcPose,
                        radius: CP.nativeParameter.radius
                    })
            }
        })


        //add endPose

        
        //can either be a native or pose reference
        if(path.endPose.isNative && path.endPose.nativeParameter){
            arcPoseVectors.push({
                vector:path.endPose.nativeParameter.coord,
                arcPose:false,
                radius:0})
        }else{
            //pose reference
            const pose = fullPoses.find((pose)=>pose.id == path.endPose?.poseId)
            if(pose){
                arcPoseVectors.push({
                    vector:{
                        x: pose.x ?? 0,
                        y: pose.y ?? 0
                    },
                    arcPose:false,
                    radius:0
                })
            }
        }

        this.arcPoseVectors = arcPoseVectors;
        


        //now that our arcPoseVector list has been made, lets do one more loop through in order to add the arcposes
        let pathVector: Vector[] = []


        arcPoseVectors.forEach((APV, index) => {
            if (APV.arcPose == true) {

                const vector = APV.vector;
                let r = APV.radius

                //if endpoints
                if (index != 0 && index != (arcPoseVectors.length - 1)) {

                    //get vectors
                    const leftVector = arcPoseVectors[index - 1].vector

                    const rightVector = arcPoseVectors[index + 1].vector


                    //get distance from center vector
                    const leftDist = Math.sqrt(
                        (leftVector.x - vector.x) ** 2
                        +
                        (leftVector.y - vector.y) ** 2
                    )

                    const rightDist = Math.sqrt(
                        (rightVector.x - vector.x) ** 2
                        +
                        (rightVector.y - vector.y) ** 2
                    )

                    //make sure that the radius isn't more than the distance between the two
                    if (rightDist < r || leftDist < r) {
                        r = Math.min(rightDist, leftDist)
                    }

                    //formula created by me :)
                    const leftArcPose = {
                        x: vector.x + (((leftVector.x - vector.x) / leftDist) * r),
                        y: vector.y + (((leftVector.y - vector.y) / leftDist) * r)
                    }

                    const rightArcPose = {
                        x: vector.x + (((rightVector.x - vector.x) / rightDist) * r),
                        y: vector.y + (((rightVector.y - vector.y) / rightDist) * r)
                    }

                    //i realized that splicing stuff in can mess with the previous arcposes and whatnot, so, with this setup.
                    //we can just use the push() method :)
                    pathVector.push(leftArcPose, vector, rightArcPose)
                }else{
                    //we can't forget about if an enpoint has the arcpose toggle!, otherwise, they would get fried
                    pathVector.push(vector)
                }
            }else{
                //now, if it is just a regular pose
                pathVector.push(APV.vector)
            }
        })






        //assigning all of the Vectors to our path


        //the first thing we need to do is to get the ghost points

        //the formula is P_0+(-1(P_1-P_0)) where P_0 is the axis point(that you reflect across, or endpoint) 
        // and P_1 is the point being reflected(either the second or the second to last point)

        if (pathVector.length < 2) return; // make sure there are enough points

        let ghostPoints: Vector[] = []// make a list for the ghost points

        const neg1 = pathVector.length - 1
        const neg2 = pathVector.length - 2

        //will give error cus the value "might be null" even though we filtered for it already, so just add an if statement
        if ((pathVector[0].x != null && pathVector[1].x != null && pathVector[neg1].x != null && pathVector[neg2].x != null
            && pathVector[0].y != null && pathVector[1].y != null && pathVector[neg1].y != null && pathVector[neg2].y != null)
        ) {

            //long ahh if statement btw
            ghostPoints = [
                {
                    x: pathVector[0].x + ((pathVector[1].x - pathVector[0].x) * -1),
                    y: pathVector[0].y + ((pathVector[1].y - pathVector[0].y) * -1)
                },
                {
                    x: pathVector[neg1].x + ((pathVector[neg2].x - pathVector[neg1].x) * -1),
                    y: pathVector[neg1].y + ((pathVector[neg2].y - pathVector[neg1].y) * -1)

                }
            ]
        }


        //combine ghost points and pathVectors into splinePoints

        //now that our ghost points are sorted out, we can make the array that will be put into the spline
        let splinePoints: Vector[] = [];

        splinePoints.push(ghostPoints[0])
        splinePoints.push(...pathVector)
        splinePoints.push(ghostPoints[1])


        //now for the actual calculations for the bspline


        const numSegments = splinePoints.length - 3
        this.numSegments = numSegments
        let cx: number[][] = []
        let cy: number[][] = []

        //create the b spline segments, 4 control points per segment, each contribute to the whole spline, keeping it 4th degree
        //as joel's bspline class states in the pathing repo, "they are evaluated using a sliding 4-point window"

        for (let i = 0; i < numSegments; i++) {
            const p0: Vector = splinePoints[i]
            const p1: Vector = splinePoints[i + 1]
            const p2: Vector = splinePoints[i + 2]
            const p3: Vector = splinePoints[i + 3]


            const xWindow = [p0.x, p1.x, p2.x, p3.x]
            const yWindow = [p0.y, p1.y, p2.y, p3.y]

            //multiply our Cmatrix and x/y window for cx and cy
            //made a function so its easier

            //adding to the end of the array, a little different than java cus u cant specify the length and loop through it
            const tempx: number[] = multiplyMatrices(this.CMatrix, xWindow)
            cx.push(tempx)
            const tempy: number[] = multiplyMatrices(this.CMatrix, yWindow)
            cy.push(tempy)

            this.cx = cx
            this.cy = cy
        }
    }



    evaluate(t: number) {
        if (!this.cx || this.cx.length === 0) return { x: 0, y: 0 };

        if (t >= 1.0) t = 0.999999;
        if (t < 0.0) t = 0.0;

        const continuousIndex = t * this.numSegments
        const segment = Math.trunc(continuousIndex) //should do the same thing as type casting to int
        const localT = continuousIndex - segment


        const cX = this.cx[segment]
        const cY = this.cy[segment]


        const x = ((cX[0] * localT + cX[1]) * localT + cX[2]) * localT + cX[3]
        const y = ((cY[0] * localT + cY[1]) * localT + cY[2]) * localT + cY[3]

        const returnValue: Vector = {
            x: x,
            y: y
        }
        return returnValue;
    }

    getArcPoses(index:number){

        
    }

}


function multiplyMatrices(matrix: number[][], window: number[]) {


    const result: number[] = [];

    for (let i = 0; i < matrix.length; i++) {
        let sum: number = 0.0;
        for (let j = 0; j < matrix[0].length; j++) {
            sum += matrix[i][j] * window[j];
        }
        result.push(sum)
    }
    return result;
}


