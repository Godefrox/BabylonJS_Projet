/*var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var sceneToRender = null;
var camera;
var createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };

var createScene = function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    BABYLON.SceneLoader.Append("", "js/Wait.babylon", scene, function (scene) {
        // do something with the scene
    });

    // This creates and positions a free camera (non-mesh)
    camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(76, 120, 9), scene);


    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    camera.cameraRotation = new BABYLON.Vector2(1.57,-0.15);
    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    // Our built-in 'sphere' shape.

    return scene;
};
var engine;
var scene;
var coordMouse
var vector = { x:'', y:'', z:'' };
initFunction = async function() {

    var asyncEngineCreation = async function() {
        try {
            return createDefaultEngine();
        } catch(e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            return createDefaultEngine();
        }
    }

    engine = await asyncEngineCreation();
    if (!engine) throw 'engine should not be null.';
    scene = createScene();};
initFunction().then(() => {sceneToRender = scene
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render()
             coordMouse = function (){

                 scene.onPointerDown = function (event, pickResult){

                     vector = pickResult.pickedPoint;
                     console.log(vector);
                     addVertex();
                 }
             };
            coordMouse();
            /*
            console.log(camera.rotation);
            console.log(scene.pointerX);
            console.log(scene.pointerY);
        }
    });
});

function addVertex(){
   let box = BABYLON.MeshBuilder.CreateBox("box",{height: 5}, scene);
   box.position = vector;
   box.position.y = 5
}

function moveVertex(){
//Trouve si un point est présent, puis le maintiens jusqu'au nouvelle emplacement en le déplacent
}

function removeVertex(){
//Supprime le vertex qui est présent au niveau des coordonés
}

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});



*/

var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };
var vector = { x:'', y:'', z:'' };
const myLines = [

];
const areaName = 1;

//Create linesystem
var linesystem;
var createScene = function() {
    var scene = new BABYLON.Scene(engine);
    BABYLON.SceneLoader.Append("", "js/Wait.babylon", scene, function (scene) {
        // do something with the scene
    });

    // Camera
    camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(76, 120, 9), scene);
    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);
    camera.cameraRotation = new BABYLON.Vector2(1.57,-0.15);
    //camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    var canvas = document.getElementById("renderCanvas");
    let ratio = canvas.width / canvas.height ;
    let zoom = 20;
    let width = zoom * ratio;
    //camera.orthoTop = zoom;
    //camera.orthoLeft = -width;
    //camera.orthoRight = width;
    //camera.orthoBottom = -zoom;

    var light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(5, 10, 0), scene);





    return scene;

}
var engine;
var scene;
initFunction = async function() {
    var asyncEngineCreation = async function() {
        try {
            return createDefaultEngine();
        } catch(e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            return createDefaultEngine();
        }
    }

    engine = await asyncEngineCreation();
    if (!engine) throw 'engine should not be null.';
    scene = createScene();};
initFunction().then(() => {sceneToRender = scene
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
            var coordMouse = function (){

                scene.onPointerDown = function (event, pickResult){

                    vector = pickResult.pickedPoint;
                    console.log(vector);
                    addVertex();
                }
            };
            coordMouse();
        }
    });
});
var i = 0;
var firstTime = true;
function addVertex(){
    var area = myLines[areaName];
    console.log(area);
    console.log(myLines[1]);
    var areaB;
    if(areaB === undefined){
        area = [];
        areaB = true;
    }
    area.push(new BABYLON.Vector3(vector.x, 5, vector.z));
    if(areaB === true){
        myLines.splice(areaName,0,area);
    }else{
        myLines[areaName] = area;
    }
    linesystem = BABYLON.MeshBuilder.CreateLineSystem("linesystem", {lines: myLines});
    linesystem.color = new BABYLON.Color3(1, 1, 1);

    console.log(myLines);


}
// Resize
window.addEventListener("resize", function () {
    engine.resize();
});