/**
@Author : Godefroy MONTONATI
@Module : Visualisation 3D
 */
import {Interface} from "../js/Interface";
import {Edition} from "./Edition";

class Engine2 {

    constructor() {
    }
    /**
     Ensemble de variables spécifiques à Babylon JS
     */
    canvas = document.getElementById("renderCanvas");
    engine = null;
    scene = null;
    sceneToRender = null;
    camera = null;

    /**
     Ensemble de variables global
     */
    ui = null;
    edition = null;
    vector = null;
    oldPointer = null;
    areaName = null;
    accesName = null;
    clone = null;

    minZoom = 10;
    zoom = 50;
    maxZoom = 60;

    width = null;
    ratio = null;

    mapArea = new Map();
    /**
     * Structure d'une données au sein de la map
     * {
     * path : path,
     * line : line,
     * polygon: polygon,
     * color : color}
     */
    controleAcces = [];



    boundingBox = null;
    center = null;
    extendSize = null;

    shiftBoolean = false;


    /**
     Function publish by babylon
     */



    /**
     * editMod allow to add, supress, modify vertex of area in 3D environement with mouse button (left, middle, right) and to drag&Drop
     */


    /**
     * Allow to pass in modification of Height in drag&Drop
     */
    heightEditionMod() {
        this.camera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA
        this.camera.attachControl(canvas, true);
        this.camera.position = new BABYLON.Vector3(clone.position.x, clone.position.y, clone.position.z);
        this.zoom = 40;
        resizeCamera2D();
        this.clone.position = vector;
        followObject();
        this.camera.position.x -= 10;
        this.camera.position.z -= 10
    }

    getAreaName() {
        return  this.areaName;
    }

    getAccesName() {
        return  this.accesName;
    }

    setAreaName(newAreaName) {
        this.areaName = newAreaName;
    }

    setAccesName(newAcessName) {
        this.accesName = newAcessName;
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

    /**
     * allow to synchronize the function you want to launch with pointer and in general case
     * @param action
     */

    /**
     <summary> : Allow to zoom in visualisation in Edition Mode.
     MaxZoom : 60
     MinZoom : 40
     */
    zoomF(event) {
        event.preventDefault();
        this.zoom += event.deltaY * +0.01;
        // Restrict scale
        this.zoom = Math.min(Math.max(minZoom, this.zoom), this.maxZoom);
        resizeCamera2D();

    }

    /**
     * resizeCamera to have the best point of view
     */
    resizeCamera2D() {
        this.ratio = this.canvas.width / this.canvas.height;
        this.width = this.zoom * this.ratio;
        this.camera.orthoTop = this.zoom;
        this.camera.orthoLeft = -this.width;
        this.camera.orthoRight = this.width;
        this.camera.orthoBottom = -this.zoom;
    }

    /**
     <summary> : Allow to  made new model of button
     */


    /**
     * Allow to place a object with the name of him. We need to place a first object in invisible on the scene
     * @param name
     */
    dragAndDropScene(name) {
        let node =  this.scene.getNodeByName(name);
        if (node != undefined) {
            let i = 1;
            let nameClone = name + "_";
            while ( this.scene.getNodeByName((nameClone + i) !== undefined)) {
                i++;
            }
            let node2 = new BABYLON.Node(nameClone,  this.scene);
            this.clone = node.clone(nameClone + "_clone", node2);
            this.clone.isVisible = true;
            this.boundingBox =  this.clone.getBoundingInfo().boundingBox;
            this.center =  this.boundingBox.center;
            this.extendSize =  this.boundingBox.center;
            selectAction("followObject");
        }
    }

    /**
     * Allow the object to follow the mouse position in 3D world
     */
    followObject() {
        if ( this.shiftBoolean) {
            this.camera.target =  this.clone.position;
            if ( this.oldPointer != null) {
                this.vector.x =  this.clone.position.x;
                this.vector.z = this. clone.position.z;
                this.vector.y =  this.clone.position.y
                if ( this.oldPointer.y >  this.scene.pointerY) {
                    this.vector.y += 0.1;
                } else {
                    this.vector.y -= 0.1;
                }
            }
            this.oldPointer = new BABYLON.Vector2( this.scene.pointerX,  this.scene.pointerY);
        } else {
            let pickResult =  this.scene.pick( this.scene.pointerX,  this.scene.pointerY);
            this.vector = pickResult.pickedPoint;
            this.vector.x -=  this.center.x;
            this.vector.z -=  this.center.z;
            this.vector.y +=  this.extendSize.y;
        }

        this.clone.position =  this.vector;
    }

    /**
     * Allow to change Y position of actual clone in the scene all depend of direction of mouse. GO TOP of SCREEN = UP
     */
    dragAndDropHeightPosition() {
        if (this.oldPointer != null && this.clone != null && vector != null) {
            if (this.oldPointer.x < this.vector.x) {
                this.clone.y += 0.1;
            } else {
                this.clone.y -= 0.1;
            }
        }
    }

    setCameraActions(actions) {
        if(actions != null){
            actions.forEach(e => e());
        }
    }

    setVector(newVector) {
        this.vector = newVector;
    }

    getVector() {
        return this.vector;
    }

    /**
     * @param name represent the name of scene you want to load in scene folder, exemple : name = "prototype" for "prototype.babylon"
     * @returns {BABYLON.Scene}
     */
    createScene = function (name) {
        this.scene = new BABYLON.Scene(this.engine);
        BABYLON.SceneLoader.Append("", name, this.scene, function (scene) {
            let materials = scene.materials;
            if (materials !== undefined) {
                materials.forEach(material => {
                    material.backFaceCulling = false;
                });
            }
        });
        // Camera
        this.camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(76, 120, 9), this.scene);

        this.camera.setTarget(BABYLON.Vector3.Zero());
        // This attaches the camera to the canvas
        this.camera.attachControl(this.canvas, true);
        let light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(5, 10, 0), this.scene);

        // GUI
        this.ui = new Interface(this);
        this.edition = new Edition(this,this.ui);
        let edit = this.edition;
        let button = this.ui.setButton("button_area_editor", "area editor", BABYLON.GUI.Control.VERTICALALIGNMENT_TOP, BABYLON.GUI.Control.HORIZONTAlALIGNMENT_LEFT, 10, 10, 20, "white", "green", function () {
            edit.editMod(button);
        });
        this.controleAcces.push(BABYLON.MeshBuilder.CreateBox("acces1", this.scene));
        this.controleAcces.push(BABYLON.MeshBuilder.CreateBox("acces2", this.scene));
        this.controleAcces.push(BABYLON.MeshBuilder.CreateBox("acces3", this.scene));
        this.controleAcces.forEach(e => {
            e.isVisible = false;
            e.material = new BABYLON.StandardMaterial((e.name + "_material"), this.scene);
            e.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random, Math.random);
        })
        return this.scene;
    }
    /**
     * Allow to load the default scene
     * @returns {BABYLON.Scene}
     */
    defaultScene = function () {
        return this.createScene("scene/prototype.babylon")
    }



}

export {Engine2}