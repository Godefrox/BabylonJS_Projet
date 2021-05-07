import {Vortex} from "./Vortex";
class Edition {

    ui = null;
    engine = null;
    vortex = null;
    interfaces = [];
    functDown = null;
    functMove = null;
    shiftBoolean = false;

    constructor(engine,ui) {
        this.engine = engine;
        this.ui = ui;
        this.vortex = new Vortex(engine);
    }

    line2D (name, options, scene) {
        //Arrays for vertex positions and indices
        let positions = [];
        let indices = [];

        let width = options.width || 1;
        let path = options.path;
        let closed = options.closed || false;
        let standardUV;
        if (options.standardUV === undefined) {
            standardUV = true;
        } else {
            standardUV = options.standardUV;
        }

        let outerData = [];
        let innerData = [];
        let angle = 0;
        let p
        let nbPoints = path.length;
        let line = BABYLON.Vector3.Zero();
        let nextLine = BABYLON.Vector3.Zero();
        let direction
        let lineNormal
        path[1].subtractToRef(path[0], line);

        if (nbPoints > 2 && closed) {
            path[2].subtractToRef(path[1], nextLine);
            for (p = 0; p < nbPoints; p++) {
                angle = Math.PI - Math.acos(BABYLON.Vector3.Dot(line, nextLine) / (line.length() * nextLine.length()));
                direction = BABYLON.Vector3.Cross(line, nextLine).normalize().y;
                lineNormal = new BABYLON.Vector3(-line.z, 0, 1 * line.x).normalize();
                line.normalize();
                innerData[(p + 1) % nbPoints] = path[(p + 1) % nbPoints];
                outerData[(p + 1) % nbPoints] = path[(p + 1) % nbPoints].add(lineNormal.scale(width)).add(line.scale(direction * width / Math.tan(angle / 2)));
                line = nextLine.clone();
                path[(p + 3) % nbPoints].subtractToRef(path[(p + 2) % nbPoints], nextLine);
            }
        } else {
            lineNormal = new BABYLON.Vector3(-line.z, 0, 1 * line.x).normalize();
            line.normalize();
            innerData[0] = path[0];
            outerData[0] = path[0].add(lineNormal.scale(width));

            for (p = 0; p < nbPoints - 2; p++) {
                path[p + 2].subtractToRef(path[p + 1], nextLine);
                angle = Math.PI - Math.acos(BABYLON.Vector3.Dot(line, nextLine) / (line.length() * nextLine.length()));
                direction = BABYLON.Vector3.Cross(line, nextLine).normalize().y;
                lineNormal = new BABYLON.Vector3(-line.z, 0, 1 * line.x).normalize();
                line.normalize();
                innerData[p + 1] = path[p + 1];
                outerData[p + 1] = path[p + 1].add(lineNormal.scale(width)).add(line.scale(direction * width / Math.tan(angle / 2)));
                line = nextLine.clone();
            }
            if (nbPoints > 2) {
                path[nbPoints - 1].subtractToRef(path[nbPoints - 2], line);
                lineNormal = new BABYLON.Vector3(-line.z, 0, 1 * line.x).normalize();
                line.normalize();
                innerData[nbPoints - 1] = path[nbPoints - 1];
                outerData[nbPoints - 1] = path[nbPoints - 1].add(lineNormal.scale(width));
            } else {
                innerData[1] = path[1]
                outerData[1] = path[1].add(lineNormal.scale(width));
            }
        }

        let maxX = Number.MIN_VALUE;
        let minX = Number.MAX_VALUE;
        let maxZ = Number.MIN_VALUE;
        let minZ = Number.MAX_VALUE;

        for (p = 0; p < nbPoints; p++) {
            positions.push(innerData[p].x, innerData[p].y, innerData[p].z);
            maxX = Math.max(innerData[p].x, maxX);
            minX = Math.min(innerData[p].x, minX);
            maxZ = Math.max(innerData[p].z, maxZ);
            minZ = Math.min(innerData[p].z, minZ);
        }

        for (p = 0; p < nbPoints; p++) {
            positions.push(outerData[p].x, outerData[p].y, outerData[p].z);
            maxX = Math.max(innerData[p].x, maxX);
            minX = Math.min(innerData[p].x, minX);
            maxZ = Math.max(innerData[p].z, maxZ);
            minZ = Math.min(innerData[p].z, minZ);
        }
        let i
        for (i = 0; i < nbPoints - 1; i++) {
            indices.push(i, i + 1, nbPoints + i + 1);
            indices.push(i, nbPoints + i + 1, nbPoints + i)
        }

        if (nbPoints > 2 && closed) {
            indices.push(nbPoints - 1, 0, nbPoints);
            indices.push(nbPoints - 1, nbPoints, 2 * nbPoints - 1)
        }

        let normals = [];
        let uvs = [];

        if (standardUV) {
            for (p = 0; p < positions.length; p += 3) {
                uvs.push((positions[p] - minX) / (maxX - minX), (positions[p + 2] - minZ) / (maxZ - minZ));
            }
        } else {
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

            p1 = BABYLON.Vector3.Dot(axis, v1);
            p2 = BABYLON.Vector3.Dot(axis, v2);
            p3 = BABYLON.Vector3.Dot(axis, v3);
            minX = Math.min(0, p1, p2, p3);
            maxX = Math.max(0, p1, p2, p3);

            uvs[2 * indices[0]] = -minX / (maxX - minX);
            uvs[2 * indices[0] + 1] = 1;
            uvs[2 * indices[5]] = (p2 - minX) / (maxX - minX);
            uvs[2 * indices[5] + 1] = 0;

            uvs[2 * indices[1]] = (p1 - minX) / (maxX - minX);
            uvs[2 * indices[1] + 1] = 1;
            uvs[2 * indices[4]] = (p3 - minX) / (maxX - minX);
            uvs[2 * indices[4] + 1] = 0;

            for (i = 6; i < indices.length; i += 6) {

                flip = (flip + 1) % 2;
                v0 = innerData[0];
                v1 = innerData[1].subtract(v0);
                v2 = outerData[0].subtract(v0);
                v3 = outerData[1].subtract(v0);
                axis = v1.clone();
                axis.normalize();

                p1 = BABYLON.Vector3.Dot(axis, v1);
                p2 = BABYLON.Vector3.Dot(axis, v2);
                p3 = BABYLON.Vector3.Dot(axis, v3);
                minX = Math.min(0, p1, p2, p3);
                maxX = Math.max(0, p1, p2, p3);

                uvs[2 * indices[i + 1]] = flip + Math.cos(flip * Math.PI) * (p1 - minX) / (maxX - minX);
                uvs[2 * indices[i + 1] + 1] = 1;
                uvs[2 * indices[i + 4]] = flip + Math.cos(flip * Math.PI) * (p3 - minX) / (maxX - minX);
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

    editMod(button){
        let littleEngine = this.engine;
        this.engine.camera.detachControl();
        //Camera on 2D projection in 3D environement
        this.engine.camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        //Set position of camera
        this.engine.camera.position = new BABYLON.Vector3(76, 120, 9);
        //Set rotation to 0
        this.engine.camera.rotation = new BABYLON.Vector3(0,0,0);
        //Set rotation to x = 180 necessary if you want to bypass the black screen
        this.engine.camera.cameraRotation = new BABYLON.Vector3(180,0,0);
        //Specification necessary for 2D visualisation on 3D environement
        this.engine.resizeCamera2D();
        //Allow to specify in textInput the currently name of area you want to modify
        let textInputArea = this.ui.setTextAreaWithInterface(button,"1",0,10);
        textInputArea.onTextChangedObservable.add(function(event) {
            this.engine.setAreaName(textInputArea.text);
        });
        this.interfaces.push(textInputArea);
        //Set areaName in global variable
        this.engine.setAreaName(textInputArea.text);
        //List of boutons
        let me = this;
        let buttonAdd = this.ui.setButtonWithInterface(textInputArea,"button_add","add",0,10,function(){me.selectAction("add")});
        this.interfaces.push(buttonAdd);
        let buttonRemove = this.ui.setButtonWithInterface(buttonAdd,"button_remove","remove",0,10,function() {me.selectAction("remove");});
        this.interfaces.push(buttonRemove);
        let buttonModify = this.ui.setButtonWithInterface(buttonRemove,"button_modify","modify",0,10,function() {me.selectAction("modify");});
        this.interfaces.push(buttonModify);
        //Picker Color to change color of area
        let pickerRGB = this.ui.setPickerWithInterface(buttonModify,0,10,function(value) { // value is a color3
            let area = littleEngine.mapArea.get(littleEngine.getAreaName());
            if(area !== undefined){
                area.color = new BABYLON.Color3(value.r,value.g,value.b);
                me.refreshArea(area);
                littleEngine.mapArea.set(littleEngine.getAreaName(),area);
            }
        });
        this.interfaces.push(pickerRGB);
        //Bountons to take on Drag & Drop
        let buttonDragDrop = this.ui.setButtonWithInterface(pickerRGB,"button_drag&Drop","drag&Drop",0,10,function() {me.selectAction("drag&Drop")});
        buttonDragDrop.height = buttonModify.height;
        buttonDragDrop.width = buttonModify.width;
        //Area Text to choose name of acces
        let textInputAcces = this.ui.setTextAreaWithInterface(buttonDragDrop,"acces1",0,10);
        textInputAcces.onTextChangedObservable.add(function(event) {
            littleEngine.setAccesName(textInputAcces.text);
        });
        //Set areaName in global variable
        this.engine.setAccesName(textInputAcces.text);
        //Allow to launch a function if pointer has click
        this.engine.scene.onPointerDown = function (event, pickResult) {
            littleEngine.setVector(pickResult.pickedPoint);
            if(me.functDown != null){
                me.functDown();
                console.log("LES CONNARDS");
            }
        }
       
        //Allow to launch a function if pointer move.
        this.engine.scene.onPointerMove = function(event,pickResult){
            if(me.functMove != null){
                console.log("LES CONNARDS MOUVANT");
                if(!me.shiftBoolean){
                    littleEngine.setVector(littleEngine.scene.pick(littleEngine.scene.pointerX,littleEngine.scene.pointerY).pickedPoint);
                }
                me.functMove();
            }
        }
        //Add a observable to detect the key press, actualy we need to detect shift press
        this.engine.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    if(kbInfo.event.key == "Shift"){
                        if(littleEngine.clone != null){
                            if(!me.shiftBoolean ){
                                heightEditionMod();
                            }
                            me.shiftBoolean = true;
                        }
                    }
                    break;
                case BABYLON.KeyboardEventTypes.KEYUP:
                    if(kbInfo.event.key == "Shift"){
                        me.shiftBoolean = false;
                        littleEngine.oldPointer = null;
                    }
                    break;
            }
        });
    }


