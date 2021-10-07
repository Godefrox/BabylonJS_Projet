/**
 @Author : Godefroy MONTONATI
 @Module : Visualisation 3D
 */

import Edition from "./Edition.js";
import Simulation from "./Simulation.js";

export default class Engine {
    /**
     * Engine represent the brain of project. They store the global variables and allow the clients to take it.
     * It allow the client to get other client and use they method. Also, all clients need to know the brain/server.
     */

    /**
     All variables create specific to Babylon JS
     */
    canvas = document.getElementById("renderCanvas");
    engine = null;
    scene = null;
    sceneToRender = null;
    camera = null;

    /**
     All variables need on the project in global.
     */
    core = null;
    edition = null;
    simulation = null;
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
    AccessControl = [];
    earcut = null;
    actualClass = null;
    cameraType = "normal";
    cameraOldType = "normal";
    center = null


    constructor(core, earcut) {
        this.core = core
        this.earcut = earcut;
    }

    /**
     * Allow to get AreaName of actual area
     * @returns {null,areaName}
     */
    getAreaName() {
        return this.areaName;
    }

    /**
     * Allow to get AccesName of actual acces you want to drag on the scene
     * @returns {null}
     */
    getAccessName() {
        return this.accessName;
    }

    /**
     * Allow to get the MapArea they contains all Area in the scene, we need to synchronyse with MongoDB
     * @returns {Map<any, any>}
     */
    getMapArea() {
        return this.mapArea;
    }

    /**
     * set the current Area you want to modify
     * @param newAreaName
     */
    setAreaName(newAreaName) {
        if (typeof newAreaName === 'string') {
            this.edition.editionMod = "area"
            this.areaName = newAreaName;
            document.getElementById("textAreaInput").label = newAreaName;
        }
    }

    /**
     * set the current Acces you want to modify
     * @param newAccessName
     */
    setAccessName(newAccessName) {
        if (typeof newAccessName === 'string') {
            this.edition.editionMod = "access"
            this.accessName = newAccessName;
            document.getElementById("textAccessInput").value = newAccessName;
        }
    }

    /**
     * set the type of camera
     * List of type :
     * edition - All edition Mode
     * normal - Allow to move on the scene
     * dragDropShift - Set the height of clone, need to defined the clone before
     * simulation - Pass on simulation mod and see your data in real time
     * @param cameraType string only
     */
    setCameraType(cameraType) {
        if (typeof cameraType === "string") {
            this.cameraOldType = this.cameraType.slice()
            this.cameraType = cameraType
            this.setCameraMod()
        }
    }

    /**
     * Allow to get list of Access
     * @returns {*[]}
     */
    getAccessControl() {
        return this.AccessControl;
    }

    /**
     * resizeCamera to have the best point of view on mod you want
     */
    resizeCamera() {
        if (this.camera !== undefined && this.camera !== null) {
            this.ratio = this.canvas.width / this.canvas.height;
            this.width = this.zoom * this.ratio;
            this.camera.orthoTop = this.zoom;
            this.camera.orthoLeft = -this.width;
            this.camera.orthoRight = this.width;
            this.camera.orthoBottom = -this.zoom;
        }
    }

    /**
     * Allow to modify the actual Camera on mod choosed. To change the mod of camera, we need to call setCameraType(/!\ only string)
     */
    setCameraMod() {
        if (this.camera !== undefined && this.camera !== null) {

            switch (this.cameraType) {
                case "edition" :
                    this.stopAction()
                    this.actualClass = this.edition;
                    this.setCameraEdition();
                    break;
                case "normal" :
                    this.stopAction()
                    this.actualClass = null;
                    this.setCameraNormal();
                    break;
                case "dragDropShift" :
                    this.actualClass = this.edition;
                    this.setCameraDragDrop();
                    break;
                case "simulation" :
                    this.stopAction()
                    this.actualClass = this.simulation;
                    this.setCameraSimulation();
                    break;
                default :
                    this.stopAction()
                    this.actualClass = null;
                    console.log("type of camera not initialize : " + this.cameraType)
                    break;
            }
            this.resizeCamera();
        }
    }

    /**
     * Stop all action of actualClass, by-pass problem
     */
    stopAction() {
        if (this.actualClass !== undefined && this.actualClass !== null) {
            if (this.actualClass.stopAction !== undefined && this.actualClass.stopAction !== null) {
                this.actualClass.stopAction();
            }
        }
    }

    /**
     * When you use this function, the camera of the engine pass on Edition Mod, so you can place area or acces in scene.
     * If you want to leave the mod you need to launch setCameraNormal
     * And if you want to resize camera Launch resizeCamera2D
     */
    setCameraEdition() {
        let bool = true;
        this.edition.editMod();
        if (this.camera !== undefined && this.camera !== null) {
            if (this.cameraOldType === "simulation") {
                this.camera.dispose();
            } else {
                bool = false;
                this.camera.detachControl();
            }
        }

        if (bool) {
            this.camera = new BABYLON.FreeCamera("cameraNormal", new BABYLON.Vector3(76, 120, 9), this.scene);
            this.camera.setTarget(BABYLON.Vector3.Zero());
        }
        //Camera on 2D projection in 3D environement
        this.camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
        //Set position of camera
        this.camera.position = new BABYLON.Vector3(76, 120, 9);
        //Set rotation to 0
        this.camera.rotation = new BABYLON.Vector3(0, 0, 0);
        //Set rotation to x = 180 necessary if you want to bypass the black screen
        this.camera.cameraRotation = new BABYLON.Vector3(180, 0, 0);
    }

