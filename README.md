# Apex Pathing Visualizer

welcome to the Apex Pathing Visualizer!

This visualizer is for Apex Pathing, a Pathing software for the First Tech Challenge. The visualizer is currently in development.

## Currently implemented features
* Adding poses to the field
* Adding paths with poses on field as control points
* Drag and drop for poses
* Settings menu with options for custom fields, drivetrain type, and default unit
* Arc pose functionality like how the [docs](https://www.apexpathing.com/docs/arc-poses) state, letting you customize the radius of the arc pose. Currently, dragging on the field to edit radius is not functional.
* Heading interpolation selection
* Custom pose and path colors

## How to use

The visualizer isn't currently done, but you are still able to use it to map out your paths. First, add your path by clicking the add path buttom. Then, you can either choose to add native control points, or your created poses on from the pose button. Then, drag these control points around to create your path. Add as many paths as you want to make you autonomous complete!  
## Development and locally running the visualizer
To aid in development, fork the main [repository](https://github.com/ApexPathing/visualizer) and make sure you have node.js and npm installed. Then, download and save the repository somewhere safe. Then, open terminal and use the ``cd`` command to navigate to the folder you saved the repository in and run ``npm i`` to install all of the node packages. Then run ``npm run dev`` to run the visualizer at  ``localhost:3000`` in your browser. In the ide of your choice, open the folder you saved the repository in and you can change the code. Make sure to save the code in order to see the changes at ``localhost:3000``.

## Video Demo
Here is a quick video demo on how you can create paths, it will be updated as development continues:
https://github.com/user-attachments/assets/5ea15fcb-439f-47b6-b01e-b5d0c848bcf6
