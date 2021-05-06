/**
@Author : Godefroy MONTONATI
@Module : Visualisation 3D
 */


/**
 Ensemble de variables spécifiques à Babylon JS
 */
let canvas = document.getElementById("renderCanvas");
let engine = null;
let scene = null;
let sceneToRender = null;
let advancedTexture = null;

/**
    Ensemble de variables global
*/
let vector = null;
let oldPointer = null;

let areaName = null;
let accesName = null;
let clone = null;

let minZoom = 10;
let zoom = 50;
let maxZoom = 60;

let width = null;
let ratio = null;

let mapArea = new Map();
/**
 * Structure d'une données au sein de la map
 * {
 * path : path,
 * line : line,
 * polygon: polygon,
 * color : color}
 */
let controleAcces = [];


let functDown = null;
let functMove = null;

let boundingBox = null;
let center = null;
let extendSize = null;

let shiftBoolean = false;



/**
   Function publish by babylon
 */
let createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };
let line2D = function(name, options, scene) {

    //Arrays for vertex positions and indices
    let positions = [];
    let indices = [];

    let width = options.width || 1;
    let path = options.path;
    let closed = options.closed || false;
    let standardUV;
    if(options.standardUV === undefined) {
        standardUV = true;
    }
    else {
        standardUV = options.standardUV;
    }

    let outerData = [];
    let innerData = [];
    let angle = 0;
    let p
    let nbPoints = path.length;
    let line = BABYLON.Vector3.Zero();
    let nextLine = BABYLON.Vector3.Zero();
    path[1].subtractToRef(path[0], line);

    if(nbPoints > 2 && closed) {
        path[2].subtractToRef(path[1], nextLine);
        for(p = 0; p < nbPoints; p++) {
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

        for(p = 0; p < nbPoints - 2; p++) {
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

    let maxX = Number.MIN_VALUE;
    let minX = Number.MAX_VALUE;
    let maxZ = Number.MIN_VALUE;
    let minZ = Number.MAX_VALUE;

    for(p = 0; p < nbPoints; p++) {
        positions.push(innerData[p].x, innerData[p].y, innerData[p].z);
        maxX = Math.max(innerData[p].x, maxX);
        minX = Math.min(innerData[p].x, minX);
        maxZ = Math.max(innerData[p].z, maxZ);
        minZ = Math.min(innerData[p].z, minZ);
    }

    for(p = 0; p < nbPoints; p++) {
        positions.push(outerData[p].x, outerData[p].y, outerData[p].z);
        maxX = Math.max(innerData[p].x, maxX);
        minX = Math.min(innerData[p].x, minX);
        maxZ = Math.max(innerData[p].z, maxZ);
        minZ = Math.min(innerData[p].z, minZ);
    }
    let i
    for(i = 0; i < nbPoints - 1; i++) {
        indices.push(i, i + 1, nbPoints + i + 1);
        indices.push(i, nbPoints + i + 1, nbPoints + i)
    }

    if(nbPoints > 2 && closed) {
        indices.push(nbPoints - 1, 0, nbPoints);
        indices.push(nbPoints - 1, nbPoints, 2 * nbPoints - 1)
    }

    let normals = [];
    let uvs =[];

    if(standardUV) {
        for(p = 0; p < positions.length; p += 3) {
            uvs.push((positions[p] - minX)/(maxX - minX), (positions[p + 2] - minZ)/(maxZ - minZ));
        }
    }
    else {
        let flip = 0;
        let p1;
        let p2;
        let p3;
        let v0 = innerData[0];
        let v1 = innerData[1].subtract(v0);
        let v2 = outerData[0].subtract(v0);
        let v3 = outerData[1].subtract(v0);
        let axis = v1.clone();
        axis.normalize();

        p1 = BABYLON.Vector3.Dot(axis,v1);
        p2 = BABYLON.Vector3.Dot(axis,v2);
        p3 = BABYLON.Vector3.Dot(axis,v3);
        minX = Math.min(0, p1, p2, p3);
        maxX = Math.max(0, p1, p2, p3);

        uvs[2 * indices[0]] = -minX/(maxX - minX);
        uvs[2 * indices[0] + 1] = 1;
        uvs[2 * indices[5]] = (p2 - minX)/(maxX - minX);
        uvs[2 * indices[5] + 1] = 0;

        uvs[2 * indices[1]] = (p1 - minX)/(maxX - minX);
        uvs[2 * indices[1] + 1] = 1;
        uvs[2 * indices[4]] = (p3 - minX)/(maxX - minX);
        uvs[2 * indices[4] + 1] = 0;

        for(i = 6; i < indices.length; i +=6) {

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
            minX = Math.min(0, p1, p2, p3);
            maxX = Math.max(0, p1, p2, p3);

            uvs[2 * indices[i + 1]] = flip + Math.cos(flip * Math.PI) * (p1 - minX)/(maxX - minX);
            uvs[2 * indices[i + 1] + 1] = 1;
            uvs[2 * indices[i + 4]] = flip + Math.cos(flip * Math.PI) * (p3 - minX)/(maxX - minX);
            uvs[2 * indices[i + 4] + 1] = 0;
        }
    }

    BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    BABYLON.VertexData._ComputeSides(BABYLON.Mesh.DOUBLESIDE, positions, indices, normals, uvs);
    //Create a custom mesh
    let customMesh = new BABYLON.Mesh("custom", scene);

    //Create a vertexData object
    let vertexData = new BABYLON.VertexData();

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
 * editMod allow to add, supress, modify vertex of area in 3D environement with mouse button (left, middle, right) and to drag&Drop
 */

function editMod(button){
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
    let textInputArea = setTextAreaWithInterface(button,"1",0,10);
    textInputArea.onTextChangedObservable.add(function(event) {
        areaName = textInputArea.text;
    });
    //Set areaName in global variable
    areaName = textInputArea.text;
    //List of boutons
    let buttonAdd = setButtonWithInterface(textInputArea,"button_add","add",0,10,function(){selectAction("add")});
    let buttonRemove = setButtonWithInterface(buttonAdd,"button_remove","remove",0,10,function() {selectAction("remove");});
    let buttonModify = setButtonWithInterface(buttonRemove,"button_modify","modify",0,10,function() {selectAction("modify");});
    //Picker Color to change color of area
    let pickerRGB = setPickerWithInterface(buttonModify,0,10,function(value) { // value is a color3
        let area = mapArea.get(areaName);
        if(area !== undefined){
            area.color = new BABYLON.Color3(value.r,value.g,value.b);
            refreshArea(area);
            mapArea.set(areaName,area);
        }
    });
    //Bountons to take on Drag & Drop
    let buttonDragDrop = setButtonWithInterface(pickerRGB,"button_drag&Drop","drag&Drop",0,10,function() {selectAction("drag&Drop")});
    buttonDragDrop.height = buttonModify.height;
    buttonDragDrop.width = buttonModify.width;
    //Area Text to choose name of acces
    let textInputAcces = setTextAreaWithInterface(buttonDragDrop,"acces1",0,10);
    textInputAcces.onTextChangedObservable.add(function(event) {
        accesName = textInputAcces.text;
    });
    //Set areaName in global variable
    accesName = textInputAcces.text;
    //Allow to launch a function if pointer has click
    scene.onPointerDown = function (event, pickResult) {
        vector = pickResult.pickedPoint;
        if(functDown != null){
            functDown();
        }
    }
    //Allow to launch a function if pointer move.
    scene.onPointerMove = function(event,pickResult){
        if(functMove != null){
            if(!shiftBoolean){
            vector = scene.pick(scene.pointerX,scene.pointerY).pickedPoint;
            }
            functMove();
        }
    }
    //Add a observable to detect the key press, actualy we need to detect shift press
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
            case BABYLON.KeyboardEventTypes.KEYDOWN:
                if(kbInfo.event.key == "Shift"){
                    if(clone != null){
                    if(!shiftBoolean ){
                        heightEditionMod();
                    }
                    shiftBoolean = true;
                    }
                }
                break;
            case BABYLON.KeyboardEventTypes.KEYUP:
                if(kbInfo.event.key == "Shift"){
                    shiftBoolean = false;
                    oldPointer = null;
                }
                break;
        }
    });
}

/**
 * Allow to pass in modification of Height in drag&Drop
 */
function heightEditionMod(){
    camera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA
    camera.attachControl(canvas, true);
    camera.position = new BABYLON.Vector3(clone.position.x,clone.position.y,clone.position.z) ;
    zoom = 40;
    resizeCamera2D();
    console.log(camera.position);
    console.log(clone.position);
    clone.position = vector;
    followObject();
    camera.position.x -= 10;
    camera.position.z -= 10
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

    if(area.line != undefined){
        area.line.dispose();
    }

    if(area.path.length >= 2){

        area.line = line2D("line", {path:  area.path, width:1, closed:true}, scene);
        area.line.material = new BABYLON.StandardMaterial("", scene);
        area.line.material.alpha = 0.8;
        area.line.material.diffuseColor = BABYLON.Color3.Black();

        if ( area.polygon != undefined) {
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
 * allow to synchronize the function you want to launch with pointer and in general case
 * @param action
 */
function selectAction(action){
    switch (action){
        case "add" :
            functDrag = null;
            functDown = addVertex;
            break;
        case "remove" :
            functDrag = null;
            functDown = removeVertex;
            break;
        case "modify" :
            functDrag = null;
            functDown = modifyVertex;
            break;
        case "modify_move" :
            functDown = function(){
                functDown = modifyVertex;
                functMove = null;
            };
            functMove = followVertex;
            break;
        case "drag&Drop" :
            dragAndDropScene(accesName);
            break;
        case "followObject" :
            functMove = followObject;
            functDown =  functDown =  function(){
                functMove=null;
                functDown = null;
                clone = null;
            };
        default :
            break;
    }
}

/**
 * detect the closest vortex with position of vector (Mouse position in 3D)
 * @param path
 * @returns {*}
 */
function closestVortex(path){
    let similar = path[0];
    let distance = Math.abs((vector.x - similar.x)) + Math.abs((vector.y - similar.y)) + Math.abs((vector.z - similar.z));
    path.forEach(e => {
        let distanceB = Math.abs((vector.x - e.x)) + Math.abs((vector.y - e.y)) + Math.abs((vector.z - e.z));

        if(distance > distanceB){
            distance = distanceB;
            similar = e;
        }
    });
    return path.indexOf(similar);
}
/**
 <summary> : Allow to add vortex in mouse position in currently area
 */
function addVertex(){
        vector.y = 5;
        let area = mapArea.get(areaName);
        let path = null;
        let line = null;
        let polygon = null;
        let color = null;
        if(area == undefined){
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

/**
 <summary> : Allow to remove vortex in mouse position in currently area
 */
function removeVertex(){
        vector.y = 5;
        let area = mapArea.get(areaName);
        if(area !== undefined){
            let path = area.path;
            if(path.length > 0){
                if(path.length >2){
                    let i = closestVortex(path);
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

/**
 <summary> : Allow to modify vortex in mouse position in currently area
 */
function modifyVertex(){
        let area = mapArea.get(areaName);
        if(area != undefined){
            let path = area.path;
            if(path.length > 0){
                if(path.length > 1){
                    selectAction("modify_move");
                }
            }
        }
}

/**
 * Allow the vortex to follow the mouse, we need to launch them with selector function
 */
function followVertex(){
    let area = mapArea.get(areaName);
    if(area != undefined) {
        let path = area.path;
        let i = closestVortex(path);
        vector.y = 5;
        path.splice(i, 1, vector);
        area.path = path;
        refreshArea(area);
        mapArea.set(areaName,area);
    }
}

/**
 * Allow to set color of Area
 */
function setColorArea(){
    area.color = new BABYLON.Color3(value.r,value.g,value.b);
    refreshArea(area);
    mapArea.set(areaName,area);
}
/**
 <summary> : Allow to zoom in visualisation in Edition Mode.
 MaxZoom : 60
 MinZoom : 40
 */
function zoomF(event) {
    event.preventDefault();
    zoom += event.deltaY * +0.01;
    // Restrict scale
    zoom = Math.min(Math.max(minZoom, zoom), maxZoom);
    resizeCamera2D();

}

/**
 * resizeCamera to have the best point of view
 */
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
function setButton(nom,message,horizontalAlignment,verticalAlignment,x,y,radius,outlineColor,backgroundColor,action){
    var button = BABYLON.GUI.Button.CreateSimpleButton(nom, message);
    button.width = "100px";
    button.height = "40px";
    button.horizontalAlignment = horizontalAlignment;
    button.verticalAlignment = verticalAlignment;
    button.left = button.leftInPixels + x;
    button.top = button.topInPixels + y;
   // button.top = 10;
    // button.left = (-(canvas.width/2) +((button.widthInPixels/2)+x));
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
    button2.horizontalAlignment = interface.horizontalAlignment;
    button2.verticalAlignment = interface.verticalAlignment;
    if(y !== 0 ){
        button2.top = interface.topInPixels + interface.heightInPixels/2 + button2.heightInPixels/2 + y;
    }else{
        button2.top = interface.topInPixels;
    }
    if(x !== 0 ){
        button2.left = interface.leftInPixels + interface.widthInPixels/2 + button2.widthInPixels/2 + x;
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
    textInput.horizontalAlignment = interface.horizontalAlignment;
    textInput.verticalAlignment = interface.verticalAlignment;
    if(y !== 0 ){
        textInput.top = interface.topInPixels + interface.heightInPixels/2 + textInput.heightInPixels/2 + y;
    }else{
        textInput.top = interface.topInPixels;
    }

    if(x !== 0 ){
        textInput.left = interface.leftInPixels + interface.widthInPixels/2 + textInput.widthInPixels/2 + x;
    }else{
        textInput.left = interface.leftInPixels;
    }

    textInput.text = messageDefault;
    console.log(textInput);
    textInput.color = interface.color;
    textInput.background = interface.background;
    advancedTexture.addControl(textInput);

    return textInput;
}
/**
 <summary> : Allow to  made new Pickera with the same model of one element in interface
*/
 function setPickerWithInterface(interface,x,y,action){
    let picker = new BABYLON.GUI.ColorPicker();
    let area = mapArea.get(areaName);
    if(area !== undefined){
        picker.value = area.color;
    }else{
        picker.value = new BABYLON.Color3(0,0,0);
    }
    picker.height = "100px";
    picker.width = "100px";
    picker.horizontalAlignment = interface.horizontalAlignment;
    picker.verticalAlignment = interface.verticalAlignment;
    if(y !== 0 ){
        //EN THEORIE
        //picker.top = interface.topInPixels + interface.heightInPixels/2 + picker.heightInPixels/2 + y ;
        // EN PRATIQUE
        picker.top = interface.topInPixels + picker.heightInPixels/2;
    }else{
        picker.top = interface.topInPixels;
    }
    if(x !== 0 ){
        picker.left = interface.leftInPixels + picture.widthInPixels/2 + picker.widthInPixels/2 + x;
    }else{
        picker.left = interface.leftInPixels;
    }
    picker.color = "white";
    picker.background = "green";

    picker.onValueChangedObservable.add(action);

    advancedTexture.addControl(picker);
    return picker;
}

/**
 * Allow to place a object with the name of him. We need to place a first object in invisible on the scene
 * @param name
 */
function dragAndDropScene(name){
    let node = scene.getNodeByName(name);
    if(node != undefined){
        let i =1;
        let nameClone = name + "_";
        while(scene.getNodeByName((nameClone+i) !== undefined)){
            i++;
        }
        let node2 = new BABYLON.Node(nameClone,scene);
        clone = node.clone(nameClone+"_clone",node2);
        clone.isVisible = true;
        boundingBox = clone.getBoundingInfo().boundingBox;
        center = boundingBox.center;
        extendSize = boundingBox.center;
        selectAction("followObject");
    }
}

/**
 * Allow the object to follow the mouse position in 3D world
 */
function followObject(){
    if(shiftBoolean){
        camera.target = clone.position;
        if(oldPointer != null){
            vector.x = clone.position.x;
            vector.z = clone.position.z;
            vector.y = clone.position.y
            if(oldPointer.y > scene.pointerY){
                vector.y += 0.1;
            }else{
                vector.y -= 0.1;
            }
        }
            oldPointer = new BABYLON.Vector2(scene.pointerX,scene.pointerY);
    }else{
        pickResult = scene.pick(scene.pointerX,scene.pointerY);
        vector = pickResult.pickedPoint;
        vector.x -= center.x;
        vector.z -= center.z;
        vector.y += extendSize.y;
    }

    clone.position = vector;
}

/**
 * Allow to change Y position of actual clone in the scene all depend of direction of mouse. GO TOP of SCREEN = UP
 */
function dragAndDropHeightPosition(){
    if(oldVector != null && clone != null && vector != null){
        if(oldVector.x < vector.x){
            clone.y += 0.1;
        }else{
            clone.y -= 0.1;
        }
    }
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

    let button = setButton("button_area_editor","area editor",BABYLON.GUI.Control.VERTICALALIGNMENT_TOP,BABYLON.GUI.Control.HORIZONTAlALIGNMENT_LEFT,10,10,20,"white","green",function() {editMod(button);});
    controleAcces.push(BABYLON.MeshBuilder.CreateBox("acces1",scene));
    controleAcces.push(BABYLON.MeshBuilder.CreateBox("acces2",scene));
    controleAcces.push(BABYLON.MeshBuilder.CreateBox("acces3",scene));
    controleAcces.forEach(e => {
        e.isVisible = false;
        e.material = new BABYLON.StandardMaterial((e.name+"_material"), scene);
        e.material.diffuseColor = new BABYLON.Color3(Math.random(),Math.random,Math.random);
    })
    return scene;
}
/**
 * Allow to load the default scene
 * @returns {BABYLON.Scene}
 */
var defaultScene = function() {
    return createScene("scene/prototype.babylon")
}

initFunction = async function() {
    var asyncEngineCreation = async function() {
        try {
            return createDefaultEngine();
        } catch(e) {
            return createDefaultEngine();
        }
    }
    engine = await asyncEngineCreation();
    if (!engine) throw 'engine should not be null.';
    scene = defaultScene();
    canvas.addEventListener('wheel', zoomF);
};
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