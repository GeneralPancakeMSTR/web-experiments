// Better to import from core 
// https://doc.babylonjs.com/setup/frameworkPackages/es6Support#available-packages
import { Engine } from '@babylonjs/core';
import { Scene } from '@babylonjs/core';
import { ArcRotateCamera } from '@babylonjs/core';
import { HemisphericLight } from '@babylonjs/core';
import { Vector3 } from '@babylonjs/core';
import { Matrix } from '@babylonjs/core';
import { Axis } from '@babylonjs/core';
import { MeshBuilder } from '@babylonjs/core';
import { Mesh } from '@babylonjs/core';

import { CustomPlane } from './babylon_objects';
import { CustomAxes } from './babylon_objects';
import { TransformLineAssembly } from './babylon_objects';

function delay(ms:number):Promise<void> {                        
    return new Promise(resolve => setTimeout(() => resolve(),ms));
};

class babylon_test {
    canvas: HTMLCanvasElement;     
    
    engine: Engine;
    scene: Scene;
    camera: ArcRotateCamera; 
    light: HemisphericLight; 

    constructor() {
        this.canvas = document.createElement("canvas");
        this.canvas.id = "renderCanvas";
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        document.body.appendChild(this.canvas);
        
        this.engine = new Engine(this.canvas,true); 
        this.scene = new Scene(this.engine); 
        this.scene.useRightHandedSystem = true; 
        this.camera = new ArcRotateCamera("Camera",Math.PI/2,Math.PI/2,2,Vector3.Zero(),this.scene);
        this.camera.attachControl(this.canvas,true);
        this.camera.wheelPrecision = 100; 
        this.light = new HemisphericLight("light",new Vector3(1,1,0),this.scene);

        //////////////// Stuff ////////////////
        var RX = Matrix.RotationAxis(Axis.X, Math.PI/2);
        var RY = Matrix.RotationAxis(Axis.Y, Math.PI/2);
        var RZ = Matrix.RotationAxis(Axis.Z, Math.PI/2);

        var T = Matrix.Translation(-1,1,1);
        var TX = Matrix.Translation(1,0,0);
        var TY = Matrix.Translation(0,1,0);
        var TZ = Matrix.Translation(0,0,1);        

        //// Ground 
        // "Demonstrates" local vs. global (Node) axes
        const ground = new CustomPlane('ground',{'size':2,'sideOrientation':Mesh.DOUBLESIDE},this.scene);
        ground.LocalTransform = TZ.multiply(RX);
        const ground_axes = new CustomAxes('ground_axes',this.scene,{size:.5}); 
        ground_axes.MatrixTransform = ground.LocalTransform; 

        //// Other Stuff (e.g. axes, lines)
        const world_axes = new CustomAxes('world_axes',this.scene);         
        
        const transform_line = new TransformLineAssembly('test_line',this.scene,{axis:[0,1,0]}); 
        
        const transform_line_node_axes = new CustomAxes('transform_line_node_axes',this.scene,{size:.25});
        transform_line_node_axes.parent = transform_line;        
        
        transform_line.MatrixTransform = T;

        const line_origin = new CustomAxes('line_origin',this.scene,{size:.125});
        const line_endpoint = new CustomAxes('line_endpoint',this.scene,{size:.125});
        
        const axes_sphere_x = MeshBuilder.CreateSphere('axes_sphere_x',{diameter:.1},this.scene);
        const axes_sphere_y = MeshBuilder.CreateSphere('axes_sphere_y',{diameter:.1},this.scene);
        const axes_sphere_z = MeshBuilder.CreateSphere('axes_sphere_z',{diameter:.1},this.scene);

        const delay_ms = 100;
        var angle_y = 0;
        RX = Matrix.RotationAxis(Axis.X, Math.PI/4);

        let delay_reset = false; 
        function on_delay(){
            // console.log('Timer complete, reset');
            angle_y += Math.PI/32; 
            
            RY = Matrix.RotationAxis(Axis.Y, angle_y);
            transform_line.MatrixTransform = RX.multiply(RY).multiply(T);
            
            axes_sphere_x.position = transform_line_node_axes.X; 
            axes_sphere_y.position = transform_line_node_axes.Y; 
            axes_sphere_z.position = transform_line_node_axes.Z;

            line_origin.position = transform_line.absolute_origin; 
            line_endpoint.position = transform_line.absolute_endpoint; 
        
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


export {babylon_test};

