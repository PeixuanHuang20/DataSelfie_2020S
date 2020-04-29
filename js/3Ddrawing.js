import * as THREE from './three/build/three.module.js';
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from './three/examples/jsm/webxr/VRButton.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';

import { MeshLine, MeshLineMaterial, MeshLineRaycast } from './threejs-meshline/src/index.js';

var container;

var camera, scene, renderer;
var camera2, controls;
var raycaster, mouse, plane, planeNormal, point;

var pressed;
var penColor = "red";

var coplanar;
var helper;

var linePos = [];
var distance = 0;


init();
render();

console.log(myRange.value);

function init(){

//Basic setup --- start//
    container = document.getElementById('container');

    renderer = new THREE.WebGLRenderer({ antialias: true} );
    // renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize($(container).width(), $(container).height());
    renderer.domElement.id = 'drawhere';

    container.appendChild(renderer.domElement);

    //VR button
    container.appendChild( VRButton.createButton( renderer ) );
    renderer.xr.enabled = true;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xFAEBD7 );

    camera = new THREE.PerspectiveCamera(60, $(container).width() / $(container).height(), 1, 1000);
    camera.position.set(0, 0, 10);

    camera2 = new THREE.PerspectiveCamera( 40, 1, 1, 1000);
	  camera2.position.copy( camera.position );

    controls = new OrbitControls(camera, renderer.domElement);
//Basic setup --- end//


//Plane initial setup for raycaster and drawing
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    plane = new THREE.Plane();
    planeNormal = new THREE.Vector3();
    point = new THREE.Vector3();

    coplanar = new THREE.Vector3();
    coplanar.copy(scene.position);


//Adding helper objects
    var initial = new THREE.Mesh(new THREE.BoxGeometry( 5, 5, 5), new THREE.MeshBasicMaterial({
      color: "white",
    }));

    // scene.add(initial);

    helper = new THREE.PlaneHelper( plane, 10, "pink" );
    scene.add( helper );
    

   
//Events setup -- start//
    document.addEventListener("mousedown", onMouseDown, false);
    document.addEventListener("mouseup", onMouseUp, false);
    document.addEventListener("mousemove", onMouseMove, false);
    document.addEventListener("keydown", onKeyDown, false);

    //When draw function is active, use right mouse for camera rotation
    draw.addEventListener("change",()=>{
      if (draw.checked){
        controls.mouseButtons = { LEFT: THREE.MOUSE.RIGHT, MIDDLE: THREE.MOUSE.MIDDLE, RIGHT: THREE.MOUSE.LEFT };
        controls.update();
      }
      else{
        controls.mouseButtons = { LEFT: THREE.MOUSE.LEFT, MIDDLE: THREE.MOUSE.MIDDLE, RIGHT: THREE.MOUSE.RIGHT };
        controls.update();
      }
    })

    $("input:checkbox").on('click', function() {
      var $box = $(this);
      if ($box.is(":checked")) {
        var group = "input:checkbox[name='" + $box.attr("name") + "']";
        $(group).prop("checked", false);
        $box.prop("checked", true);
      } else {
        $box.prop("checked", false);
      }
    });
//Events setup -- end//

//Menu section
    colorpicker();

    // load3Dmodels();
}


//Get the point from the mouse
function getPoint(event) {
  coplanar.copy(scene.position);

  //Need to be adjusted when the canvas position is changed (trial and error)
  mouse.x = (event.clientX / $(container).width()) * 2 - 1;
  mouse.y = -(event.clientY / $(container).height()) * 2 + 1.11;

  //Set up the plane for reycasting and intersection
  planeNormal.copy(camera.position).normalize();
  coplanar.addScaledVector(planeNormal,distance);
  plane.setFromNormalAndCoplanarPoint(planeNormal, coplanar);

  raycaster.setFromCamera(mouse, camera);

  raycaster.ray.intersectPlane(plane, point);
}

//In effect a brush
function setPoint() {
  drawObj();
}

function onMouseDown(event) {
  getPoint(event);
  if (draw.checked & event.button == 0){
      pressed = true;
      setPoint();
  }
}

//Reset the position list
function onMouseUp() {
  pressed = false;
  controls.enabled = true;
  linePos=[];
  console.log("linePos ",linePos);
}

function onMouseMove(event) {
  getPoint(event);
  if (draw.checked & pressed) {
    controls.enabled = false;
    setPoint();
    }
}

function onKeyDown(event){
  if (event.keyCode==81){
    distance = distance + 0.05;
  }
  else if (event.keyCode==69){
    distance = distance - 0.05;
  }
  else if (event.keyCode==82){
    distance = 0;
  }    
  getPoint(event)
  // plane.setFromNormalAndCoplanarPoint(planeNormal, coplanar);
}


//By manipulating this function, adopt different brush types
function drawObj(){

  //The first brush type is generated using mesh lines
  if (draw.checked && typeone.checked){
    //Keep the list of points from the mouse draw movements
    var mousePos = new THREE.Vector3();
    mousePos.copy(point);
    linePos.push(mousePos);

    //Setup strokes (draw lines)
    if (linePos.length > 1){
      var curve = new THREE.CatmullRomCurve3( linePos );
      var points = curve.getPoints( 50 );
    
      var material = new MeshLineMaterial({
        color: penColor,  
        lineWidth: (myRange.value)/100,
      });
    
      var line = new MeshLine();
      line.setVertices(points);
    
      var curveObject = new THREE.Mesh( line, material );
    
      scene.add( curveObject );
      }
    }

  //The second brush type is a series of discrete cubes  
  else if (draw.checked && typetwo.checked){
    var boxsize = (myRange.value)/100;
    var cube_point = new THREE.Mesh(new THREE.BoxGeometry(boxsize, boxsize, boxsize), new THREE.MeshBasicMaterial({
      color: penColor,
    }));

    cube_point.scale.set(1,1,1);
    cube_point.position.copy(point);

    scene.add(cube_point);  
  }
}

//Create a color palette
function colorpicker(){
  $(".colorPickSelector").colorPick();

  $(".colorPickSelector").colorPick({
      'initialColor': '#3498db',
      'allowRecent': true,
      'recentMax': 5,
      'allowCustomColor': false,
      'palette': ["#1abc9c", "#16a085", "#2ecc71", "#27ae60", "#3498db", "#2980b9", "#9b59b6", "#8e44ad", "#34495e", "#2c3e50", "#f1c40f", "#f39c12", "#e67e22", "#d35400", "#e74c3c", "#c0392b", "#ecf0f1", "#bdc3c7", "#95a5a6", "#7f8c8d"],
      'onColorSelected': function() {
        penColor = this.color;
        this.element.css({'backgroundColor': this.color, 'color': this.color});
      }
    });
}


//Load preset models
function load3Dmodels(){  

  var loader = new GLTFLoader();

  loader.load(
    // resource URL
    'models/model.gltf',
    // called when the resource is loaded
    function ( gltf ) {
  
      scene.add( gltf.scene );
  
      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Group
      gltf.scenes; // Array<THREE.Group>
      gltf.cameras; // Array<THREE.Camera>
      gltf.asset; // Object
  
    },
    // called while loading is progressing
    function ( xhr ) {
  
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  
    },
    // called when loading has errors
    function ( error ) {
  
      console.log( 'An error happened' );
  
    }
  );
}

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}