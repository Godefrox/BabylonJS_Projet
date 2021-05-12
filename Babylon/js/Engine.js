/**
@Author : Godefroy MONTONATI
@Module : Visualisation 3D
 */
import {Interface} from "./Interface";
import {Edition} from "./Edition";

class Engine {

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
    accessName = null;
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
    controleAccess = [];
    boundingBox = null;
    center = null;
    extendSize = null;
    shiftBoolean = false;

    getAreaName() {
        return  this.areaName;
    }

    getAccessName() {
        return  this.accessName;
    }

    getMapArea(){
        return  this.mapArea;
    }

    setAreaName(newAreaName) {
        this.areaName = newAreaName;
    }

    setAccessName(newAccessName) {
        this.accessName = newAccessName;
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





    setCameraEdition() {
        this.camera.detachControl();
        //Camera on 2D projection in 3D environement
        this.camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        //Set position of camera
        this.camera.position = new BABYLON.Vector3(76, 120, 9);
        //Set rotation to 0
        this.camera.rotation = new BABYLON.Vector3(0,0,0);
        //Set rotation to x = 180 necessary if you want to bypass the black screen
        this.camera.cameraRotation = new BABYLON.Vector3(180,0,0);
    }

    setCameraNormal(){
        this.camera.attachControl(this.canvas, true);
        this.camera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA;
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
        this.controleAccess.push(BABYLON.MeshBuilder.CreateBox("access1", this.scene));
        this.controleAccess.push(BABYLON.MeshBuilder.CreateBox("access2", this.scene));
        this.controleAccess.push(BABYLON.MeshBuilder.CreateBox("access3", this.scene));
        this.controleAccess.forEach(e => {
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

export {Engine}