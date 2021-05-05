/**
@Author : Godefroy MONTONATI
@Module : Visualisation 3D
 */


/**
    Ensemble de variables spécifiques à Babylon JS
*/
var canvas = document.getElementById("renderCanvas");
var engine = null;
var scene = null;
var sceneToRender = null;
var advancedTexture;

/**
    Ensemble de variables global
*/
var vector;
var areaName;
var minZoom = 40;
var zoom = 50;
var maxZoom = 60;
var width;
var ratio;
var mapArea = new Map();
/**
 * Structure d'une données au sein de la map
 * {
 * path : path,
 * line : line,
 * polygon: polygon,
 * color : color}
 */

/**
    Ensemble de fonction global
 */
var createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };
var line2D = function(name, options, scene) {

    //Arrays for vertex positions and indices
    var positions = [];
    var indices = [];
    var normals = [];

    var width = options.width || 1;
    var path = options.path;
    var closed = options.closed || false;
    if(options.standardUV === undefined) {
        standardUV = true;
    }
    else {
        standardUV = options.standardUV;
    }

    var interiorIndex;

    //Arrays to hold wall corner data
    var innerBaseCorners = [];
    var outerBaseCorners = [];

    var outerData = [];
    var innerData = [];
    var angle = 0;

    var nbPoints = path.length;
    var line = BABYLON.Vector3.Zero();
    var nextLine = BABYLON.Vector3.Zero();
    path[1].subtractToRef(path[0], line);

    if(nbPoints > 2 && closed) {
        path[2].subtractToRef(path[1], nextLine);
        for(var p = 0; p < nbPoints; p++) {
            angle = Math.PI - Math.acos(BABYLON.Vector3.Dot(line, nextLine)/(line.length() * nextLine.length()));
            direction = BABYLON.Vector3.Cross(line, nextLine).normalize().y;
            lineNormal = new BABYLON.Vector3(-line.z, 0, 1 * line.x).normalize();
            line.normalize();
            innerData[(p + 1) % nbPoints] = path[(p + 1) % nbPoints];
            outerData[(p + 1) % nbPoints] = path[(p + 1) % nbPoints].add(lineNormal.scale(width)).add(line.scale(direction * width/Math.tan(angle/2)));
            line = nextLine.clone();
            path[(p + 3) % nbPoints].subtractToRef(path[(p + 2) % nbPoints], nextLine);
        }
    }
    else {
        lineNormal = new BABYLON.Vector3(-line.z, 0, 1 * line.x).normalize();
        line.normalize();
        innerData[0] = path[0];
        outerData[0] = path[0].add(lineNormal.scale(width));

        for(var p = 0; p < nbPoints - 2; p++) {
            path[p + 2].subtractToRef(path[p + 1], nextLine);
            angle = Math.PI - Math.acos(BABYLON.Vector3.Dot(line, nextLine)/(line.length() * nextLine.length()));
            direction = BABYLON.Vector3.Cross(line, nextLine).normalize().y;
            lineNormal = new BABYLON.Vector3(-line.z, 0, 1 * line.x).normalize();
            line.normalize();
            innerData[p + 1] = path[p + 1];
            outerData[p + 1] = path[p + 1].add(lineNormal.scale(width)).add(line.scale(direction * width/Math.tan(angle/2)));
            line = nextLine.clone();
        }
        if(nbPoints > 2) {
            path[nbPoints - 1].subtractToRef(path[nbPoints - 2], line);
            lineNormal = new BABYLON.Vector3(-line.z, 0, 1 * line.x).normalize();
            line.normalize();
            innerData[nbPoints - 1] = path[nbPoints - 1];
            outerData[nbPoints - 1] = path[nbPoints - 1].add(lineNormal.scale(width));
        }
        else{
            innerData[1] = path[1]
            outerData[1] = path[1].add(lineNormal.scale(width));
        }
    }

    var maxX = Number.MIN_VALUE;
    var minX = Number.MAX_VALUE;
    var maxZ = Number.MIN_VALUE;
    var minZ = Number.MAX_VALUE;

    for(var p = 0; p < nbPoints; p++) {
        positions.push(innerData[p].x, innerData[p].y, innerData[p].z);
        maxX = Math.max(innerData[p].x, maxX);
        minX = Math.min(innerData[p].x, minX);
        maxZ = Math.max(innerData[p].z, maxZ);
        minZ = Math.min(innerData[p].z, minZ);
    }

    for(var p = 0; p < nbPoints; p++) {
        positions.push(outerData[p].x, outerData[p].y, outerData[p].z);
        maxX = Math.max(innerData[p].x, maxX);
        minX = Math.min(innerData[p].x, minX);
        maxZ = Math.max(innerData[p].z, maxZ);
        minZ = Math.min(innerData[p].z, minZ);
    }

    for(var i = 0; i < nbPoints - 1; i++) {
        indices.push(i, i + 1, nbPoints + i + 1);
        indices.push(i, nbPoints + i + 1, nbPoints + i)
    }

    if(nbPoints > 2 && closed) {
        indices.push(nbPoints - 1, 0, nbPoints);
        indices.push(nbPoints - 1, nbPoints, 2 * nbPoints - 1)
    }

    var normals = [];
    var uvs =[];

    if(standardUV) {
        for(var p = 0; p < positions.length; p += 3) {
            uvs.push((positions[p] - minX)/(maxX - minX), (positions[p + 2] - minZ)/(maxZ - minZ));
        }
    }
    else {
        var flip = 0;
        var p1 = 0;
        var p2 = 0;
        var p3 = 0;
        var v0 = innerData[0];
        var v1 = innerData[1].subtract(v0);
        var v2 = outerData[0].subtract(v0);
        var v3 = outerData[1].subtract(v0);
        var axis = v1.clone();
        axis.normalize();

        p1 = BABYLON.Vector3.Dot(axis,v1);
        p2 = BABYLON.Vector3.Dot(axis,v2);
        p3 = BABYLON.Vector3.Dot(axis,v3);
        var minX = Math.min(0, p1, p2, p3);
        var maxX = Math.max(0, p1, p2, p3);

        uvs[2 * indices[0]] = -minX/(maxX - minX);
        uvs[2 * indices[0] + 1] = 1;
        uvs[2 * indices[5]] = (p2 - minX)/(maxX - minX);
        uvs[2 * indices[5] + 1] = 0;

        uvs[2 * indices[1]] = (p1 - minX)/(maxX - minX);
        uvs[2 * indices[1] + 1] = 1;
        uvs[2 * indices[4]] = (p3 - minX)/(maxX - minX);
        uvs[2 * indices[4] + 1] = 0;

        for(var i = 6; i < indices.length; i +=6) {

            flip = (flip + 1) % 2;
            v0 = innerData[0];
            v1 = innerData[1].subtract(v0);
            v2 = outerData[0].subtract(v0);
            v3 = outerData[1].subtract(v0);
            axis = v1.clone();
            axis.normalize();

            p1 = BABYLON.Vector3.Dot(axis,v1);
            p2 = BABYLON.Vector3.Dot(axis,v2);
            p3 = BABYLON.Vector3.Dot(axis,v3);
            var minX = Math.min(0, p1, p2, p3);
            var maxX = Math.max(0, p1, p2, p3);

            uvs[2 * indices[i + 1]] = flip + Math.cos(flip * Math.PI) * (p1 - minX)/(maxX - minX);
            uvs[2 * indices[i + 1] + 1] = 1;
            uvs[2 * indices[i + 4]] = flip + Math.cos(flip * Math.PI) * (p3 - minX)/(maxX - minX);
            uvs[2 * indices[i + 4] + 1] = 0;
        }
    }

    BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    BABYLON.VertexData._ComputeSides(BABYLON.Mesh.DOUBLESIDE, positions, indices, normals, uvs);
    //Create a custom mesh
    var customMesh = new BABYLON.Mesh("custom", scene);

    //Create a vertexData object
    var vertexData = new BABYLON.VertexData();

    //Assign positions and indices to vertexData
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.uvs = uvs;

    //Apply vertexData to custom mesh
    vertexData.applyToMesh(customMesh);

    return customMesh;

}

