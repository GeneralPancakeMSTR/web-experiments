import * as BABYLON from 'babylonjs';
// const BABYLON = require('babylonjs');

//////////////// Custom Transform Node ////////////////
class CustomTransformNode extends BABYLON.TransformNode {
    // Pull scene out of this class and put into CustomMeshes class 
    // If we can ever figure out how to get it to work. 
    protected scene:BABYLON.Scene;

    constructor(name:string,scene:BABYLON.Scene){
        super(`${name}_center_of_transform`); 
        this.scene = scene;         
    };

    appendName(string:string):string {
        return `${this.name}_${string}`;
    };

    MatrixTransform(transform:BABYLON.Matrix):void {
        // https://forum.babylonjs.com/t/how-to-apply-matrix-to-mesh/1350
        let scaling = new BABYLON.Vector3(); 
        let rotationQuaternion = new BABYLON.Quaternion(); 
        let position = new BABYLON.Vector3(); 
        
        transform.decompose(scaling,rotationQuaternion,position); 

        this.scaling = scaling; 
        this.rotationQuaternion = rotationQuaternion; 
        this.position = position; 
    };
};

// Hmmmm...
// Maybe abstract class is the answer? 
// - https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Classes.md#abstract-classes
// - From: https://stackoverflow.com/a/36113846/2391876
abstract class CustomMeshAssembly<Type extends BABYLON.Mesh> extends CustomTransformNode {
    abstract meshes: Array<Type>;     
    protected abstract build():Array<Type>; 

    constructor(name:string,scene:BABYLON.Scene){
        super(name,scene);
    };
    
    MatrixTransformMeshAssembly(transform:BABYLON.Matrix):void {
        let scaling = new BABYLON.Vector3(); 
        let rotationQuaternion = new BABYLON.Quaternion(); 
        let position = new BABYLON.Vector3(); 

        transform.decompose(scaling,rotationQuaternion,position); 

        this.meshes.forEach(mesh => {
            mesh.scaling = scaling; 
            mesh.rotationQuaternion = rotationQuaternion; 
            mesh.position = position; 
        }); 
    };

    protected bind_meshes():void {
        this.meshes.forEach(mesh => mesh.parent = this); 
    };

};



//////////////// Plane ////////////////
export interface CustomPlaneOptions {
    size?:number | undefined,
    width?: number | undefined, 
    height?: number | undefined, 
    sideOrientation?: number | undefined,
    updatable?: boolean | undefined,
    sourcePlane?: BABYLON.Plane | undefined, 
    frontUVs?: BABYLON.Vector4 | undefined, 
    backUVs?: BABYLON.Vector4 | undefined, 
};

export class CustomPlane extends CustomMeshAssembly<BABYLON.Mesh>{
    meshes: Array<BABYLON.Mesh>;     
    options: CustomPlaneOptions; 

    constructor(name:string,options:CustomPlaneOptions,scene:BABYLON.Scene){ 
        super(name,scene);        
        this.options = options; 
        this.meshes = this.build(); 
        this.bind_meshes();         
    };

    protected build():Array<BABYLON.Mesh>{
        let mesh = BABYLON.MeshBuilder.CreatePlane(this.appendName('plane_mesh'),this.options,this.scene); 
        return new Array(mesh);
    };

};


//////////////// Axes ////////////////
interface AxesMeshes {
    X:BABYLON.LinesMesh,
    Y:BABYLON.LinesMesh,
    Z:BABYLON.LinesMesh
}; 

export class Axes extends BABYLON.TransformNode {
    name:string; 
    scene: BABYLON.Scene; 
    
    X:BABYLON.Vector3; 
    Y:BABYLON.Vector3;
    Z:BABYLON.Vector3; 

    private meshes:AxesMeshes;

    private ColorRed = new BABYLON.Color3(1,0,0);
    private ColorGreen = new BABYLON.Color3(0,1,0);
    private ColorBlue = new BABYLON.Color3(0,0,1);    

    constructor(name:string,scene:BABYLON.Scene,size?:number){        
        super(`${name}_center_of_transform`);
        this.name = name;         
        this.scene = scene;

        this.X = new BABYLON.Vector3(size || 1,0,0);
        this.Y = new BABYLON.Vector3(0,size || 1,0);
        this.Z = new BABYLON.Vector3(0,0,size || 1);

        this.meshes = this.build(); 

    };
 
