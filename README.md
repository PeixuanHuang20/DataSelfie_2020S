# DataSelfie_2020S

This is an in-progress implementation in three.js of a 3D canvas which allows the users to draw in 3-dimensional space using a mouse.


[UI]
On top of the canvas there is the options menu. The first two checkboxes of "Draw" and "Erase" allow the user to switcher between drawing and eraser mode. The third box contains a color palette for the user to choose a brush color. The fourth box has a slider to adjust the brush size. The fifth box allows the user to choose different brush types. Currently there are two brush types available, one is the "line" with adjustable thickness, and the other is composed of discrete cubes. The last box will give the user options to load a selection of preset 3D models. The presets loading function is currently not implemented.
On the drawing canvas, there is a big white cube placing at the center of the scene and used for reference purposes. There is also a red semi-transparent "plane helper", which visualizes the plane the user is currently drawing on. Drawing in the 3D space is achieved through changing the plane the user interacts with.
At the bottom of the page, there is a VR/XR button to activate the VR scene. This functionality has not been tested.

To draw on the canvas, check the "Draw" box and pick the brush type from the "Brush Type" dropdown. Press down the left mouse to draw on the canvas with strokes. While drawing is activated, press down and hold the right mouse for orbit control. Use the mouse scroll to zoom. Use the arrow keys on the keyboard to change viewing positions. The plane the user is interacting with always faces the user view regardless of orbit and zoom controls. To change the "z" position of the plane, press down or hold the "Q" key to move the plane closer to the user view; press down or hold the "E" key to move the plane away from the user view; press the "R" key to reset the distance.

To erase the drawings, check the "Erase" box. Press down and hold the left mouse. Move along the canvas to allow the cursor to intersect with the drawings. Once there is an intersection, the drawings will be removed from the scene.


[Code implementation]
This code contains the whole three.js package through npm installation.

Functions---

init():
Set up the container for the three.js canvas. Set up the render, camera, and scene.
Set up two raycasters, one for drawing and one for erasing, with the plane and point of interaction.
Set up the plane helper and the initial reference cube.
Add mouse and key events. Add events for changing orbit controls (when drawing and erasing, use right mouse for orbit control). 
Add option menus (checkbox, color picker, load models functionalities).

getPoint(event):
Use the scene position as the coplanar point and normalized camera position as the normal vector to build the interaction plane.
Set up the raycaster for the event point and plane intersection. Adjust the component of the mouse vector to match the intersection point.
If the eraser is activated, use the "raycaster2" to detect intersections with the already drawn objects, and call eraseObj().
This function is used in onMouseDown(event), onMouseMove(event), and onKeyDown(event) to constantly obtain the intersection point from the mouse and correspondingly adjust the intersection plane.

onMouseDown(event):
Call getPoint(evet) so that once the mouse is pressed down, an interaction plane is adjusted accordingly, and the intersection point is set up based on the mouse position. 
If the "draw" is checked and the left mouse is pressed, then set a global variable "pressed" as true. The "pressed" variable is used later to change orbit control and activate the drawing function.
If a list "allDrawing" is not empty and the "erase" is checked and the left mouse is pressed, set "pressed" as true as well. The "allDrawing" keeps a list of all the objects drawn on the canvas.

onMouseMove(event):
Call getPoint(event) for the same purposes as onMouseDown. If "pressed" is true, disable the left mouse orbit control. And if "draw" is checked, call drawObj() which allows for drawing objects.

drawObj():
Create a local variable "stroke" to store each brush stroke. Use conditionals to check which brush type is selected.
If "line type" is selected, use the global list "linePos" to store all the mouse positions from the mouse movement. Use "THREE.CatmullRomCurve3" to optimize the curve from the points. Create a correctly formatted "positions" list which will be used by the "LineGeometry", "LineMaterial", and "Line2" modules to generate a customizable line as each stroke. 
If "cube type" is selected, create a Three.BoxGeometry at the point position and store each cube as one stroke. 
Give each stroke an id for tracking purposes, push each stroke into the "allDrawings" list, and add the stroke to the scene.

eraseObj():
In getPoint(), the "raycaster2" is already set up for detecting any intersection between the mouse and the objects in the "allDrawings". In this function, if there is an intersection, trace through the intersection to get the id of the intersected object, and remove the objects in the intersection by their ids.

onMouseUp(event):
Reset "pressed" as false and enable the left mouse orbit control. Empty the "linePos" so that once the mouse is released, a new stroke will begin for the next mouse movement.

onKeyDown(event):
If key "Q" is pressed, reduce the global variable "distance". If key "E" is pressed, increment the "distance". If "R" is pressed, reset the "distance".
The "distance" variable will be used to add scalars to the coplanar point in the getPoint(), so that the distance between the plane and the viewer can be manipulated through pressing different keys.
Call getPoint() to update the plane.

colorPicker(): Call to display the color palette in the options menu.
load3Dmodels(): Used for loading locally saved models.

render(): Render the scene.


[Suggested improvement]
UI-side
1. Improve the design of the options menu. Currently the checkboxes are not aesthetically pleasing. The simultaneous checking should also be disabled (between "Draw" and Erase" for example).
2. Update cursor with different functionalities.
3. Complete the preset models loading option

Implementation-side
1. Currently for the line type drawing, if the length of the stroke and the number of strokes increase too much, the performance evidently degrades with lagging. A solution is needed for fixing this performance issue.
2. Need more solutions for drawing on the "z" direction. One possible solution is to adjust or rotate the interaction plane with different angles.
3. Test VR usability. Continue expanding the Web XR functionality.