/**
 * vertexMod allow to add, supress, modify vertex of area in 3D environement with mouse button (left, middle, right)
 */

function vertexMod(button){
    //Remove Control Camera
    camera.detachControl();
    //Camera on 2D projection in 3D environement
    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    //Set position of camera
    camera.position = new BABYLON.Vector3(76, 120, 9);
    //Set rotation to 0
    camera.rotation = new BABYLON.Vector3(0,0,0);
    //Set rotation to x = 180 necessary if you want to bypass the black screen
    camera.cameraRotation = new BABYLON.Vector3(180,0,0);
    //Specification necessary for 2D visualisation on 3D environement
    resizeCamera2D();
    //Allow to specify in textInput the currently name of area you want to modify
    let textInput = setTextAreaWithInterface(button,"1",0,10);
    textInput.onTextChangedObservable.add(function(event) {
        areaName = textInput.text;
        console.log(areaName);
    });
    //Set areaName in global variable
    areaName = 1;
    //List of boutons to choose the action you want.
    let buttonAdd = setButtonWithInterface(textInput,"button_add","add",0,10,function(){console.log("Add ");addVertex()});
    let buttonRemove = setButtonWithInterface(buttonAdd,"button_remove","remove",0,10,function() {console.log("Remove ");removeVertex();});
    let buttonModify = setButtonWithInterface(buttonRemove,"button_modify","modify",0,10,function() {console.log("Modify ");modifyVertex();});
}