    /**
     * When you use this function, the camera of the engine pass on Normal Mod, so you can't place area or acces in scene.
     * If you want to change the mod you need to launch setCameraEdition or other camera Mod
     * And if you want to resize camera Launch resizeCamera2D
     */
    setCameraNormal() {
        let bool = true;
        if (this.camera !== undefined && this.camera !== null) {
            if (this.cameraOldType === "simulation") {
                this.camera.dispose();

            } else {
                bool = false;
            }
        }
        if (bool) {
            this.camera = new BABYLON.FreeCamera("cameraNormal", new BABYLON.Vector3(76, 120, 9), this.scene);
            this.camera.setTarget(BABYLON.Vector3.Zero());
        }
        this.camera.attachControl(this.canvas, true);
        this.camera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA;
    }

    /**
     * Set the camera on Drag and Drop, the function verify if camera exits and was not cameraSimulation
     */
    setCameraDragDrop() {
        let bool = true;
        if (this.camera !== undefined && this.camera !== null) {
            if (this.cameraOldType === 'simulation') {
                this.camera.dispose();
            } else {
                bool = false;
            }
        }
        if (bool) {
            this.camera = new BABYLON.FreeCamera("cameraNormal", new BABYLON.Vector3(76, 120, 9), this.scene);
            this.camera.setTarget(BABYLON.Vector3.Zero());
        }

        this.camera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA
        this.camera.attachControl(this.canvas, true);
        this.camera.position = new BABYLON.Vector3(this.clone.position.x, this.clone.position.y, this.clone.position.z);
        this.zoom = 40;
        this.clone.position = this.vector;
        this.camera.position.x -= 10;
        this.camera.position.z -= 10
    }

    /**
     * Set the camera on Simulation mod, the function verify if camera exits and was not cameraSimulation
     */
    setCameraSimulation() {
        let bool = true;
        if (this.camera !== undefined && this.camera !== null) {
            if (this.cameraOldType !== 'cameraSimulation') {
                this.camera.dispose();
            } else {
                bool = false;
            }
        }
        let miniSecond = 10000;
        const degree = 360;

        if (bool) {
            let me = this;
            me.camera = new BABYLON.ArcRotateCamera("cameraSimulation", 0, 0.56, 120, new BABYLON.Vector3(76, 0, 9), this.scene);
            let func = function () {
                setTimeout(function () {
                    me.camera.alpha += (1 / 180);

                    if (me.cameraType === "simulation") {
                        func();
                    }
                }, miniSecond / degree)
            }
            func();
        }
    }

    /**
     * set the current vector of mouse in 3D scene
     * @param newVector
     */
    setVector(newVector) {
        this.vector = newVector;
    }

    /**
     * get the current position of mouse in 3D scene
     * @returns {null}
     */
    getVector() {
        return this.vector;
    }

    /**
     * Allow to set the color of actual object on the actual Class. If you have more than edition in future, you need to
     * use setColor to by pass some problem. Example of Adapter pattern without interface
     * @param e
     */
    setColor(e) {
        if (this.actualClass !== null && this.actualClass !== undefined) {
            if (this.actualClass.setColor !== undefined && this.actualClass.setColor !== null) {
                this.actualClass.setColor(e);
            }
        }
    }

    /**
     * Allow to set the actual Action in Edition. Change to add, modify or remove vortex. And also you can drag and drop
     * Models or adjust the height
     * @param action
     */
    setAction(action) {
        if (this.edition !== undefined && this.edition !== null) {
            this.edition.selectAction(action);
        }
    }

    /**
     * Launch the simulation, with core object => JS object of Vue page
     * @param core
     * @param mapData
     * @param dates
     * @param tabDate
     */
    launchSimulation(core, mapData, dates, tabDate) {
        if (this.simulation !== undefined && this.simulation !== null) {
            this.simulation.launchSimulation(core, mapData, dates, tabDate)
        } else {
            console.log("Simulation was not defined")
        }
    }

    /**
     * Allow to set à specific time in the timeLine
     * @param tabDate
     * @param startDate
     * @param lastDate
     * @param mapData
     */
    simulationSet(tabDate, startDate, lastDate, mapData, index) {
        if (this.simulation != undefined && this.simulation != null) {
            this.simulation.simulationSet(tabDate, startDate, lastDate, mapData, index)
        }
    }

    /**
     * Change the clone you want to modify in edition mod
     * @param clone
     */
    setClone(clone) {
        this.clone = clone
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
                    material.freeze();
                });
            }
        });
        // Camera
        this.camera = new BABYLON.FreeCamera("cameraNormal", new BABYLON.Vector3(76, 120, 9), this.scene);

        this.camera.setTarget(BABYLON.Vector3.Zero());
        // This attaches the camera to the canvas
        this.camera.attachControl(this.canvas, true);
        const light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(5, 10, 0), this.scene);

        // EDITION
        this.edition = new Edition(this, this.earcut);
        // SIMULATION
        this.simulation = new Simulation(this);
        // EXEMPLE OF ACCESS
        this.AccessControl.push(BABYLON.MeshBuilder.CreateBox("access1", this.scene));
        this.AccessControl.push(BABYLON.MeshBuilder.CreateBox("access2", this.scene));
        this.AccessControl.push(BABYLON.MeshBuilder.CreateBox("access3", this.scene));
        this.AccessControl.forEach(e => {
            e.isVisible = false;
            e.material = new BABYLON.StandardMaterial((e.name + "_material"), this.scene);
            e.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        })
        let options = new BABYLON.SceneOptimizerOptions();
        options.addOptimization(new BABYLON.HardwareScalingOptimization(0, 1));

        // Optimizer
        let optimizer = new BABYLON.SceneOptimizer(this.scene, options);
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
