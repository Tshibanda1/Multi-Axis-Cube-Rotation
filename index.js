const canvas = document.querySelector(`canvas`);
const gl = canvas.getContext(`webgl`);

if(!gl){

    throw new Error("unfortunately your device does not support webgl");
}

gl.clearColor(0,0,0,0.9);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.enable(gl.DEPTH_TEST);
let r=0.25;
let angle = 0.1; //used in rotation in draw function
let xs = 0; 
let ys = 0;
let xxs =0.5; //second cube
let zs = 0;
let m  = -1;
let enableX =0;
let enableY =0;
let enableZ=0
let enable =0;

//*****create reference to image
let image= document.getElementById("mine");
let bg= document.getElementById("bg");


//get references to buttons in html
let rotateX = document.getElementById("rotateX");
let rotateY = document.getElementById("rotateY");
let rotateZ = document.getElementById("rotateZ");
let rotateAll = document.getElementById("rotateAll");

let moveLeft = document.getElementById("moveLeft");
let moveRight = document.getElementById("moveRight");
let moveUp = document.getElementById("moveUp");
let moveDown = document.getElementById("moveDown");

rotateAll.addEventListener('click',()=>{ //this is used to rotate in all axises
    m *= -1;
    console.log(enable);
        if (m==1){
        enableX=1;
        enableY=1;
        enableZ=1;
    }
    else{enableX=0;
         enableY=0;
         enableZ=0; }
    });  

rotateX.addEventListener('click', () =>{
        m *= -1;
                if (m==1){
                enableX=1;
            }
            else{enableX=0;}
            });    

rotateY.addEventListener('click',  () =>{
        m *= -1;
            if (m==1){
            enableY=1;
        }
        else{enableY=0;}
        });       
 
rotateZ.addEventListener('click', () =>{
        m *= -1;
        if (m==1){
        enableZ=1;
        }
        else{enableZ=0;}
        });                

moveLeft.addEventListener("click",()=>{ //this is used to rotate in all axises
    xs-=0.05;
    });           

moveRight.addEventListener('click',()=>{ //this is used to rotate in all axises
    xs+=0.05;
    }); 

moveDown.addEventListener('click',()=>{ //this is used to rotate in all axises
    ys-=0.05;
    });     
             
moveUp.addEventListener('click',()=>{ //this is used to rotate in all axises
    ys+=0.05;
    }); 
     

const vertices = new Float32Array([ //this is two calculate the cordinates of the vertices of the cube
   //front face
    -r,r,r,  -r,-r,r,    r,-r,r,
    r,r,r,   -r,r,r,    r,-r,r,
  
    //right face
    r,r,r,    r,-r,r,    r,r,-r,
    r,-r,r,   r,r,-r,   r,-r,-r,
    
    //back face
    -r,r,-r,  -r,-r,-r,   r,-r,-r,
    r,r,-r,  -r,r,-r,  r,-r,-r,

    //left face
    -r,r,r,    -r,-r,r,  -r,r,-r,
    -r,-r,r,   -r,r,-r,  -r,-r,-r,
    
    //bottom face
    -r,-r,r,   r,-r,r,   -r,-r,-r,
    -r,-r,-r,   r,-r,-r,   r,-r,r,

 //top face
    -r,r,r,      r,r,r,      -r,r,-r,
    -r,r,-r,     r,r,-r,       r,r,r,
]);

//the co-ordinates for the texture of the cube
const textCoords = new Float32Array([
    //front 
    0,1,   0,0,   1,0,  
    1,1,   0,1,   1,0,
   //right
    1,1,   0,1,   1,0,
    0,1,   1,0,   0,0,
    //back
    0,1,   0,0,   1,0,
    1,1,   0,1,   1,0,
    //left
    0,0,   1,0,   0,1,
    1,0,   0,1,   1,1,
   //bottom
    1,0,   0,0,   1,1,
    1,1,   0,1,   0,0,
   //top
    0,1,   1,1,   0,0,   //swopped
    0,0,   1,0,   1,1,
]);

