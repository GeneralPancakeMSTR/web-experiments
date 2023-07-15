import * as BABYLON from 'babylonjs';
// const BABYLON = require('babylonjs');

//////////////// Custom Transform Node ////////////////
class CustomTransformNode extends BABYLON.TransformNode {
    constructor(name:string){
        super(`${name}_center_of_transform`); 
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

    appendName(string:string):string {
        return `${this.name}_${string}`;
    };
};

// Hmmmm...
// Maybe abstract class is the answer? 
// - https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/Classes.md#abstract-classes
// - From: https://stackoverflow.com/a/36113846/2391876
// Hmmmmmmmm ... I think this might be dangerous. 
// Not the construction, but enabling both a local and global (node) transform. 

// So I guess the (new) idea here is that this class makes it so 
// you can set position/rotation,scale (ig) of the TransformNode,
// along with transforming the TransformNode with a matrix. 
// BUT, you CANNOT transform the meshes directly, you can ONLY transform them with a matrix. 
// Which enables you to keep track of how the mesh assembly is transformed with respect to 
// its parent node. 

abstract class CustomMeshAssembly<Type extends BABYLON.Mesh> extends CustomTransformNode {    
    protected scene: BABYLON.Scene; 
    
    protected abstract meshes: Array<Type>;
    protected abstract build():Array<Type>;

    private local_meshes_transform: BABYLON.Matrix;     
    

    constructor(name:string,scene:BABYLON.Scene){        
        super(name); 
        this.scene = scene; 
        this.local_meshes_transform = BABYLON.Matrix.Identity(); 
    };

    get LocalTransform():BABYLON.Matrix {
        return this.local_meshes_transform;
    }

