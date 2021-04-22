/*
 var canvas = document.getElementById("renderCanvas");

        var engine = null;
        var scene = null;
        var sceneToRender = null;
        var createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };
        var createScene = function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    
    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    // Our built-in 'sphere' shape.
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);
 
    // Move the sphere upward 1/2 its height
    sphere.position.y = 1;

	// This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.FollowCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene,sphere);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // Our built-in 'ground' shape.
    var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);

    return scene;
};
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
                }
            });
        });

        // Resize
        window.addEventListener("resize", function () {
            engine.resize();
        });

*/
/*
var canvas = document.getElementById("renderCanvas");
      var engine = new BABYLON.Engine(canvas, true);
      // here the doc for Load function: //doc.babylonjs.com/typedoc/classes/babylon.sceneloader#load
      BABYLON.SceneLoader.Load("", "PieceTestblend.babylon", engine, function (scene) {
        //as this .babylon example hasn't camera in it, we have to create one
        var camera = new BABYLON.ArcRotateCamera("Camera", 1, 1, 4, BABYLON.Vector3.Zero(), scene);
        scene.executeWhenReady(function(){
            engine.runRenderLoop(function () {
                scene.render();
            });
        })



      });

window.addEventListener("resize", function () {
    engine.resize();
});
*/

var createScene = function () {

    var canvas = document.getElementById("renderCanvas");
    var engine = new BABYLON.Engine(canvas, true);
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.ArcRotateCamera("arcR", -Math.PI/2, Math.PI/2, 15, BABYLON.Vector3.Zero(), scene);

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    var planeOpts = {
        height: 5.4762,
        width: 7.3967,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    };
    var ANote0Video = BABYLON.MeshBuilder.CreatePlane("plane", planeOpts, scene);
    var vidPos = (new BABYLON.Vector3(0,0,0.1))
    ANote0Video.position = vidPos;
    var ANote0VideoMat = new BABYLON.StandardMaterial("m", scene);
    var ANote0VideoVidTex = new BABYLON.VideoTexture("vidtex","test.mjpeg", scene);
    ANote0VideoMat.diffuseTexture = ANote0VideoVidTex;
    ANote0VideoMat.roughness = 1;
    ANote0VideoMat.emissiveColor = new BABYLON.Color3.White();
    ANote0Video.material = ANote0VideoMat;
    scene.onPointerObservable.add(function(evt){
        if(evt.pickInfo.pickedMesh === ANote0Video){
            //console.log("picked");
            if(ANote0VideoVidTex.video.paused)
                ANote0VideoVidTex.video.play();
            else
                ANote0VideoVidTex.video.pause();
            console.log(ANote0VideoVidTex.video.paused?"paused":"playing");
        }
    }, BABYLON.PointerEventTypes.POINTERPICK);
    //console.log(ANote0Video);
    return scene;

};

createScene();