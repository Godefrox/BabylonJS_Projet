class Interface{
    advancedTexture = null;
    engine = null;
    
    constructor(myEngine){
        this.advancedTexture = new BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.engine = myEngine;
    }

    /**
     <summary> : Allow to  made new model of button
     */
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
            button2.left = el_Interface.leftInPixels + el_Interface.widthInPixels + x;
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
     * Set all buttons we need to choose for area you want to modify
     * @param el_Interface
     */
    setArreaButton(el_Interface){
        let map = this.engine.getMapArea();
        let iteratorKeys = map.keys();
        let i = 0;
        let boutonsArea = [];
        let button = null;
        //BOUTON LEFT
        let res = iteratorKeys.next();
        console.log("INTERFACE");
        let lastLeft = el_Interface.leftInPixels;
        let lastWidth = el_Interface.widthInPixels;
        console.log("lastLeft :" + lastLeft);
        console.log("lastWidth :" + lastWidth);
        let lastHorizontalAlignment = el_Interface.horizontalAlignment;
        let lastVerticalAlignment = el_Interface.verticalAlignment;
        while(!res.done){
            button = BABYLON.GUI.Button.CreateSimpleButton(res.value, res.value);
            button.width = ((30 + (res.value.length*10)) + "px");
            console.log((30 + res.value.length*5) );
            console.log((30 + res.value.length)+ "px" );
            button.height = el_Interface.height;
            console.log(button.height);
            button.horizontalAlignment = lastHorizontalAlignment;
            button.verticalAlignment = lastVerticalAlignment;
            button.top = el_Interface.topInPixels;
            console.log(lastLeft);
            console.log(lastWidth/2);
            console.log(button.widthInPixels/2);
            button.left =  lastLeft + lastWidth;
            lastWidth = button.widthInPixels;
            lastLeft = button.leftInPixels;
            console.log(lastLeft)
            console.log(button.left);
            button.color = el_Interface.color;
            button.cornerRadius = el_Interface.cornerRadius;
            button.background = el_Interface.background;
            button.onPointerUpObservable.add(console.log(res.value));
            this.advancedTexture.addControl(button);
            boutonsArea.push(button);
            res = iteratorKeys.next();
            i++;
        }

        //BOUTON RIGHT
        //BOUTTON ADD
        //ACTION ADD
        //TEXT AREA
        //END ACTION ADD

        console.log("Not Yet Implemented " + "COMMENTAIRE : UTILISER LE SYSTEME DE GRILLE PERMETANT AINSI D'AFFICHER" +
            " UNE MULTITUDE DE NOM DE ZONE AU SEIN DE L'AFFICHAGE EN FONCTION DU NOMBRE DE ZONE FAIRE UNE CALCUL DE" +
            " COLONNE ET LIGNE NECESSAIRE");
        //Afficher une multitude de bouton sur la droite du sélecteur
    }

    /**
     * Set all buttons we need to choose for acces you want to modify
     * @param el_Interface
     */
    setAccessButton(el_Interface){
        console.log("Not Yet Implemented");
        //Afficher une multitude de bouton sur la droite du sélecteur
    }

    /**
     <summary> : Allow to  made new Text Area with the same model of one element in interface
     */
    setTextAreaWithInterface(el_Interface,name,messageDefault,x,y){
        let textInput = new BABYLON.GUI.InputText(name);
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
            textInput.left = el_Interface.leftInPixels + el_Interface.widthInPixels + x;
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
            picker.left = el_Interface.leftInPixels + el_Interface.widthInPixels + x;
        }else{
            picker.left = el_Interface.leftInPixels;
        }
        picker.color = "white";
        picker.background = "green";

        picker.onValueChangedObservable.add(action);

        this.advancedTexture.addControl(picker);
        return picker;
    }

    /**
     * get advanced texture, if you want to add some interface or get without interface class
     * @returns {null}
     */
    getAdvancedTexture(){
        return this.advancedTexture;
    }
}
export {Interface};
