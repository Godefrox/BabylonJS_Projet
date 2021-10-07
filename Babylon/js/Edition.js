import Vortex from "./Vortex.js"
import DragDrop from "./DragDrop.js"
import areas from "./areaPosition"
import areaPosition from "./areaPosition"; //Doit devenir un objet

export default class Edition {

    /**
     * All variables need for Edition Mod
     * Engine was the central, you can call all mod or subclass or get general variable
     */
    engine = null
    areas = new areaPosition();
    vortex = null
    functDown = null
    functMove = null
    shiftBoolean = false
    dragAndDrop = null
    earcut = null
    editionMod = ""

    /**
     * Create a Edition Mod with the central and personal earcut use on extrudePolygon
     * @param engine
     * @param earcut
     */
    constructor(engine, earcut) {
        this.engine = engine
        this.earcut = earcut
        this.vortex = new Vortex(engine)
        this.dragAndDrop = new DragDrop(engine)
    }

    /**
     * editMod allow to set function need to, add, remove, modify vortex. Two type of function, onPointerMove and
     * onPointerDown. And they Detect when mouse enter on visualisation to detect key press, like shift left.
     */
    editMod() {
        let littleEngine = this.engine
        let drag = this.dragAndDrop
        let me = this
        littleEngine.actualClass = this
        this.editionMod = ""

        //Allow to launch a function if pointer has click
        littleEngine.scene.onPointerDown = function (event, pickResult) {
            littleEngine.setVector(pickResult.pickedPoint)
            if (me !== undefined && me !== null && me.functDown !== undefined && me.functDown !== null) {
                me.functDown()
            }
        }

        //Allow to launch a function if pointer move.
        littleEngine.scene.onPointerMove = function (event, pickResult) {
            if (me.functMove != null) {
                if (!me.shiftBoolean) {
                    littleEngine.setVector(littleEngine.scene.pick(littleEngine.scene.pointerX, littleEngine.scene.pointerY).pickedPoint)
                }
                me.functMove()
            }
        }

        document.getElementById("renderCanvas").addEventListener("mouseenter", function () {
            document.onkeydown = function (key) {
                switch (key.code) {
                    case "ShiftLeft":
                        if (littleEngine.clone != null) {
                            if (!me.shiftBoolean) {
                                littleEngine.setCameraType("dragDropShift")
                                drag.followObject()
                            }
                            me.shiftBoolean = true
                        }
                        break
                    default :
                        break
                }
            }
            document.onkeyup = function (key) {
                switch (key.code) {
                    case "ShiftLeft":
                        me.shiftBoolean = false
                        littleEngine.oldPointer = null
                        littleEngine.setCameraType("edition")
                        break
                    default :
                        break
                }
            }

        })
        document.getElementById("renderCanvas").addEventListener("mouseleave", function () {
            document.onkeyup = null
            document.onkeydown = null
        })
    }

    /**
     * Allow to set color of actual Area, use when you select color on color picker.
     * @param e => element of color defined in colorPicker
     */
    setColor(e) {
        let color = e.rgba
        color = new BABYLON.Color3(color.r / 255, color.g / 255, color.b / 255)
        if (this.editionMod === "area") {
            let areaName = this.engine.getAreaName()
            if (areaName !== "") {
                let area = this.engine.getMapArea().get(areaName)
                if (area !== undefined && area != null) {
                    area.Color = color
                    this.refreshArea(area)
                    this.engine.getMapArea().set(areaName, area)
                }
            }

        } else if (this.editionMod === "access") {
            if (this.engine.clone !== undefined && this.engine.clone !== null) {
                this.engine.clone.material.diffuseColor = color
            } else {
                let name = this.engine.getAccessName()
                let node = this.engine.scene.getNodeByName(name)
                node.material.diffuseColor = color
            }
        }
    }

    /**
     * When you change your mod, it necessary to take of all your function dynamic.
     * In edition we need to take off the function Down and the function Move.
     */
    stopAction() {
        //Allow to launch a function if pointer has click
        this.engine.scene.onPointerDown = null
        this.functDown = null
        //Allow to launch a function if pointer move.
        this.engine.scene.onPointerMove = null
        this.functMove = null
        //Destroy Clone, if it necessary
        if(this.engine.clone !== undefined && this.engine.clone !== null){
            this.engine.clone.dispose()
            this.engine.clone = null
        }
    }

    /**
     <summary> : Allow to refresh the renderer of one area
     <param> : area is what you want to modify in visualisation
     <returns> area was modify at the end of code, so you need to modify him in the map.
     <example> :
     {
     {some modify in area}
     refreshArea(area)
     mapArea.set(areaName,area)
     }
     */
    refreshArea(area) {
        if (area.Positions.length >= 2) {

            if (area.polygon !== undefined && area.polygon !== null) {
                area.polygon.dispose()
            }
            if (area.Positions.length >= 3) {
                area.polygon = BABYLON.MeshBuilder.ExtrudePolygon("polygon", {
                    shape: area.Positions,
                    depth: 5
                }, this.engine.scene, this.earcut)

                area.polygon.position.y = 5.2
                area.polygon.material = new BABYLON.StandardMaterial("red", this.engine.scene)
                area.polygon.material.alpha = 0.6
                if (area.Color === undefined || area.Color === null) {
                    area.Color = new BABYLON.Color3(Math.random(), Math.random(), Math.random())
                }
                area.polygon.material.diffuseColor = area.Color
                area.polygon.material.backFaceCulling = false
            }
        }
        let saveArea = {
            ID: area.ID,
            EstablishmentID: area.EstablishmentID,
            AreaID: area.AreaID,
            Name: area.Label,
            EstablishmentName: area.EstablishmentName,
            AreaName: area.AreaName,
            Label: area.Label,
            Positions: [],
            Color: area.Color
        }
        saveArea.Positions = []
        let position = null
        if (area.Positions.length === 0) {
            console.log("need suppress to data base")
        }
        area.Positions.forEach(e => {
            position = {X: e.x, Y: e.y, Z: e.z}
            saveArea.Positions.push(position)
        })
        delete saveArea.polygon
        this.areas.updateAreaPosition(saveArea)
    }

    /**
     * allow to synchronize the function you want to launch with pointer and in general case
     * @param action
     */
    selectAction(action) {
        let me = this
        let mod = 0
        switch (action) {
            case "addVertex" :
                this.editionMod = "area"
                me.functDown = me.vortex.addVertex
                mod = 1
                break
            case "removeVertex" :
                this.editionMod = "area"
                me.functDown = me.vortex.removeVertex
                mod = 1
                break
            case "modifyVertex" :
                this.editionMod = "area"
                me.functDown = me.vortex.modifyVertex
                mod = 1
                break
            case "modify_move" :
                this.functDown = function () {
                    me.functDown = me.vortex.modifyVertex
                    me.functMove = null
                }
                me.functMove = me.vortex.followVertex
                break
            case "dragDrop" :
                this.editionMod = "access"
                me.dragAndDrop.dragAndDropScene(me.engine.getAccessName())
                mod = 2
                break
            case "followObject" :
                me.functMove = me.dragAndDrop.followObject
                me.functDown = function () {
                    me.functMove = null
                    me.functDown = null
                    me.engine.clone = null
                }
                break
            default :
                console.log("Action defines : Incorrect " + action)
                break
        }
    }


}