    refreshArea(area){

        if(area.line != undefined){
            area.line.dispose();
        }

        if(area.path.length >= 2){

            area.line = this.line2D("line", {path:  area.path, width:1, closed:true}, this.engine.scene);
            area.line.material = new BABYLON.StandardMaterial("", this.engine.scene);
            area.line.material.alpha = 0.8;
            area.line.material.diffuseColor = BABYLON.Color3.Black();

            if ( area.polygon != undefined) {
                area.polygon.dispose();
            }

            if( area.path.length >= 3) {

                area.polygon = BABYLON.MeshBuilder.CreatePolygon("polygon", {
                    shape:  area.path,
                }, this.engine.scene);
                area.polygon.position.y = 5
                area.polygon.material = new BABYLON.StandardMaterial("red", this.engine.scene);
                area.polygon.material.alpha = 0.4;
                area.polygon.material.diffuseColor =  area.color;


            }
        }
}

    selectAction(action) {
        let me = this;
        switch (action) {
            case "add" :
                this.functDown = this.vortex.addVertex;
                break;
            case "remove" :
                this.functDown = this.vortex.removeVertex;
                break;
            case "modify" :
                this.functDown = this.vortex.modifyVertex;
                break;
            case "modify_move" :
                console.log("CONNARD");
                this.functDown = function () {
                    me.functDown = me.vortex.modifyVertex;
                    me.functMove = null;
                    console.log("CONNARD4");
                };
                this.functMove = this.vortex.followVertex;
                break;
            case "drag&Drop" :
                dragAndDropScene( this.accesName);
                break;
            case "followObject" :
                this.functMove = followObject;
                let littleEngine = this.engine;
                this.functDown = function () {
                    me.functMove = null;
                    me.functDown = null;
                    littleEngine.clone = null;
                };
            default :
                break;
        }
    }

}
export {Edition};