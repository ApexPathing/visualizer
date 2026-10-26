interface Settings{
    dtType: "holonomic" | "tank" | "butterfly"
    setDtType: (updated:"holonomic" | "tank" | "butterfly") => void
    measureSys: "in" | "cm" | "m" | "ft"
    setMeasureSys: (updated:"in" | "cm" | "m" | "ft") => void
    buildType: "quick" | "default"
    setBuildType: (updated:"quick" | "default") => void
    image: string
    setImage: (updated:string) => void
}