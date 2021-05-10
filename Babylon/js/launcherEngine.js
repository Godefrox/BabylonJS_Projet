import {Engine} from "./Engine";
let visualisation = new Engine();;

visualisation.createDefaultEngine = function () {
    return new BABYLON.Engine(visualisation.canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        disableWebGL2Support: false
    });
};

visualisation.initFunction = async function () {
    let asyncEngineCreation = async function () {
        try {
            return visualisation.createDefaultEngine();
        } catch (e) {
            return visualisation.createDefaultEngine();
        }
    }

    visualisation.engine = await asyncEngineCreation();
    if (! visualisation.engine) throw 'engine should not be null.';
    visualisation.scene = visualisation.defaultScene();
    visualisation.canvas.addEventListener('wheel', function (event){
        visualisation.zoom += event.deltaY * +0.01;
        // Restrict scale
        visualisation.zoom = Math.min(Math.max(visualisation.minZoom, visualisation.zoom), visualisation.maxZoom);
        visualisation.resizeCamera2D();
    });

};
visualisation.initFunction().then(() => {visualisation.sceneToRender = visualisation.scene
    visualisation.engine.runRenderLoop(function () {
        if (visualisation.sceneToRender && visualisation.sceneToRender.activeCamera) {
            visualisation.sceneToRender.render();
        }
    });
});

// Resize
window.addEventListener("resize", function () {
    visualisation.engine.resize();
});