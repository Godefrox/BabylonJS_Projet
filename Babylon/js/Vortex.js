export default class Vortex {

    engine = null;

    constructor(engine) {
        this.engine = engine;
    }


    /**
     <summary> : Allow to add vortex in mouse position in currently area
     */
    addVertex() {
        this.engine.vector.y = Math.random() * 0.2;
        let area = this.engine.mapArea.get(this.engine.getAreaName());
        if(area !== undefined && area !== null){
        let Positions = null;
        let line = null;
        let polygon = null;
        let Color = null;
        if (area == undefined) {
            Positions = [
                this.engine.vector
            ]
            Color = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
            area = {Positions: Positions, line: line, polygon: polygon, Color: Color}
        } else {
            area.Positions.push(this.engine.vector);
            this.engine.edition.refreshArea(area);
        }
        this.engine.mapArea.set(this.engine.areaName, area);
        }
    }

    /**
     <summary> : Allow to remove vortex in mouse position in currently area
     */
    removeVertex() {
        this.engine.vector.y = 0.2;
        let area = this.engine.mapArea.get(this.engine.areaName);
        if (area !== undefined) {
            let Positions = area.Positions;
            if (Positions.length > 0) {
                if (Positions.length > 2) {
                    let i = this.engine.edition.vortex.closestVortex(Positions);
                    Positions.splice(i, 1);
                } else {
                    Positions = [];
                }
                area.Positions = Positions;
                this.engine.edition.refreshArea(area);
                this.engine.mapArea.set(this.engine.areaName, area);
            }
        }
    }

    /**
     <summary> : Allow to modify vortex in mouse position in currently area
     */
    modifyVertex() {
        let area = this.engine.mapArea.get(this.engine.areaName);
        if (area != undefined) {
            let Positions = area.Positions;
            if (Positions.length > 0) {
                if (Positions.length > 1) {
                    this.engine.edition.selectAction("modify_move");
                }
            }
        }
    }

    /**
     * Allow the vortex to follow the mouse, we need to launch them with selector function
     */
    followVertex() {
        let area = this.engine.mapArea.get(this.engine.areaName);
        if (area != undefined) {
            let Positions = area.Positions;
            let i = this.engine.edition.vortex.closestVortex(Positions);
            this.engine.vector.y = 0.2;
            Positions.splice(i, 1, this.engine.vector);
            area.Positions = Positions;
            this.engine.edition.refreshArea(area);
            this.engine.mapArea.set(this.engine.areaName, area);
        }
    }

    /**
     * detect the closest vortex with position of vector (Mouse position in 3D)
     * @param Positions
     * @returns {*}
     */
    closestVortex(Positions) {
        let similar = Positions[0];
        let distance = Math.abs((this.engine.vector.x - similar.x)) + Math.abs((this.engine.vector.y - similar.y)) + Math.abs((this.engine.vector.z - similar.z));
        Positions.forEach(e => {
            let distanceB = Math.abs((this.engine.vector.x - e.x)) + Math.abs((this.engine.vector.y - e.y)) + Math.abs((this.engine.vector.z - e.z));

            if (distance > distanceB) {
                distance = distanceB;
                similar = e;
            }
        });
        return Positions.indexOf(similar);
    }
}