    private build(): AxesMeshes{
        let x_options = {
            points:new Array(BABYLON.Vector3.Zero(), this.X),
            updatable:true, 
        };    
        let x_line = BABYLON.MeshBuilder.CreateLines(this.appendName('x_line'),x_options,this.scene);
        x_line.color = this.ColorRed; 

        let y_options = {
            points:new Array(BABYLON.Vector3.Zero(), this.Y),
            updatable:true, 
        };
        let y_line = BABYLON.MeshBuilder.CreateLines(this.appendName('y_line'),y_options,this.scene);
        y_line.color = this.ColorGreen; 

        let z_options = {
            points:new Array(BABYLON.Vector3.Zero(), this.Z),
            updatable:true, 
        };
        let z_line = BABYLON.MeshBuilder.CreateLines(this.appendName('z_line'),z_options,this.scene);
        z_line.color = this.ColorBlue;         
        
        x_line.parent = this;
        y_line.parent = this;
        z_line.parent = this;

        return {
            X: x_line, 
            Y: y_line,
            Z: z_line
        };        
    };
    
    appendName(string:string):string{
        return `${this.name}_${string}`;
    };

    transform_local(transform:BABYLON.Matrix):void{        
        BABYLON.Vector3.TransformCoordinatesToRef(this.X,transform,this.X);
        BABYLON.Vector3.TransformCoordinatesToRef(this.Y,transform,this.Y);
        BABYLON.Vector3.TransformCoordinatesToRef(this.Z,transform,this.Z);

        this.meshes.X = BABYLON.MeshBuilder.CreateLines(this.meshes.X.name,{points:new Array(BABYLON.Vector3.Zero(), this.X),updatable:true,instance:this.meshes.X},this.scene);

        this.meshes.Y = BABYLON.MeshBuilder.CreateLines(this.meshes.Y.name,{points:new Array(BABYLON.Vector3.Zero(), this.Y),updatable:true,instance:this.meshes.Y},this.scene);

        this.meshes.Z = BABYLON.MeshBuilder.CreateLines(this.meshes.Z.name,{points:new Array(BABYLON.Vector3.Zero(), this.Z),updatable:true,instance:this.meshes.Z},this.scene);
    };

    transform_node(transform:BABYLON.Matrix):void {        
        let scaling = new BABYLON.Vector3(); 
        let rotationQuaternion = new BABYLON.Quaternion(); 
        let position = new BABYLON.Vector3(); 

        transform.decompose(scaling,rotationQuaternion,position); 
        this.scaling = scaling;
        this.rotationQuaternion = rotationQuaternion;
        this.position = position; 
    };
};

//////////////// TransformLine ////////////////
interface TransformLineOptions {
    Axis?: 'X' | 'Y' | 'Z' | undefined
};

export class TransformLine extends CustomTransformNode {
    origin:BABYLON.Vector3 = BABYLON.Vector3.Zero();  
    endpoint:BABYLON.Vector3; 
    
    line_mesh:BABYLON.LinesMesh;

    constructor(name:string,options:TransformLineOptions,scene:BABYLON.Scene){
        super(name,scene);

        switch(options.Axis || 'X'){
            case 'X':
                this.endpoint = new BABYLON.Vector3(1,0,0); 
                break;             
            case 'Y':
                this.endpoint = new BABYLON.Vector3(0,1,0); 
                break;
            case 'Z': 
                this.endpoint = new BABYLON.Vector3(0,0,1); 
                break;
        };

        this.line_mesh = this.build(); 
        this.line_mesh.parent = this; 

    };

    private build():BABYLON.LinesMesh {
        let line_options = {
            points:new Array(this.origin, this.endpoint),
            updatable:true, 
        };
        
        let line_mesh = BABYLON.MeshBuilder.CreateLines(this.appendName('line_mesh'),line_options,this.scene);

        return line_mesh;         
    };

    get absolute_origin():BABYLON.Vector3{
        return BABYLON.Vector3.TransformCoordinates(this.origin,this.getWorldMatrix());
    };

    get absolute_endpoint():BABYLON.Vector3{
        return BABYLON.Vector3.TransformCoordinates(this.endpoint,this.getWorldMatrix());
    };

};