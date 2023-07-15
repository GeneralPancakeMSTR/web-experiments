
// Okay the Babylon import situation is just plain weird and I kind of can't make sense of it. 
// Current workaround is just "import * as BABYLON from 'babylonjs'" in everything that references babylon ("const BABYLON = require('babylonjs')" also works, which probably hints at the problem, but I still don't understand)
// interesting: https://forum.babylonjs.com/t/ts2345-argument-of-type-import-babylonjs-scene-scene-is-not-assignable-to-parameter-of-type-babylon-scene/1308/6
// import * as Babylon from 'babylonjs';
import * as BABYLON from 'babylonjs';
// const BABYLON = require('babylonjs');


function delay(ms:number):Promise<void> {                        
    return new Promise(resolve => setTimeout(() => resolve(),ms));
};

import { CustomPlane } from './babylon_objects';
import { CustomAxes } from './babylon_objects';
import { TransformLineAssembly } from './babylon_objects';


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

        var TZ = BABYLON.Matrix.Translation(0,0,1);

        //// Ground 
        // "Demonstrates" local vs. global (Node) axes
        const ground = new CustomPlane('ground',{'size':2,'sideOrientation':BABYLON.Mesh.DOUBLESIDE},this.scene);
        ground.LocalTransform = TZ.multiply(RX);
        const ground_axes = new CustomAxes('ground_axes',this.scene,{size:.5}); 
        ground_axes.MatrixTransform(ground.LocalTransform); 

        //// Other Stuff (e.g. axes, lines)

        const world_axes = new CustomAxes('world_axes',this.scene); 

        RX = BABYLON.Matrix.RotationAxis(BABYLON.Axis.X, Math.PI/4);
        var T = BABYLON.Matrix.Translation(-1,1,1);

        
        
        
        // const transform_line = new TransformLine('test_line',{Axis:'Y'},this.scene);        
        // transform_line.MatrixTransform(RX.multiply(T));
        // const transform_line = new TransformLineAssembly('test_line',{axis:'X'},this.scene); 
        const transform_line = new TransformLineAssembly('test_line',this.scene,{axis:[1,0,0]}); 
        const transform_line_node_axes = new CustomAxes('transform_line_node_axes',this.scene,{size:.1});
        transform_line_node_axes.parent = transform_line;

        const line_origin_sphere = BABYLON.MeshBuilder.CreateSphere('line_origin_sphere',{diameter:.1},this.scene);

        const line_endpoint_sphere = BABYLON.MeshBuilder.CreateSphere('line_endpoint_sphere',{diameter:.1},this.scene);
        
        T = BABYLON.Matrix.Translation(0,1,1);
        transform_line.MatrixTransform(RX.multiply(T));

        T = BABYLON.Matrix.Translation(0,0,1);
        transform_line.LocalTransform = RZ.multiply(T);

        line_origin_sphere.position = transform_line.absolute_origin;
        line_endpoint_sphere.position = transform_line.absolute_endpoint;






        const origin_axes = new CustomAxes('origin_axes',this.scene,{size:.25});
        const endpoint_axes = new CustomAxes('endpoint_axes',this.scene,{size:.25});

        // origin_axes.parent = transform_line;

        // endpoint_axes.position = transform_line.absolute_endpoint; 
        // endpoint_axes.rotation.y = Math.PI/4; 
        
        const origin_sphere_x = BABYLON.MeshBuilder.CreateSphere('origin_sphere_x',{diameter:.1},this.scene);
        const origin_sphere_y = BABYLON.MeshBuilder.CreateSphere('origin_sphere_y',{diameter:.1},this.scene);
        const origin_sphere_z = BABYLON.MeshBuilder.CreateSphere('origin_sphere_z',{diameter:.1},this.scene);

        const delay_ms = 100;
        var angle_y = 0;

        let delay_reset = false; 
        function on_delay(){
            // console.log('Timer complete, reset');
            angle_y += Math.PI/32; 
            
            RY = BABYLON.Matrix.RotationAxis(BABYLON.Axis.Y, angle_y);            
            // transform_line.MatrixTransform(RX.multiply(RY).multiply(T));            

           origin_sphere_x.position = origin_axes.X; 
           origin_sphere_y.position = origin_axes.Y; 
           origin_sphere_z.position = origin_axes.Z;

        //    endpoint_axes.position = transform_line.absolute_endpoint; 
           
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

