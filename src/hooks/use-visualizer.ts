import { useState, useCallback } from "react";

export const Poses = () => {
  const [poses, setPoses] = useState<Pose[]>([]);

  const addPose = () => {
    setPoses((prevPoses) => {
      const nextNumber = prevPoses.length + 1;

      const newPose: Pose = {
        id: Date.now(),
        name: `pose${nextNumber}`,
        x: 0,
        y: 0,
        heading: 0,
        radius: 0,
        arcPose: false,
        local: false,
        color: '#008000'
      };

      return [...prevPoses, newPose];
    });
  };

  const updatePose = (id: number, updatedFields: Partial<Pose>) => {
    setPoses((prev) =>
      prev.map((pose) =>
        pose.id === id ? { ...pose, ...updatedFields } : pose
      )
    );
  };

  const deletePose = useCallback((id: number) => {
    setPoses((prev) => prev.filter((pose) => pose.id !== id));
  }, []);

  return { poses, deletePose, addPose, updatePose, setPoses };
}

export const Paths = () => {
  const [paths, setPaths] = useState<Path[]>([]);

  const addPath = () => {
    setPaths((prevPaths) => {
      const nextNumber = prevPaths.length + 1;

      const newPath: Path = {
        id: Date.now(),
        name: `path${nextNumber}`,
        controlPoints: [],
        callbacks: [],
        quickBuild: false, // TODO: Replace these defaults with user defined settings
        holonomic: true,
        color: "#2563eb"
      };

      return [...prevPaths, newPath];
    });
  };

  const updatePath = (id: number, updatedFields: Partial<Path>) => {
    setPaths((prev) =>
      prev.map((path) =>
        path.id === id ? { ...path, ...updatedFields } : path
      )
    );
  };

  const deletePath = useCallback((id: number) => {
    setPaths((prev) => prev.filter((path) => path.id !== id));
  }, [setPaths]);

  const addControlPoint = (pathId: number, currentPoints: ControlPoint[] = []) => {
    const newPoint: ControlPoint = {
      id: Date.now(),
      poseId: null,
      pathId: pathId
    };
    updatePath(pathId, {
      controlPoints: [...currentPoints, newPoint]
    });
  };

  const updateControlPoint = (pathId: number, currentPoints: ControlPoint[], controlPointId: number, updatedFields: Partial<ControlPoint>) => {
    const updatedPoints = currentPoints.map((point) =>
      point.id === controlPointId ? { ...point, ...updatedFields } : point
    );
    updatePath(pathId, { controlPoints: updatedPoints });
  };

  const deleteControlPoint = (pathId: number, currentPoints: ControlPoint[], controlPointId: number) => {
    const filteredPoints = currentPoints.filter((point) => point.id !== controlPointId);
    updatePath(pathId, { controlPoints: filteredPoints });
  };

  const addCallback = (pathId: number, currentCallbacks: Callback[] = []) => {
    const newCallback: Callback = {
      id: Date.now(),
      method: "",
      value: 0,
      valueType: "D"
    };
    updatePath(pathId, {
      callbacks: [...currentCallbacks, newCallback]
    });
  };
  const updateCallback = (pathId: number, currentCallbacks: Callback[], callbackId: number, updatedFields: Partial<Callback>) => {
    const updatedCallbacks = currentCallbacks.map((callback) =>
      callback.id === callbackId ? { ...callback, ...updatedFields } : callback
    );
    updatePath(pathId, { callbacks: updatedCallbacks });
  };
  const deleteCallback = (pathId: number, currentCallbacks: Callback[], callbackId: number) => {
    const filteredCallbacks = currentCallbacks.filter((callback) => callback.id !== callbackId);
    updatePath(pathId, { callbacks: filteredCallbacks });
  };

  return {
    paths,
    setPaths,
    addPath,
    updatePath,
    deletePath,
    addControlPoint,
    updateControlPoint,
    deleteControlPoint,
    addCallback,
    updateCallback,
    deleteCallback
  }
}