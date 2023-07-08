import * as BABYLON from 'babylonjs';

class babylon_app {
    canvas: HTMLCanvasElement; 
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    camera: BABYLON.ArcRotateCamera; 
    light: BABYLON.HemisphericLight; 

    constructor() {
        this.canvas = document.createElement("canvas");
        this.canvas.id = "renderCanvas";
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        document.body.appendChild(this.canvas);
        
        this.engine = new BABYLON.Engine(this.canvas,true); 
        this.scene = new BABYLON.Scene(this.engine); 
        this.camera = new BABYLON.ArcRotateCamera("Camera",Math.PI/2,Math.PI/2,2,BABYLON.Vector3.Zero(),this.scene);
        this.camera.attachControl(this.canvas,true);
        this.light = new BABYLON.HemisphericLight("light",new BABYLON.Vector3(1,1,0),this.scene);

        var sphere: BABYLON.Mesh = BABYLON.MeshBuilder.CreateSphere("sphere",{diameter:1},this.scene);
    };

    // Doesn't like this
    // If you construct the engine before the canvas has been appended to the document,
    // it renders at super low resolution. 
    // Weird? 
    // appendCanvas():void {
    //     document.body.appendChild(this.canvas);
    // };

    runRenderLoop(): void {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    };

};


export {babylon_app};