/**

 <summary> : Allow to refresh the renderer of one area
 <param> : area is what you want to modify in visualisation
 <returns> area was modify at the end of code, so you need to modify him in the map.
 <example> :

 {
     {some modify in area}
     refreshArea(area)
     mapArea.set(areaName,area);
 }
 */
function refreshArea(area){
    console.log(area);

    if(area.line !== undefined){
        area.line.dispose();
    }

    if(area.path.length >= 2){

        area.line = line2D("line", {path:  area.path, width:1, closed:true}, scene);
        area.line.material = new BABYLON.StandardMaterial("", scene);
        area.line.material.alpha = 0.8;
        area.line.material.diffuseColor = BABYLON.Color3.Black();

        if ( area.polygon !== undefined) {
            area.polygon.dispose();
        }

        if( area.path.length >= 3) {

            area.polygon = BABYLON.MeshBuilder.CreatePolygon("polygon", {
                shape:  area.path,
            }, scene);
            area.polygon.position.y = 5
            area.polygon.material = new BABYLON.StandardMaterial("red", scene);
            area.polygon.material.alpha = 0.4;
            area.polygon.material.diffuseColor =  area.color;


        }
    }
}

/**
 <summary> : Allow to add vortex in mouse position in currently area
 */
function addVertex(){
    scene.onPointerDown = function (event, pickResult){

        vector = pickResult.pickedPoint;
        vector.y = 5;

    let area = mapArea.get(areaName);
    let path;
    let line;
    let polygon;
    let color;
    if(area === undefined){
        path = [
            vector
        ]
        color = new BABYLON.Color3(Math.random(),Math.random(),Math.random());
        area = {path : path, line : line, polygon: polygon, color : color}
    }else{
        area.path.push(vector);
        refreshArea(area);
    }
    mapArea.set(areaName,area);
    }
}

/**
 <summary> : Allow to remove vortex in mouse position in currently area
 */
function removeVertex(){
    scene.onPointerDown = function (event, pickResult) {

        vector = pickResult.pickedPoint;
        vector.y = 5;

        let area = mapArea.get(areaName);
        if(area !== undefined){

            let path = area.path;
            if(path.length > 0){
            if(path.length >2){
            let similar;
            let distance;
            similar = path[0];
            distance = Math.abs((vector.x - similar.x)) + Math.abs((vector.y - similar.y)) + Math.abs((vector.z - similar.z));
            path.forEach(e => {
                let distanceB = Math.abs((vector.x - e.x)) + Math.abs((vector.y - e.y)) + Math.abs((vector.z - e.z))
                console.log(e + " pour une distance de :  " + distanceB + " et " + similar + "pour une distance de " +  distance)
                if(distance > distanceB){
                    distance = distanceB;
                    similar = e;
                }
            });
            let i = path.indexOf(similar);
                path.splice(i,1);
            }else {
                path = [];
            }
            area.path = path;
            refreshArea(area);
            mapArea.set(areaName,area);
            }
        }

    }
}

/**
 <summary> : Allow to modify vortex in mouse position in currently area
 */
function modifyVertex(){
    scene.onPointerDown = function (event, pickResult) {

        vector = pickResult.pickedPoint;
        vector.y = 5;
        console.log("Not yet implemented");
    }
}

