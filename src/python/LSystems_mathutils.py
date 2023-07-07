import random 
# import mathutils 
import numpy as np 
import sys 

# mathutils gets it right, where my numpy implementation does not. 
import mathutils as mu 

## References 
# https://www.youtube.com/watch?v=feNVBEPXAcE

def Identity4():
    return np.identity(4)

def Matrix4():
    return np.zeros((4,4))

def RandomMatrix4(): 
    return np.random.rand(4,4)

def MatMultiply(A,B):
    rows_A,cols_A = np.shape(A)
    rows_B,cols_B = np.shape(B)

    if(cols_A != rows_B):
        print('Cannot multiply matrices: Incompatible shapes.')
        return 0 
    else: 
        n = cols_A = rows_B 

        C = np.zeros((rows_A,cols_B))
        for i in range(rows_A): 
            for j in range(cols_B):                 
                for k in range(n):
                    C[i][j] += A[i][k]*B[k][j]

        return C

def TranslationMatrix(translation_vector):
    T = Identity4()
    T[:3,3] = translation_vector
    return T

def ScaleMatrix(scale_vector):
    S = Identity4()     
    for i,s in enumerate(scale_vector): 
        S[i][i] = s 
    
    return S

def RotationX(theta): 
    RX = Identity4() 
    RX[1][1] = np.cos(theta)
    RX[1][2] = np.sin(theta)
    RX[2][1] = -np.sin(theta)
    RX[2][2] = np.cos(theta)
    return RX 

def RotationY(theta): 
    RY = Identity4() 
    RY[0][0] = np.cos(theta)
    RY[0][2] = -np.sin(theta)
    RY[2][0] = np.sin(theta)
    RY[2][2] = np.cos(theta)
    return RY

def RotationZ(theta): 
    RZ = Identity4() 
    RZ[0][0] = np.cos(theta)
    RZ[0][1] = -np.sin(theta)
    RZ[1][0] = np.sin(theta)
    RZ[1][1] = np.cos(theta)
    return RZ

def printMatrix4(A):
    for i in range(4):
        for elem in A[i,:]:            
            print(f' {elem:.4f} ',end='')
        print()

def print_mu_Matrix(A):
    for i in range(4):
        for elem in A[i][:]:            
            print(f' {elem:.4f} ',end='')
        print()

class LSystem:     
    # def __init__(self,xml_tree,maxObjects): 
    def __init__(self,xml_tree):
        """
        Takes an XML tree integer number of maxObjects, 
        where the latter parameter restricts how many matrices 
        the evaluate(?) method may produce. 
        """
        self._tree = xml_tree
        self._maxDepth = int(self._tree.get('max_depth'))
        self._progressCount = 0 

        # self._maxObjects = max_objects 
        self._maxObjects = 1000 

    def evaluate(self,seed = 0):
        random.seed(seed)
        rule = _pickRule(self._tree,'entry')         
        entry = (rule,0,mu.Matrix.Identity(4))
        shapes = self._evaluate(entry)
        return shapes 

    def _evaluate(self,entry):
        stack = [entry] 
        shapes = [] 
        num_objects = 0 

        while(len(stack) > 0):
            if(num_objects > self._maxObjects):
                print('max objects reached')
                break 

            rule,depth,matrix = stack.pop() 

            local_max_depth = self._maxDepth

            if('max_depth' in rule.attrib):
                local_max_depth = int(rule.get('max_depth'))

            if(len(stack) > self._maxDepth):
                # I don't understand why append None 
                shapes.append(None)
                continue 

            if depth > local_max_depth:
                if('successor' in rule.attrib):
                    successor = rule.get('successor')
                    rule = _pickRule(self._tree,successor) 
                    stack.append((rule,0,matrix))
                # I don't understand why append None 
                shapes.append(None)
                continue 

            base_matrix = matrix.copy() 
            for statement in rule: 
                transform_string = statement.get('transforms','')
                # if(not transform_string):
                #     print('no transform string') 
                #     sys.exit() 
                
                xform = _parseXform(transform_string)
                count = int(statement.get('count',1))                
                count_xform = mu.Matrix.Identity(4)

                for n in range(count):
                    # count_xform = MatMultiply(xform,count_xform)
                    # count_xform = MatMultiply(count_xform,xform) # Try Reversed 
                    count_xform @= xform                     
                    matrix = base_matrix @ count_xform         

                    if(statement.tag == 'call'): 
                        rule = _pickRule(self._tree,statement.get('rule'))
                        cloned_matrix = matrix.copy() 
                        entry = (rule,depth+1,cloned_matrix) 
                        stack.append(entry) 
                    elif(statement.tag == 'instance'):
                        name = statement.get('shape')
                        shape = (name,matrix)
                        shapes.append(shape)
                        num_objects += 1                 
                    # Location of this else block doesn't make sense 
                    # Sort of makes sense if it's tabbed in by 1 
                    # That's probably where it's supposed to go, but, what?
                    else:                    
                        # How does this not trip an error in Sverchok?
                        # raise ValueError('bad xml',statement.tag)
                        print('bad xml',statement.tag)
            if(count > 1):
                shapes.append(None)
        
        return shapes 



