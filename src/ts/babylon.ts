import * as BABYLON from 'babylonjs';

class babylon_app {
    constructor() {
        var canvas = document.createElement("canvas");
        canvas.id = "renderCanvas";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        document.body.appendChild(canvas);

        var engine = new BABYLON.Engine(canvas,true);
        var scene = new BABYLON.Scene(engine);

        var camera: BABYLON.ArcRotateCamera = new BABYLON.ArcRotateCamera("Camera",Math.PI/2,Math.PI/2,2,BABYLON.Vector3.Zero(),scene);
        camera.attachControl(canvas,true);

        var light: BABYLON.HemisphericLight = new BABYLON.HemisphericLight("light",new BABYLON.Vector3(1,1,0),scene);

        var sphere: BABYLON.Mesh = BABYLON.MeshBuilder.CreateSphere("sphere",{diameter:1},scene);

        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}


export {babylon_app};

