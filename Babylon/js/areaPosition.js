
export default class areaPosition {

    Areas = [];
    updateAreaPosition(newArea){
        let length = this.Areas.length;
        let add = true;
        for(let i =0; i<length;i++){
            if(newArea.ID === this.Areas[i].ID){
                this.Areas[i] = newArea;
                add = false;
            }
        }
        if(add){
            this.Areas.push(newArea)
        }
    }
}