def _pickRule(tree,name): 
    """
    Return a rule named <name>
    There may be multiple rules with the same name (degenerate rules). 
    Degenerate rules may also be weighted, where a rule's weight reflects how probable 
    it is that it is selected over other rules with the same name. 
    """

    # Could be better 
    
    rules = tree.findall('rule')
    
    # Construct list (as elements) of rules named <name> 
    elements = [] 
    for r in rules: 
        if(r.get('name') == name):
            elements.append(r)

    if len(elements) == 0:
        print(f'Error, no rules found with name {name}.')
        sys.exit() 

    _sum,tuples = 0,[]
    for e in elements:             
        weight = int(e.get('weight',1))
        _sum = _sum + weight 
        tuples.append((e,weight))
    
    # This is such a weird way of randomly choosing weighted/degenerate rules 
    # I honestly don't fully understand it 
    # I'm just gonna copy this code and...ask questions later 
    # [ ] But maybe rewrite this to make sense 
    n = random.randint(0,_sum-1)
    for (item,weight) in tuples:
        if n < weight: 
            break 
        n = n - weight 

    return item 


_xformCache = {} 

def _parseXform(xform_string):
    if xform_string in _xformCache:
        return _xformCache[xform_string]
    
    matrix = mu.Matrix.Identity(4) 
    tokens = xform_string.split(' ') 
    
    # why lol 
    # I get it. Ugh. 
    # [ ] Refactor to use regex maybe, this is awful 
    t = 0     
    while t < len(tokens) - 1: 
        command, t = tokens[t], t+1 

        # Translation 
        if command == 'tx':
            x,t = float(tokens[t]), t+1 
            matrix @= mu.Matrix.Translation(mu.Vector((x,0,0)))
        elif command == 'ty':
            y,t = float(tokens[t]), t+1 
            matrix @= mu.Matrix.Translation(mu.Vector((0,y,0)))
        elif command == 'tz': 
            z,t = float(tokens[t]), t+1 
            matrix @= mu.Matrix.Translation(mu.Vector((0,0,z)))
        elif command == 't': 
            x,t = float(tokens[t]), t+1
            y,t = float(tokens[t]), t+1 
            z,t = float(tokens[t]), t+1            
            matrix @= mu.Matrix.Translation(mu.Vector((x,y,z)))
        
        # Rotation 
        elif command == 'rx': 
            theta,t = np.radians(float(tokens[t])),t+1 
            matrix @= mu.Matrix.Rotation(theta,4,'X')
        elif command == 'ry': 
            theta,t = np.radians(float(tokens[t])),t+1 
            matrix @= mu.Matrix.Rotation(theta,4,'Y')
        elif command == 'rz': 
            theta,t = np.radians(float(tokens[t])),t+1             
            matrix @= mu.Matrix.Rotation(theta,4,'Z')
        # Scale 
        elif command == 'sx': 
            x, t = float(tokens[t]), t + 1
            matrix @= mu.Matrix.Scale(x, 4, mu.Vector((1.0, 0.0, 0.0)))
        elif command == 'sy': 
            y, t = float(tokens[t]), t + 1
            matrix @= mu.Matrix.Scale(y, 4, mu.Vector((0.0, 1.0, 0.0)))
        elif command == 'sz': 
            z, t = float(tokens[t]), t + 1
            matrix @= mu.Matrix.Scale(z, 4, mu.Vector((0.0, 0.0, 1.0)))
        elif command == 'sa': 
            v,t = float(tokens[t]), t+1
            matrix @= mu.Matrix.Scale(v, 4)
        elif command == 's': 
            # x, t = float(tokens[t]), t + 1
            # y, t = float(tokens[t]), t + 1
            # z, t = float(tokens[t]), t + 1
            x, t = eval(tokens[t]), t + 1
            y, t = eval(tokens[t]), t + 1
            z, t = eval(tokens[t]), t + 1
            mx = mu.Matrix.Scale(x, 4, mu.Vector((1.0, 0.0, 0.0)))
            my = mu.Matrix.Scale(y, 4, mu.Vector((0.0, 1.0, 0.0)))
            mz = mu.Matrix.Scale(z, 4, mu.Vector((0.0, 0.0, 1.0)))
            mxyz = mx@my@mz
            matrix @= mxyz
            


        else: 
            print(f'Unrecognized transformation: {command} at position {t} in {xform_string}.')
            sys.exit() 

    _xformCache.update({xform_string:matrix}) 
    return matrix 

if __name__=="__main__":
    import os 
    os.system('clear')

    from xml.etree.cElementTree import fromstring 

    # xml_rule = 'new_rule.xml'
    xml_rule = 'simple_rule.xml'

    xml_filename = os.path.join(os.getcwd(),f'../xml/{xml_rule}')

    with open(xml_filename,'r') as xml_file:
        xml_tree = fromstring(xml_file.read())

    lsystem = LSystem(xml_tree) 
    instances = lsystem.evaluate()
    # Note: 
    # Evaluator adds None-type items to the shapes list (for some reason)
    # Sverchok removes this (and so will I)
    instances = [instance for instance in instances if instance]
    
    for instance in instances: 
        # printMatrix4(instance[1])
        print_mu_Matrix(instance[1])
        print()

        

