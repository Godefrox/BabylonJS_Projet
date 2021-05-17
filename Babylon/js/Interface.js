class Interface {
    advancedTexture = null;
    engine = null;
    uiNotEssential = [];

    constructor(myEngine) {
        this.advancedTexture = new BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.engine = myEngine;
    }

    /**
     <summary> : Allow to  made new model of button
     */
    setButton(nom, message, horizontalAlignment, verticalAlignment, x, y, radius, outlineColor, backgroundColor, action) {
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
    setButtonWithInterface(el_Interface, nom, message, x, y, action) {
        let button2 = BABYLON.GUI.Button.CreateSimpleButton(nom, message);
        button2.width = el_Interface.width;
        button2.height = el_Interface.height;
        button2.horizontalAlignment = el_Interface.horizontalAlignment;
        button2.verticalAlignment = el_Interface.verticalAlignment;
        if (y !== 0) {
            button2.top = el_Interface.topInPixels + el_Interface.heightInPixels / 2 + button2.heightInPixels / 2 + y;
        } else {
            button2.top = el_Interface.topInPixels;
        }
        if (x !== 0) {
            button2.left = el_Interface.leftInPixels + el_Interface.widthInPixels + x;
        } else {
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

    setArreaButton(el_Interface) {
        let map = this.engine.getMapArea();
        let iteratorKeys = map.keys();
        let res = iteratorKeys.next();
        let tab = [];
        let tabSecondary = [];
        let oldLength = 0;
        let arrayUi = [];
        let advancedTexture = this.advancedTexture;
        let littleEngine = this.engine;
        let nouvelleZoneTexte = new BABYLON.GUI.InputText("textZoneArrea");
        nouvelleZoneTexte.width = 0.15;
        nouvelleZoneTexte.height = "50px";
        nouvelleZoneTexte.text = el_Interface.textBlock.text;
        nouvelleZoneTexte.color = el_Interface.color;
        nouvelleZoneTexte.background = el_Interface.background;
        advancedTexture.addControl(nouvelleZoneTexte);
        let lastInterface = nouvelleZoneTexte;
        while (!res.done) {
            tab.push(res.value);
            tabSecondary.push(res.value);
            res = iteratorKeys.next();
        }
        let functNewButton = function (el_Interface_Position, name) {
            let button2 = BABYLON.GUI.Button.CreateSimpleButton(name, name);
            button2.width = 0.1;
            button2.height = el_Interface_Position.height;
            button2.top = el_Interface_Position.topInPixels + el_Interface_Position.heightInPixels / 2 + button2.heightInPixels / 2;
            button2.left = el_Interface_Position.leftInPixels;
            button2.color = el_Interface_Position.color;
            button2.background = el_Interface_Position.background;
            if (name !== "+") {
                button2.onPointerUpObservable.add(function () {
                    el_Interface.textBlock.text = name;
                    advancedTexture.removeControl(nouvelleZoneTexte);
                    arrayUi.forEach(e => advancedTexture.removeControl(e));
                    littleEngine.setAreaName(name);
                });
            } else {
                button2.onPointerUpObservable.add(function () {
                    el_Interface.textBlock.text = nouvelleZoneTexte.text;
                    oldLength = nouvelleZoneTexte.length;
                    advancedTexture.removeControl(nouvelleZoneTexte);
                    arrayUi.forEach(e => advancedTexture.removeControl(e));
                    littleEngine.setAreaName(nouvelleZoneTexte.text);
                });
            }
            advancedTexture.addControl(button2);
            return button2;
        }
        if (tab.length === tabSecondary.length) {
            nouvelleZoneTexte.onTextChangedObservable.add(function (event) {
                let already = null;
                let textAlready = null;
                tab.forEach(e => { if(e === nouvelleZoneTexte.text){
                    already = functNewButton(lastInterface, e);
                    textAlready = already.textBlock.text;
                    lastInterface = already;
                }});
                if (nouvelleZoneTexte.text.length < oldLength && nouvelleZoneTexte.text.length !== 0) {
                    tabSecondary = [];
                    arrayUi.forEach(e => advancedTexture.removeControl(e));
                    arrayUi = [];
                    if(already != null){
                        tabSecondary.push(textAlready);
                        arrayUi.push(already);
                    }
                    tab.forEach(e => {
                        if (e !== nouvelleZoneTexte.text && e.includes(nouvelleZoneTexte.text)) {
                            tabSecondary.push(e);

                            if (tabSecondary.length <= 5) {
                                let b = functNewButton(lastInterface, e);
                                arrayUi.push(b);
                                lastInterface = b;
                            }
                        }
                    });
                    oldLength = nouvelleZoneTexte.text.length;
                } else if (nouvelleZoneTexte.text.length > oldLength) {
                    let otherTab = [];
                    arrayUi.forEach(e => advancedTexture.removeControl(e));
                    arrayUi = [];
                    if(already != null){
                        otherTab.push(textAlready);
                        arrayUi.push(already);
                    }
                    tabSecondary.forEach(e => {
                        if (e !== nouvelleZoneTexte.text && e.includes(nouvelleZoneTexte.text)) {
                            otherTab.push(e);

                            if (otherTab.length <= 5) {
                                let b = functNewButton(lastInterface, e);
                                arrayUi.push(b);
                                lastInterface = b;
                            }

                        }
                    });
                    tabSecondary = otherTab;
                    oldLength = nouvelleZoneTexte.text.length;
                } else {
                    arrayUi.forEach(e => advancedTexture.removeControl(e));
                    arrayUi = [];
                    tabSecondary = [];
                    tab.forEach(e => tabSecondary.push(e));
                    oldLength = 0;
                }
                if (already === null && nouvelleZoneTexte.text.length > 0) {
                    arrayUi.push(functNewButton(lastInterface, "+"));
                    nouvelleZoneTexte.uis = arrayUi;
                }
                lastInterface = nouvelleZoneTexte;
            });
        }

        nouvelleZoneTexte.uis = arrayUi;
        this.uiNotEssential.push(nouvelleZoneTexte);
    }

    cleanUi() {
        this.uiNotEssential.forEach(e => {
            if (e.uis !== undefined && e.uis != null) {
                e.uis.forEach(e => this.advancedTexture.removeControl(e));
            }
            this.advancedTexture.removeControl(e)
        });
        this.uiNotEssential = [];
    }

    /**
     * Set all buttons we need to choose for acces you want to modify
     * @param el_Interface
     */
    setAccessButton(el_Interface) {
        console.log("Not Yet Implemented");
        //Afficher une multitude de bouton sur la droite du sélecteur
    }

    /**
     <summary> : Allow to  made new Text Area with the same model of one element in interface
     */
    setTextAreaWithInterface(el_Interface, name, messageDefault, x, y) {
        let textInput = new BABYLON.GUI.InputText(name);
        textInput.width = "100px";
        textInput.maxWidth = "100px";
        textInput.height = "40px";
        textInput.horizontalAlignment = el_Interface.horizontalAlignment;
        textInput.verticalAlignment = el_Interface.verticalAlignment;
        if (y !== 0) {
            textInput.top = el_Interface.topInPixels + el_Interface.heightInPixels / 2 + textInput.heightInPixels / 2 + y;
        } else {
            textInput.top = el_Interface.topInPixels;
        }

        if (x !== 0) {
            textInput.left = el_Interface.leftInPixels + el_Interface.widthInPixels + x;
        } else {
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
    setPickerWithInterface(el_Interface, x, y, action) {
        let picker = new BABYLON.GUI.ColorPicker();
        let area = this.engine.mapArea.get(this.engine.getAreaName());
        if (area !== undefined) {
            picker.value = area.color;
        } else {
            picker.value = new BABYLON.Color3(0, 0, 0);
        }
        picker.height = "100px";
        picker.width = "100px";
        picker.horizontalAlignment = el_Interface.horizontalAlignment;
        picker.verticalAlignment = el_Interface.verticalAlignment;
        if (y !== 0) {
            //EN THEORIE
            //picker.top = interface.topInPixels + interface.heightInPixels/2 + picker.heightInPixels/2 + y ;
            // EN PRATIQUE
            picker.top = el_Interface.topInPixels + picker.heightInPixels / 2;
        } else {
            picker.top = el_Interface.topInPixels;
        }
        if (x !== 0) {
            picker.left = el_Interface.leftInPixels + el_Interface.widthInPixels + x;
        } else {
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
    getAdvancedTexture() {
        return this.advancedTexture;
    }
}

export {Interface};
