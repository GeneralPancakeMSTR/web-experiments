import { Scene } from '@babylonjs/core';
import { Matrix } from '@babylonjs/core';
import { Vector3 } from '@babylonjs/core';
import { Quaternion } from '@babylonjs/core';
import { Vector4 } from '@babylonjs/core';
import { Color3 } from '@babylonjs/core';
import { TransformNode } from '@babylonjs/core';
import { Mesh } from '@babylonjs/core';
import { MeshBuilder } from '@babylonjs/core';
import { Plane } from '@babylonjs/core';
import { LinesMesh } from '@babylonjs/core';

//////////////// Custom Transform Node ////////////////
class CustomTransformNode extends TransformNode {
    constructor(name:string){
        super(`${name}_center_of_transform`); 
    };

    set MatrixTransform(transform:Matrix) {
        // https://forum.babylonjs.com/t/how-to-apply-matrix-to-mesh/1350

        let scaling = new Vector3(); 
        let rotationQuaternion = new Quaternion(); 
        let position = new Vector3(); 
        
        transform.decompose(scaling,rotationQuaternion,position); 

        this.scaling = scaling; 
        this.rotationQuaternion = rotationQuaternion; 
        this.position = position; 
    };

    get MatrixTransform():Matrix {
        return this.computeWorldMatrix(); 
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

abstract class CustomMeshAssembly<Type extends Mesh> extends CustomTransformNode {    
    protected scene: Scene;     
    protected abstract meshes: Array<Type>;
    protected abstract build(): Array<Type> ;

    private local_meshes_transform: Matrix;    

    constructor(name:string,scene:Scene){        
        super(name); 
        this.scene = scene; 
        this.local_meshes_transform = Matrix.Identity(); 
    };

    get LocalTransform():Matrix {
        return this.local_meshes_transform;
    }

    set LocalTransform(transform:Matrix) {
        this.local_meshes_transform = transform; 

        let scaling = new Vector3(); 
        let rotationQuaternion = new Quaternion(); 
        let position = new Vector3(); 

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
    sourcePlane?: Plane | undefined, 
    frontUVs?: Vector4 | undefined, 
    backUVs?: Vector4 | undefined, 
};

export class CustomPlane extends CustomMeshAssembly<Mesh>{
    meshes: Array<Mesh>;
    options: CustomPlaneOptions; 

    constructor(name:string,options:CustomPlaneOptions,scene:Scene){ 
        super(name,scene);        
        this.options = options; 
        this.meshes = this.build(); 
        this.bind_meshes();         
    };

    protected build():Array<Mesh>{
        let mesh = MeshBuilder.CreatePlane(this.appendName('plane_mesh'),this.options,this.scene); 
        return new Array(mesh);
    };
};

//////////////// Axes (CustomAxes) ////////////////
interface CustomAxesOptions {
    size?: number | undefined; 
}; 

export class CustomAxes extends CustomTransformNode{
    scene:Scene;     
    options:CustomAxesOptions; 

    private x_axis:Vector3; 
    private y_axis:Vector3;
    private z_axis:Vector3; 

    private x_line:LinesMesh; 
    private y_line:LinesMesh;
    private z_line:LinesMesh; 

    private ColorRed = new Color3(1,0,0);
    private ColorGreen = new Color3(0,1,0);
    private ColorBlue = new Color3(0,0,1);   

    constructor(name:string,scene:Scene,options?:CustomAxesOptions){
        super(name); 
        this.scene = scene; 

        this.options = {
            size:options?.size || 1,
        };

        this.x_axis = new Vector3(this.options.size,0,0);
        this.y_axis = new Vector3(0,this.options.size,0);
        this.z_axis = new Vector3(0,0,this.options.size);

        [this.x_line,this.y_line,this.z_line] = this.build(); 

        this.x_line.parent = this;
        this.y_line.parent = this;
        this.z_line.parent = this;
    };

    private build(): [LinesMesh,LinesMesh,LinesMesh] {
        let x_options = {
            points:new Array(Vector3.Zero(), this.x_axis),
            updatable:true, 
        };    
        let x_line = MeshBuilder.CreateLines(this.appendName('x_line'),x_options,this.scene);
        x_line.color = this.ColorRed; 

        let y_options = {
            points:new Array(Vector3.Zero(), this.y_axis),
            updatable:true, 
        };
        let y_line = MeshBuilder.CreateLines(this.appendName('y_line'),y_options,this.scene);
        y_line.color = this.ColorGreen; 

        let z_options = {
            points:new Array(Vector3.Zero(), this.z_axis),
            updatable:true, 
        };
        let z_line = MeshBuilder.CreateLines(this.appendName('z_line'),z_options,this.scene);
        z_line.color = this.ColorBlue;

        return [x_line,y_line,z_line];
    };

    get OrientationMatrix(): Matrix {
        // Returns the world matrix of this multiplied 
        // by the inverse of this's position as a translation matrix,
        // Effectively producing this's transform matrix, minus position. 

        // I guess this is a little weird. 
        // The more I think about it, the less I'm sure of how to implement this whole class.

        // Also seems to have problems when parented to another object. 
        // Nevermind I was modifying the axes, instead of transforming them into new vectors, 
        // classic mistake. 

        let world_matrix = this.computeWorldMatrix().clone();         
        
        let translation_matrix = Matrix.Translation(this.absolutePosition._x,this.absolutePosition._y,this.absolutePosition._z); 

        let orientation_matrix = world_matrix.multiply(translation_matrix.invert());        
        return orientation_matrix; 
    };

    get X():Vector3 {        
        return Vector3.TransformCoordinates(this.x_axis,this.OrientationMatrix);         
    };

    get Y():Vector3 {        
        return Vector3.TransformCoordinates(this.y_axis,this.OrientationMatrix); 
    };

    get Z():Vector3 {        
        return Vector3.TransformCoordinates(this.z_axis,this.OrientationMatrix); 
    };

    // [ ] Maybe should implement absolute X/Y/Z as well 
};


//////////////// TransformLine ////////////////
interface TransformLineOptions {
    // axis?: 'X' | 'Y' | 'Z' | [number,number,number] | undefined, // I dont know how to get this to work
    axis?: [number,number,number]
};

export class TransformLineAssembly extends CustomMeshAssembly<LinesMesh> {    
    origin:Vector3 = Vector3.Zero();     
    endpoint: Vector3; 

    meshes:Array<LinesMesh>; 

    // Not used 
    private named_axes = {
        'X':() => {return new Vector3(1,0,0)},
        'Y':() => {return new Vector3(0,1,0)},
        'Z':() => {return new Vector3(0,0,1)}    
    };

    constructor(name:string,scene:Scene,options?:TransformLineOptions){
        super(name,scene);

        this.endpoint = Vector3.FromArray(options?.axis || new Array(1,0,0));

        this.meshes = this.build();
        
        this.bind_meshes(); 
    };

    protected build():Array<LinesMesh>{
        let line_options = {
            points:new Array(this.origin,this.endpoint),
            updatable:true
        };

        let line_mesh = MeshBuilder.CreateLines(this.appendName('line_mesh'),line_options,this.scene);

        return new Array(line_mesh);
    };

    get absolute_origin():Vector3 {        
        return Vector3.TransformCoordinates(this.origin,this.LocalTransform.multiply(this.getWorldMatrix()));
    };

    get absolute_endpoint():Vector3 {        
        return Vector3.TransformCoordinates(this.endpoint,this.LocalTransform.multiply(this.getWorldMatrix()));
    };

};
