export default class DragDrop {
    engine = null;

    constructor(engine) {
        this.engine = engine;
    }

    /**
     * Allow to place a object with the name of him. We need to place a first object in invisible on the scene
     * @param name
     */
    dragAndDropScene(name) {
        let node = this.engine.scene.getNodeByName(name);
        if (node != undefined) {
            let i = 1;
            let nameClone = name + "_";
            while (this.engine.scene.getNodeByName((nameClone + i) !== undefined)) {
                i++;
            }
            let node2 = new BABYLON.Node(nameClone, this.engine.scene);
            this.engine.setClone(node.clone(nameClone + "_clone", node2));
            this.engine.clone.isVisible = true;
            this.engine.boundingBox = this.engine.clone.getBoundingInfo().boundingBox;
            this.engine.center = this.engine.boundingBox.center;
            this.engine.extendSize = this.engine.boundingBox.center;
            this.engine.edition.selectAction("followObject");
        }
    }

    /**
     * Allow the object to follow the mouse position in 3D world
     */
    followObject() {
        if (this.engine.edition.shiftBoolean) {
            this.engine.camera.target = this.engine.clone.position;
            if (this.engine.oldPointer != null) {
                this.engine.vector.x = this.engine.clone.position.x;
                this.engine.vector.z = this.engine.clone.position.z;
                this.engine.vector.y = this.engine.clone.position.y
                if (this.engine.oldPointer.y > this.engine.scene.pointerY) {
                    this.engine.vector.y += 0.1;
                } else {
                    this.engine.vector.y -= 0.1;
                }
            }
            this.engine.oldPointer = new BABYLON.Vector2(this.engine.scene.pointerX, this.engine.scene.pointerY);
        } else {
            let pickResult = this.engine.scene.pick(this.engine.scene.pointerX, this.engine.scene.pointerY);
            this.engine.vector = pickResult.pickedPoint;
            this.engine.vector.x -= this.engine.center.x;
            this.engine.vector.z -= this.engine.center.z;
            this.engine.vector.y = this.engine.clone.scaling.y / 2 + 0.01;
        }
        this.engine.clone.position = this.engine.vector;
    }


}
