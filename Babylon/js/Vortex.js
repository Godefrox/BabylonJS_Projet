
class Vortex {

    engine = null;

    constructor(engine){
        this.engine = engine;
    }


    /**
     <summary> : Allow to add vortex in mouse position in currently area
     */
    addVertex(){
        let me = this;
        this.engine.vector.y = 5;
        let area = this.engine.mapArea.get(this.engine.areaName);
        let path = null;
        let line = null;
        let polygon = null;
        let color = null;
        if(area == undefined){
            path = [
                this.engine.vector
            ]
            color = new BABYLON.Color3(Math.random(),Math.random(),Math.random());
            area = {path : path, line : line, polygon: polygon, color : color}
        }else{
            area.path.push(this.engine.vector);
            this.engine.edition.refreshArea(area);
        }
        this.engine.mapArea.set(this.engine.areaName,area);

    }

    /**
     <summary> : Allow to remove vortex in mouse position in currently area
     */
    removeVertex(){
        this.engine.vector.y = 5;
        let area = this.engine.mapArea.get(this.engine.areaName);
        if(area !== undefined){
            let path = area.path;
            if(path.length > 0){
                if(path.length >2){
                    let i = this.vortex.closestVortex(path);
                    path.splice(i,1);
                }else {
                    path = [];
                }
                area.path = path;
                this.engine.edition.refreshArea(area);
                this.engine.mapArea.set(this.engine.areaName,area);
            }
        }
    }

    /**
     <summary> : Allow to modify vortex in mouse position in currently area
     */
    modifyVertex(){
        let area = this.engine.mapArea.get(this.engine.areaName);
        if(area != undefined){
            let path = area.path;
            if(path.length > 0){
                if(path.length > 1){
                    console.log("CONNARD2");
                    this.engine.edition.selectAction("modify_move");
                }
            }
        }
    }

    /**
     * Allow the vortex to follow the mouse, we need to launch them with selector function
     */
    followVertex(){
        console.log("CONNARD3");
        let area = this.engine.mapArea.get(this.engine.areaName);
        if(area != undefined) {
            let path = area.path;
            let i = this.vortex.closestVortex(path);
            this.engine.vector.y = 5;
            path.splice(i, 1, this.engine.vector);
            area.path = path;
            this.engine.edition.refreshArea(area);
            this.engine.mapArea.set(this.engine.areaName,area);
        }
    }
    /**
     * detect the closest vortex with position of vector (Mouse position in 3D)
     * @param path
     * @returns {*}
     */
    closestVortex(path){
        let similar = path[0];
        let distance = Math.abs((this.engine.vector.x - similar.x)) + Math.abs((this.engine.vector.y - similar.y)) + Math.abs((this.engine.vector.z - similar.z));
        path.forEach(e => {
            let distanceB = Math.abs((this.engine.vector.x - e.x)) + Math.abs((this.engine.vector.y - e.y)) + Math.abs((this.engine.vector.z - e.z));

            if(distance > distanceB){
                distance = distanceB;
                similar = e;
            }
        });
        return path.indexOf(similar);
    }
}
export {Vortex};
