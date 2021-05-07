class Interface{
    advancedTexture = null;
    engine = null;
    
    constructor(myEngine){
        this.advancedTexture = new BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.engine = myEngine;
    }

    setButton(nom,message,horizontalAlignment,verticalAlignment,x,y,radius,outlineColor,backgroundColor,action){
        let button = BABYLON.GUI.Button.CreateSimpleButton(nom, message);
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
        this.advancedTexture.addControl(button);
        return button;
    }

    /**
     <summary> : Allow to  made new button with the same model of one element in interface
     */
    setButtonWithInterface(el_Interface,nom,message,x,y,action){
        let button2 = BABYLON.GUI.Button.CreateSimpleButton(nom, message);
        button2.width = el_Interface.width;
        button2.height = el_Interface.height;
        button2.horizontalAlignment = el_Interface.horizontalAlignment;
        button2.verticalAlignment = el_Interface.verticalAlignment;
        if(y !== 0 ){
            button2.top = el_Interface.topInPixels + el_Interface.heightInPixels/2 + button2.heightInPixels/2 + y;
        }else{
            button2.top = el_Interface.topInPixels;
        }
        if(x !== 0 ){
            button2.left = el_Interface.leftInPixels + el_Interface.widthInPixels/2 + button2.widthInPixels/2 + x;
        }else{
            button2.left = el_Interface.leftInPixels;
        }

        button2.color = el_Interface.color;
        button2.cornerRadius = el_Interface.cornerRadius;
        button2.background = el_Interface.background;
        button2.onPointerUpObservable.add(action);
        this.advancedTexture.addControl(button2);
        return button2;
    }

    /**
     <summary> : Allow to  made new Text Area with the same model of one element in interface
     */
    setTextAreaWithInterface(el_Interface,messageDefault,x,y){
        let textInput = new BABYLON.GUI.InputText("areaNumber");
        textInput.width = "100px";
        textInput.maxWidth = "100px";
        textInput.height = "40px";
        textInput.horizontalAlignment = el_Interface.horizontalAlignment;
        textInput.verticalAlignment = el_Interface.verticalAlignment;
        if(y !== 0 ){
            textInput.top = el_Interface.topInPixels + el_Interface.heightInPixels/2 + textInput.heightInPixels/2 + y;
        }else{
            textInput.top = el_Interface.topInPixels;
        }

        if(x !== 0 ){
            textInput.left = el_Interface.leftInPixels + el_Interface.widthInPixels/2 + textInput.widthInPixels/2 + x;
        }else{
            textInput.left = el_Interface.leftInPixels;
        }

        textInput.text = messageDefault;
        textInput.color = el_Interface.color;
        textInput.background = el_Interface.background;
        this.advancedTexture.addControl(textInput);
        return textInput;
    }
    /**
     <summary> : Allow to  made new Pickera with the same model of one element in interface
     */
    setPickerWithInterface(el_Interface,x,y,action){
        let picker = new BABYLON.GUI.ColorPicker();
        let area = this.engine.mapArea.get(this.engine.getAreaName());
        if(area !== undefined){
            picker.value = area.color;
        }else{
            picker.value = new BABYLON.Color3(0,0,0);
        }
        picker.height = "100px";
        picker.width = "100px";
        picker.horizontalAlignment = el_Interface.horizontalAlignment;
        picker.verticalAlignment = el_Interface.verticalAlignment;
        if(y !== 0 ){
            //EN THEORIE
            //picker.top = interface.topInPixels + interface.heightInPixels/2 + picker.heightInPixels/2 + y ;
            // EN PRATIQUE
            picker.top = el_Interface.topInPixels + picker.heightInPixels/2;
        }else{
            picker.top = el_Interface.topInPixels;
        }
        if(x !== 0 ){
            picker.left = el_Interface.leftInPixels + picture.widthInPixels/2 + picker.widthInPixels/2 + x;
        }else{
            picker.left = el_Interface.leftInPixels;
        }
        picker.color = "white";
        picker.background = "green";

        picker.onValueChangedObservable.add(action);

        this.advancedTexture.addControl(picker);
        return picker;
    }
    getAdvancedTexture(){
        return this.advancedTexture;
    }
}
export {Interface};