/**
 <summary> : Allow to zoom in visualisation in Edition Mode.
 MaxZoom : 60
 MinZoom : 40
 */
function zoomF(event) {
    event.preventDefault();
    console.log("COUCOU " + zoom);
    zoom += event.deltaY * +0.01;
    // Restrict scale
    zoom = Math.min(Math.max(minZoom, zoom), maxZoom);
    resizeCamera2D();

}

function resizeCamera2D(){
    ratio = canvas.width / canvas.height ;
    width = zoom * ratio;
    camera.orthoTop = zoom;
    camera.orthoLeft = -width;
    camera.orthoRight = width;
    camera.orthoBottom = -zoom;
}

/**
 <summary> : Allow to  made new model of button
 */
function setButton(nom,message,x,y,radius,outlineColor,backgroundColor,action){
    var button = BABYLON.GUI.Button.CreateSimpleButton(nom, message);
    button.width = "100px";
    button.height = "40px";
    button.top = (-(canvas.height/2) +((button.heightInPixels/2)+y));
    button.left = (-(canvas.width/2) +((button.widthInPixels/2)+x));
    button.color = outlineColor;
    button.cornerRadius = radius;
    button.background = backgroundColor;
    button.onPointerUpObservable.add(action);
    advancedTexture.addControl(button);
    return button;
}

/**
 <summary> : Allow to  made new button with the same model of one element in interface
 */
function setButtonWithInterface(interface,nom,message,x,y,action){
    var button2 = BABYLON.GUI.Button.CreateSimpleButton(nom, message);
    button2.width = interface.width;
    button2.height = interface.height;
    if(y !== 0 ){
        button2.top = interface.topInPixels + button2.heightInPixels + y;
    }else{
        button2.top = interface.topInPixels;
    }

    if(x !== 0 ){
        button2.left = interface.leftInPixels + button2.widthInPixels + x;
    }else{
        button2.left = interface.leftInPixels;
    }

    button2.color = interface.color;
    button2.cornerRadius = interface.cornerRadius;
    button2.background = interface.background;
    button2.onPointerUpObservable.add(action);
    advancedTexture.addControl(button2);

    return button2;
}

/**
 <summary> : Allow to  made new Text Area with the same model of one element in interface
 */
function setTextAreaWithInterface(interface,messageDefault,x,y){
    var textInput = new BABYLON.GUI.InputText("areaNumber");
    textInput.width = "100px";
    textInput.maxWidth = "100px";
    textInput.height = "40px";

    if(y !== 0 ){
        textInput.top = interface.topInPixels + textInput.heightInPixels + y;
    }else{
        textInput.top = interface.topInPixels;
    }

    if(x !== 0 ){
        textInput.left = interface.leftInPixels + textInput.widthInPixels + x;
    }else{
        textInput.left = interface.leftInPixels;
    }

    textInput.text = messageDefault;
    textInput.color = interface.color;
    textInput.background = interface.background;
    advancedTexture.addControl(textInput);

    return textInput;
}

/**
 * @param name represent the name of scene you want to load in scene folder, exemple : name = "prototype" for "prototype.babylon"
 * @returns {BABYLON.Scene}
 */
var createScene = function(name){
    var scene = new BABYLON.Scene(engine);
    BABYLON.SceneLoader.Append("", name, scene, function (scene) {
        let materials = scene.materials;
        if(materials !== undefined){
         materials.forEach(material => {material.backFaceCulling = false;});
        }
    });
    // Camera
    camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(76, 120, 9), scene);

    camera.setTarget(BABYLON.Vector3.Zero());
    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(5, 10, 0), scene);

    // GUI
    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    let button = setButton("button_area_editor","area editor",10,30,20,"white","green",function() {console.log("Edition");vertexMod(button);});

    return scene;
}

var defaultScene = function() {
    return createScene("scene/prototype.babylon")
}

initFunction = async function() {
    var asyncEngineCreation = async function() {
        try {
            return createDefaultEngine();
        } catch(e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            return createDefaultEngine();
        }
    }
        canvas.addEventListener('wheel', zoomF);
    engine = await asyncEngineCreation();
    if (!engine) throw 'engine should not be null.';
    scene = defaultScene();};
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