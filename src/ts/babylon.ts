
// Okay the Babylon import situation is just plain weird and I kind of can't make sense of it. 
// Current workaround is just "import * as BABYLON from 'babylonjs'" in everything that references babylon ("const BABYLON = require('babylonjs')" also works, which probably hints at the problem, but I still don't understand)
// interesting: https://forum.babylonjs.com/t/ts2345-argument-of-type-import-babylonjs-scene-scene-is-not-assignable-to-parameter-of-type-babylon-scene/1308/6
// import * as Babylon from 'babylonjs';
import * as BABYLON from 'babylonjs';
// const BABYLON = require('babylonjs');

function delay(ms:number):Promise<void> {                        
    return new Promise(resolve => setTimeout(() => resolve(),ms));
};

import { TransformLine, CustomPlane, Axes } from './babylon_objects';

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
        this.scene.useRightHandedSystem = true; 
        this.camera = new BABYLON.ArcRotateCamera("Camera",Math.PI/2,Math.PI/2,2,BABYLON.Vector3.Zero(),this.scene);
        this.camera.attachControl(this.canvas,true);
        this.camera.wheelPrecision = 100; 
        this.light = new BABYLON.HemisphericLight("light",new BABYLON.Vector3(1,1,0),this.scene);

        //////////////// Stuff ////////////////
        var RX = BABYLON.Matrix.RotationAxis(BABYLON.Axis.X, Math.PI/2);
        var RY = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, Math.PI/4);
        var RZ = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Z, Math.PI/4);

        const ground = new CustomPlane('ground',{'size':2,'sideOrientation':BABYLON.Mesh.DOUBLESIDE},this.scene);
        ground.MatrixTransformMeshAssembly(RX);         

        const world_axes = new Axes('world_axes',this.scene); 

        RX = BABYLON.Matrix.RotationAxis(BABYLON.Axis.X, Math.PI/4);
        const T = BABYLON.Matrix.Translation(-1,1,1);
        const transform_line = new TransformLine('test_line',{Axis:'Y'},this.scene);        
        transform_line.MatrixTransform(RX.multiply(T)); 

        const origin_axes = new Axes('origin_axes',this.scene,.1); 
        const endpoint_axes = new Axes('endpoint_axes',this.scene,.1); 

        origin_axes.position = transform_line.absolute_origin; 
        endpoint_axes.position = transform_line.absolute_endpoint; 

        const delay_ms = 100;
        var angle_y = 0;         

        let delay_reset = false; 
        function on_delay(){
            // console.log('Timer complete, reset');
            angle_y += Math.PI/32; 
            RY = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, angle_y);
            transform_line.MatrixTransform(RX.multiply(RY).multiply(T)); 
            endpoint_axes.position = transform_line.absolute_endpoint; 

            delay_reset = true; 

        };

        var time_delay = delay(delay_ms); 

        time_delay.then(on_delay);         

        this.scene.registerBeforeRender(() => {
            if(delay_reset){
                time_delay = delay(delay_ms);
                time_delay.then(on_delay); 
                delay_reset = false; 
            };
        });

        
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