let modela = createId();
let modelb = createId();
  
let rotationY = new Float32Array([]);
let rotationX = new Float32Array([]);
let rotationZ = new Float32Array([]);
rotationX = rotatX(Math.PI);
rotationY = rotatY(Math.PI);
rotationZ = rotatZ(Math.PI);
modela = matMult(modela,rotationY); 
modela = matMult(modela,rotationX);
modela = matMult(modela,rotationZ); 
modela = matMult(modela,TranslMat(xs,ys,zs));
 

const texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,texCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER,textCoords,gl.STATIC_DRAW);

//used in creating the texture
const texbuffer = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D,texbuffer);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image); //bind the image to the cube

const program = gl.createProgram();

const vertShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertShader,`
    attribute vec3 pos;
    attribute vec2 texture;
    varying vec2 fragTex;
    uniform float xshift;
    uniform float yshift;
    uniform float zshift;
    uniform mat4 model;
    void main(){
    gl_Position = model*vec4(pos,1);
    fragTex = texture;
  }`);
gl.compileShader(vertShader);
if(!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)){console.error("Error compiler vertexShader!",gl.getShaderInfoLog(vertShader));}

const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader,`
    precision mediump float;
    varying vec2 fragTex;
    uniform sampler2D fragSampler;
    void main(){
    gl_FragColor = texture2D(fragSampler,fragTex);
   }`);
   gl.compileShader(fragShader);
   if(!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)){console.error("Error compiler fragmentShader!",gl.getShaderInfoLog(fragShader));}

gl.attachShader(program,vertShader);
gl.attachShader(program,fragShader);
gl.linkProgram(program);
gl.useProgram(program);
gl.enable(gl.DEPTH_TEST);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);

const posLoc = gl.getAttribLocation(program,`pos`);
gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc,3,gl.FLOAT,false,0,0);
//6 for the number of elements xyz-rgb , 4 because a float carrries 4 bytes,,,, bytes per element

const texLoc = gl.getAttribLocation(program,`texture`);
gl.bindBuffer(gl.ARRAY_BUFFER,texCoordBuffer);
gl.enableVertexAttribArray(texLoc);
gl.vertexAttribPointer(texLoc,2,gl.FLOAT,false,0,0);


 gl.activeTexture(gl.TEXTURE0);
 gl.bindTexture(gl.TEXTURE_2D,texbuffer);
 gl.uniformMatrix4fv(gl.getUniformLocation(program,`model`),false,modela);

 gl.uniform1f(gl.getUniformLocation(program,`xshift`),xs);
 gl.uniform1f(gl.getUniformLocation(program,`yshift`),ys);
 gl.uniform1f(gl.getUniformLocation(program,`zshift`),zs);

 draw();


//***********************************FUNCTIONS******************************************************/
  
function draw(){
    var angleY =+  0.03*enableY*Math.PI/8;  //angle that you are using to rotate in Y
    var angleX =+  0.03*enableX*Math.PI/8;  //angle that you using to rotate in X
    var angleZ =+  0.03*enableZ*Math.PI/8;  //angle that youare using to rotate in Z


    modela = matMult(modela,rotationX); //need this because once angle is calculated rotationY changes hence changinf modelb
    modela = matMult(modela,rotationY);
    modela = matMult(modela,rotationZ);

    gl.uniformMatrix4fv(gl.getUniformLocation(program,`model`),false,modela);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.drawArrays(gl.TRIANGLES,0,vertices.length/3);
        
    rotationX = rotatX(angleX); //need this bcoz angle needs to be calculated everytime
    rotationY = rotatY(angleY); // we need this here because its the angle that makes the box spin so we need it to be constantly changing hence rotation
    rotationZ = rotatZ(angleZ);
    
    modela = matMult(modela,TranslMat(xs,ys,zs));

    //set the translation variables to 0 in this draw function so the box only moves onclick
    xs=0;
    ys=0;
    zs=0;
    gl.drawArrays(gl.TRIANGLES,0,vertices.length/3);
    window.requestAnimationFrame(draw);
}