    set LocalTransform(transform:BABYLON.Matrix) {
        this.local_meshes_transform = transform; 

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
    
    // Aka transform with respect to transform node (local transform)
    // MatrixTransformMeshAssembly(transform:BABYLON.Matrix):void {
    //     this.local_meshes_transform = transform; 

    //     let scaling = new BABYLON.Vector3(); 
    //     let rotationQuaternion = new BABYLON.Quaternion(); 
    //     let position = new BABYLON.Vector3(); 

    //     transform.decompose(scaling,rotationQuaternion,position); 

    //     this.meshes.forEach(mesh => {
    //         mesh.scaling = scaling; 
    //         mesh.rotationQuaternion = rotationQuaternion; 
    //         mesh.position = position; 
    //     }); 
    // };


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

//////////////// Axes (CustomAxes) ////////////////
interface CustomAxesOptions {
    size?: number | undefined; 
}; 

export class CustomAxes extends CustomTransformNode{
    scene:BABYLON.Scene;     
    options:CustomAxesOptions; 

    private x_axis:BABYLON.Vector3; 
    private y_axis:BABYLON.Vector3;
    private z_axis:BABYLON.Vector3; 

    private x_line:BABYLON.LinesMesh; 
    private y_line:BABYLON.LinesMesh;
    private z_line:BABYLON.LinesMesh; 

    private ColorRed = new BABYLON.Color3(1,0,0);
    private ColorGreen = new BABYLON.Color3(0,1,0);
    private ColorBlue = new BABYLON.Color3(0,0,1);   

    constructor(name:string,scene:BABYLON.Scene,options?:CustomAxesOptions){
        super(name); 
        this.scene = scene; 

        this.options = {
            size:options?.size || 1,
        };

        this.x_axis = new BABYLON.Vector3(this.options.size,0,0);
        this.y_axis = new BABYLON.Vector3(0,this.options.size,0);
        this.z_axis = new BABYLON.Vector3(0,0,this.options.size);

        [this.x_line,this.y_line,this.z_line] = this.build(); 

        this.x_line.parent = this;
        this.y_line.parent = this;
        this.z_line.parent = this;
    };

    private build(): [BABYLON.LinesMesh,BABYLON.LinesMesh,BABYLON.LinesMesh] {
        let x_options = {
            points:new Array(BABYLON.Vector3.Zero(), this.x_axis),
            updatable:true, 
        };    
        let x_line = BABYLON.MeshBuilder.CreateLines(this.appendName('x_line'),x_options,this.scene);
        x_line.color = this.ColorRed; 

        let y_options = {
            points:new Array(BABYLON.Vector3.Zero(), this.y_axis),
            updatable:true, 
        };
        let y_line = BABYLON.MeshBuilder.CreateLines(this.appendName('y_line'),y_options,this.scene);
        y_line.color = this.ColorGreen; 

        let z_options = {
            points:new Array(BABYLON.Vector3.Zero(), this.z_axis),
            updatable:true, 
        };
        let z_line = BABYLON.MeshBuilder.CreateLines(this.appendName('z_line'),z_options,this.scene);
        z_line.color = this.ColorBlue;

        return [x_line,y_line,z_line];
    };

    get OrientationMatrix(): BABYLON.Matrix {
        // Returns the world matrix of this multiplied 
        // by the inverse of this's position as a translation matrix,
        // Effectively producing this's transform matrix, minus position. 

        // I guess this is a little weird. 
        // The more I think about it, the less I'm sure of how to implement this whole class.

        // Also seems to have problems when parented to another object. 
        // Nevermind I was modifying the axes, instead of transforming them into new vectors, 
        // classic mistake. 

        let world_matrix = this.computeWorldMatrix().clone(); 
        // let translation_matrix = BABYLON.Matrix.Translation(this.position.x,this.position.y,this.position.z); 
        let translation_matrix = BABYLON.Matrix.Translation(this.absolutePosition._x,this.absolutePosition._y,this.absolutePosition._z); 

        let orientation_matrix = world_matrix.multiply(translation_matrix.invert());        
        return orientation_matrix; 
    };

    get X():BABYLON.Vector3 {        
        return BABYLON.Vector3.TransformCoordinates(this.x_axis,this.OrientationMatrix);         
    };

    get Y():BABYLON.Vector3 {        
        return BABYLON.Vector3.TransformCoordinates(this.y_axis,this.OrientationMatrix); 
    };

    get Z():BABYLON.Vector3 {        
        return BABYLON.Vector3.TransformCoordinates(this.z_axis,this.OrientationMatrix); 
    };

    // [ ] Maybe need to implement absolute X/Y/Z as well 
};


//////////////// TransformLine ////////////////
interface TransformLineOptions {
    // axis?: 'X' | 'Y' | 'Z' | [number,number,number] | undefined, // I dont know how to get this to work
    axis?: [number,number,number]
};

export class TransformLineAssembly extends CustomMeshAssembly<BABYLON.LinesMesh> {    
    origin:BABYLON.Vector3 = BABYLON.Vector3.Zero();     
    endpoint: BABYLON.Vector3; 

    meshes:Array<BABYLON.LinesMesh>; 

    // Not used 
    private named_axes = {
        'X':() => {return new BABYLON.Vector3(1,0,0)},
        'Y':() => {return new BABYLON.Vector3(0,1,0)},
        'Z':() => {return new BABYLON.Vector3(0,0,1)}    
    };
    

    constructor(name:string,scene:BABYLON.Scene,options?:TransformLineOptions){
        super(name,scene);        
        
        this.endpoint = BABYLON.Vector3.FromArray(options?.axis || new Array(1,0,0));

        this.meshes = this.build();
        
        this.bind_meshes(); 

    };

    protected build():Array<BABYLON.LinesMesh>{
        let line_options = {
            points:new Array(this.origin,this.endpoint),
            updatable:true
        };

        let line_mesh = BABYLON.MeshBuilder.CreateLines(this.appendName('line_mesh'),line_options,this.scene);

        return new Array(line_mesh);
    };

    get absolute_origin():BABYLON.Vector3 {        
        return BABYLON.Vector3.TransformCoordinates(this.origin,this.LocalTransform.multiply(this.getWorldMatrix()));

    };

    get absolute_endpoint():BABYLON.Vector3 {        
        return BABYLON.Vector3.TransformCoordinates(this.endpoint,this.LocalTransform.multiply(this.getWorldMatrix()));
    };
};


// type Vector3 = [number,number,number];

// 'Arbitrary':(direction:Vector3) => {return BABYLON.Vector3.FromArray(direction)}

// interface TransformLineOptions{
//     axis?: [number,number,number];     
// };


// export class TransformLine extends CustomTransformNode {
//     origin:BABYLON.Vector3 = BABYLON.Vector3.Zero();  
//     endpoint:BABYLON.Vector3; 
    
//     line_mesh:BABYLON.LinesMesh;

//     scene:BABYLON.Scene; 

//     constructor(name:string,options:TransformLineOptions,scene:BABYLON.Scene){
//         super(name);
//         this.scene = scene; 

//         switch(options.Axis || 'X'){
//             case 'X':
//                 this.endpoint = new BABYLON.Vector3(1,0,0); 
//                 break;             
//             case 'Y':
//                 this.endpoint = new BABYLON.Vector3(0,1,0); 
//                 break;
//             case 'Z': 
//                 this.endpoint = new BABYLON.Vector3(0,0,1); 
//                 break;
//         };

//         this.line_mesh = this.build(); 
//         this.line_mesh.parent = this; 

//     };

//     private build():BABYLON.LinesMesh {
//         let line_options = {
//             points:new Array(this.origin, this.endpoint),
//             updatable:true, 
//         };
        
//         let line_mesh = BABYLON.MeshBuilder.CreateLines(this.appendName('line_mesh'),line_options,this.scene);

//         return line_mesh;         
//     };

//     get absolute_origin():BABYLON.Vector3{
//         return BABYLON.Vector3.TransformCoordinates(this.origin,this.getWorldMatrix());
//     };

//     get absolute_endpoint():BABYLON.Vector3{
//         return BABYLON.Vector3.TransformCoordinates(this.endpoint,this.getWorldMatrix());
//     };

// };