function rotatY(thetaRad){ //this function creates the rotation matrix along the Y axis
   var c=Math.cos(thetaRad);
   var s=Math.sin(thetaRad);
   return new Float32Array([
    c,0,-s,0,
    0,1,0,0,
    s,0,c,0,
    0,0,0,1]);}
    
function rotatZ(thetaRad){ //this function creates the rotation matrix along the Z axis
    var c=Math.cos(thetaRad);
    var s=Math.sin(thetaRad);
    return new Float32Array([
       c,s,0,0,
      -s,c,0,0,
       0,0,1,0,
       0,0,0,1]);}

function createId(){              //this function creates the identity matrix
    return new Float32Array([
       1,0,0,0,                           
       0,1,0,0,
       0,0,1,0,
       0,0,0,1                                          
        ]);}

function rotatX(thetaRad){   //this function creates the rotation matrix along the X axis
    var c=Math.cos(thetaRad);
    var s=Math.sin(thetaRad);
        return new Float32Array([
            1,0,0,0,
            0,c,s,0,
            0,-s,c,0,
            0,0,0,1,
            ]);}

function TranslMat(tx,ty,tz){ //this function creates the translation matrix
    return new Float32Array([
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        tx,ty,tz,1,
        ])} 

function matMult(modela,rotationY){
    return new Float32Array([
        modela[0]*rotationY[0] + modela[1]*rotationY[4] + modela[2]*rotationY[8] + modela[3]*rotationY[12],
        modela[0]*rotationY[1] + modela[1]*rotationY[5] + modela[2]*rotationY[9] + modela[3]*rotationY[13],
        modela[0]*rotationY[2] + modela[1]*rotationY[6] + modela[2]*rotationY[10] + modela[3]*rotationY[14],
        modela[0]*rotationY[3] + modela[1]*rotationY[7] + modela[2]*rotationY[11] + modela[3]*rotationY[15],
            
        modela[4]*rotationY[0] + modela[5]*rotationY[4] + modela[6]*rotationY[8] + modela[7]*rotationY[12],
        modela[4]*rotationY[1] + modela[5]*rotationY[5] + modela[6]*rotationY[9] + modela[7]*rotationY[13],  
        modela[4]*rotationY[2] + modela[5]*rotationY[6] + modela[6]*rotationY[10] + modela[7]*rotationY[14],
        modela[4]*rotationY[3] + modela[5]*rotationY[7] + modela[6]*rotationY[11] + modela[7]*rotationY[15],

        modela[8]*rotationY[0] + modela[9]*rotationY[4] + modela[10]*rotationY[8] + modela[11]*rotationY[12],
        modela[8]*rotationY[1] + modela[9]*rotationY[5] + modela[10]*rotationY[9] + modela[11]*rotationY[13],
        modela[8]*rotationY[2] + modela[9]*rotationY[6] + modela[10]*rotationY[10] + modela[11]*rotationY[14],
        modela[8]*rotationY[3] + modela[9]*rotationY[7] + modela[10]*rotationY[11] + modela[11]*rotationY[15],
            
        modela[12]*rotationY[0] + modela[13]*rotationY[4] + modela[14]*rotationY[8] + modela[15]*rotationY[12],
        modela[12]*rotationY[1] + modela[13]*rotationY[5] + modela[14]*rotationY[9] + modela[15]*rotationY[13],
        modela[12]*rotationY[2] + modela[13]*rotationY[6] + modela[14]*rotationY[10] + modela[15]*rotationY[14],
        modela[12]*rotationY[3] + modela[13]*rotationY[7] + modela[14]*rotationY[11] + modela[15]*rotationY[15],
        ])}  

    /*****ALL THESE OTHER FUNCTIONS ARE NOT NEEDED REMEMBER ITS LIKE C ALL YOU NEED IS TO PASS VALUES */
           