
var gl;
var canvas;
var a_Position;
var a_UV;
var a_Normal;
var u_FragColor;
var u_Size;
var u_ModelMatrix;
var u_NormalMatrix;
var u_ProjectionMatrix;
var u_ViewMatrix;
var u_GlobalRotateMatrix;
var u_Sampler0;
var u_Sampler1;
var u_whichTexture;
var u_lightPos;
var u_cameraPos;
var g_lightColor = [1.0, 1.0, 1.0];
var g_spotlightOn = false;



var g_camera;


var gAnimalGlobalRotation = 0; 
var g_jointAngle = 0; 
var head_animation = 0;
var g_jointAngle2 = 0; 
var g_Animation = false; 
var g_normalOn = false;
var g_lightOn = true;
var g_lightPos = [0,1,1];


var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;



var VSHADER_SOURCE =`

   precision mediump float;
   attribute vec4 a_Position;
   attribute vec2 a_UV;
   attribute vec3 a_Normal;
   varying vec2 v_UV;
   varying vec3 v_Normal;
   varying vec4 v_VertPos;
   uniform mat4 u_ModelMatrix;
   uniform mat4 u_NormalMatrix;
   uniform mat4 u_GlobalRotateMatrix;
   uniform mat4 u_ViewMatrix;
   uniform mat4 u_ProjectionMatrix;
   void main() {
      gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
      v_UV = a_UV;
      v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
      v_VertPos = u_ModelMatrix * a_Position;
   }`


var FSHADER_SOURCE =`
    precision mediump float;
varying vec2 v_UV;
varying vec3 v_Normal;
uniform vec4 u_FragColor;
uniform vec3 u_lightColor;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform int u_whichTexture;
uniform vec3 u_lightPos;
uniform vec3 u_cameraPos;
uniform bool u_spotlightOn;
varying vec4 v_VertPos;
uniform bool u_lightOn;

void main() {
    // Texture Mapping
    if(u_whichTexture == -3){
        gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0); // Use normal
    } else if(u_whichTexture == -2){
        gl_FragColor = u_FragColor;                  // Use color
    } else if (u_whichTexture == -1){
        gl_FragColor = vec4(v_UV, 1.0, 1.0);         // Use UV debug color
    } else if(u_whichTexture == 0){
        gl_FragColor = texture2D(u_Sampler0, v_UV);  // Use texture0
    } else if(u_whichTexture == 1){
        gl_FragColor = texture2D(u_Sampler1, v_UV);  // Use texture1
    } else {
        gl_FragColor = vec4(1,.2,.2,1);              // Error, Red
    }

    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);

    // Spotlight Effect
    vec3 spotDirection = normalize(vec3(0.0, -1.0, 0.0)); // Spotlight faces downward
    float spotCutoff = cos(radians(15.0)); // 15-degree cutoff

    float spotEffect = dot(-L, spotDirection);
    if (u_spotlightOn && spotEffect < spotCutoff) {
        nDotL = 0.0; // Cut off light outside spotlight range
    }

    // Reflection for Specular Light
    vec3 R = reflect(-L, N);
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));
    float specular = pow(max(dot(E, R), 0.0), 10.0) * 0.5;

    // Lighting Components
    vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7 * u_lightColor;
    vec3 ambient = vec3(gl_FragColor) * 0.3;
    
    if (u_lightOn) {
        gl_FragColor = vec4(specular + diffuse + ambient, 1.0);
    }
}`


function addActionsForHtmlUI(){
  
   document.getElementById('camera').addEventListener('mousemove', function(ev) { if(ev.buttons == 1){ gAnimalGlobalRotation = this.value; renderScene();}});
   document.getElementById('lightx').addEventListener('mousemove', function(ev) { if(ev.buttons == 1){ g_lightPos[0] = this.value/100; renderScene();}});
   document.getElementById('lighty').addEventListener('mousemove', function(ev) { if(ev.buttons == 1){ g_lightPos[1] = this.value/100; renderScene();}});
   document.getElementById('lightz').addEventListener('mousemove', function(ev) { if(ev.buttons == 1){ g_lightPos[2] = this.value/100; renderScene();}});
   
   document.getElementById('animate_on').onclick = function() {g_Animation = true;};
   document.getElementById('animate_off').onclick = function() {g_Animation = false;};
   document.getElementById('normal_on').onclick = function() {g_normalOn = true;};
   document.getElementById('normal_off').onclick = function() {g_normalOn = false;};
   document.getElementById('light_on').onclick = function() {g_lightOn = true;};
   document.getElementById('light_off').onclick = function() {g_lightOn = false;};

   document.getElementById('redSlider').addEventListener('input', function() {
      g_lightColor[0] = parseFloat(this.value);
      renderScene();
   });

   document.getElementById('greenSlider').addEventListener('input', function() {
      g_lightColor[1] = parseFloat(this.value);
      renderScene();
   });

   document.getElementById('blueSlider').addEventListener('input', function() {
      g_lightColor[2] = parseFloat(this.value);
      renderScene();
   });

   document.getElementById('spotlightToggle').onclick = function() {
      g_spotlightOn = !g_spotlightOn;
      renderScene();
  };
  
}


function setupWebGL(){
   
   canvas = document.getElementById('asg4');
   if (!canvas) {
       console.log('Failed to retrieve the <canvas> element');
       return;
   }

   
   gl = getWebGLContext(canvas);
   if(!gl){
       console.log('Failed to get the rendering context for WebGL');
       return;
   }

   gl.enable(gl.DEPTH_TEST);
}


function connectVariablesToGLSL(){
   
   if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
       console.log('Failed to intialize shaders.');
       return;
   }

   
   a_Position = gl.getAttribLocation(gl.program, 'a_Position');
   if (a_Position < 0) {
       console.log('Failed to get the storage location of a_Position');
       return;
   }

   a_UV = gl.getAttribLocation(gl.program, 'a_UV');
   if (a_UV < 0) {
       console.log('Failed to get the storage location of a_UV');
       return;
   }

   a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
   if (a_Normal < 0) {
       console.log('Failed to get the storage location of a_Normal');
       return;
   }

  
   u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
   if (!u_whichTexture) {
       console.log('Failed to get u_whichTexture');
       return;
   }

  
   u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
   if (!u_lightOn) {
       console.log('Failed to get u_lightOn');
       return;
   }


   
   u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
   if (!u_FragColor) {
       console.log('Failed to get u_FragColor');
       return;
   }

   
   u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
   if (!u_lightPos) {
       console.log('Failed to get u_lightPos');
       return;
   }

   
   u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
   if (!u_cameraPos) {
       console.log('Failed to get u_cameraPos');
       return;
   }

   u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
   if (!u_ModelMatrix) {
       console.log('Failed to get u_ModelMatrix');
       return;
   }

   u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
   if (!u_GlobalRotateMatrix) {
       console.log('Failed to get u_GlobalRotateMatrix');
       return;
   }

   u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
   if (!u_ViewMatrix) {
       console.log('Failed to get u_ViewMatrix');
       return;
   }

   u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
   if (!u_NormalMatrix) {
       console.log('Failed to get u_NormalMatrix');
       return;
   }

   u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
   if (!u_ProjectionMatrix) {
       console.log('Failed to get u_ProjectionMatrix');
       return;
   }

   
   u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
   if (!u_Sampler0) {
     console.log('Failed to get the storage location of u_Sampler0');
     return false;
   }

   u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
   if (!u_Sampler1) {
     console.log('Failed to get the storage location of u_Sampler1');
     return false;
   }

   u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
   if (!u_lightColor) {
      console.log('Failed to get u_lightColor');
      return;
   }

   u_spotlightOn = gl.getUniformLocation(gl.program, 'u_spotlightOn');
   if (!u_spotlightOn) {
      console.log('Failed to get u_spotlightOn');
      return;
   }



   var identityM = new Matrix4();
   gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}


function initTextures() {
   var image = new Image();  
   var image1 = new Image();  
   if (!image) {
      console.log('Failed to create the image object');
      return false;
   }
   if (!image1) {
      console.log('Failed to create the image1 object');
      return false;
   }
  
   image.onload = function(){ sendTextureToTEXTURE0(image); };
   image1.onload = function(){ sendTextureToTEXTURE1(image1); };
   
   image.src = 'minecraftbrick.jpeg'
   image1.src = 'sky.jpeg';


   return true;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

function sendTextureToTEXTURE0(image) {
   var texture = gl.createTexture();
   if(!texture){
      console.log('Failed to create the texture object');
      return false;
   }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 
  
  gl.activeTexture(gl.TEXTURE0);
  
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
     gl.generateMipmap(gl.TEXTURE_2D);
  } else {
     // Set the texture parameters
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }

  
  gl.uniform1i(u_Sampler0, 0);


  console.log("Finished loadTexture");
}

function sendTextureToTEXTURE1(image) {
   var texture = gl.createTexture();
   if (!texture) {
      console.log('Failed to create the texture object');
      return false;
   }

   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y-axis
   gl.activeTexture(gl.TEXTURE1);
   gl.bindTexture(gl.TEXTURE_2D, texture);
   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

   if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
   } else {
      // Set texture parameters for non-power-of-2 images
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
   }

   

   console.log("Sky texture loaded successfully!");
}

  


  console.log("Finished loadTexture1");


function main() {
   setupWebGL();
   connectVariablesToGLSL();
   addActionsForHtmlUI();

   g_camera = new Camera();
   document.onkeydown = keydown;

   initTextures();

  
   gl.clearColor(0.0, 0.0, 0.0, 1.0);

   requestAnimationFrame(tick);
} 



function convertCoordinatesEventToGL(ev){
   var x = ev.clientX; 
   var y = ev.clientY; 
   var rect = ev.target.getBoundingClientRect() ;

   
   x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
   y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);


   return [x,y];
}

function mouseCam(ev){
   coord = convertCoordinatesEventToGL(ev);
   if(coord[0] < 0.5){ 
      g_camera.panMLeft(coord[0]*-10);
   } else{
      g_camera.panMRight(coord[0]*-10);
   }
}

function keydown(ev){
   if(ev.keyCode==39 || ev.keyCode == 68){ 
      g_camera.left();  
   } else if (ev.keyCode==37 || ev.keyCode == 65){ 
      g_camera.right();  
   } else if (ev.keyCode==38 || ev.keyCode == 87){ 
      g_camera.forward();
   } else if (ev.keyCode==40 || ev.keyCode == 83){ 
      g_camera.back();
   } else if (ev.keyCode==81){ 
      g_camera.panLeft();
   } else if (ev.keyCode==69){ 
      g_camera.panRight();
   }
   renderScene();
}

function drawBlueCube() {
   var blueCube = new Cube();  
   blueCube.color = [0.0, 0.0, 1.0, 1.0]; 
   blueCube.textureNum = -2; 

   
   blueCube.matrix.translate(-1, 0, 0);
   blueCube.matrix.scale(.5, .5, .5); 

   
   blueCube.render();
}

function drawSphere() {
   var sphere = new Sphere(); 
   sphere.color = [1.0, 0.5, 0.0, 1.0]; 
   sphere.textureNum = -2;

  
   sphere.matrix.translate(1, 0.5, -2);
   sphere.matrix.scale(0.5, 0.5, 0.5);

   sphere.render();
}

function drawLightMarker() {
   var marker = new Cube();
   marker.color = [1.0, 1.0, 0.0, 1.0]; 
   marker.textureNum = -2;

  
   marker.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
   marker.matrix.scale(0.1, 0.1, 0.1); 

   marker.render();
}




function tick(){
   g_seconds = performance.now()/1000.0 - g_startTime;
   updateAnimationAngles();
   renderScene();
   requestAnimationFrame(tick);
}



function renderScene(){
   if (!u_lightColor) {
      console.log("u_lightColor is not set. Skipping render.");
      return;
  }

  gl.uniform3fv(u_lightColor, g_lightColor);
  
   var projMat = g_camera.projMat;
   gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

   
   var viewMat = g_camera.viewMat;
   gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

   
   var globalRotMat = new Matrix4().rotate(gAnimalGlobalRotation, 0,1,0);
   gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

   
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   gl.clear(gl.COLOR_BUFFER_BIT);

   
   gl.uniform1i(u_whichTexture, 0); 
   drawSkybox();

   
   gl.uniform1i(u_whichTexture, 1); 
   drawGround();

   gl.uniform1i(u_spotlightOn, g_spotlightOn);

   
   drawAllShapes();
   drawBlueCube();
   drawSphere();
   drawLightMarker();
   


}


function drawSkybox() {
   var sky = new Cube(); 
   sky.color = [1, 1, 1, 1]; 
   sky.textureNum = 0; 
   sky.matrix.translate(0, 5, -15);  
   sky.matrix.scale(50, 50, 1);  
   sky.render();
}
function drawGround() {
   var ground = new Cube();  
   ground.color = [1, 1, 1, 1]; 
   ground.textureNum = 1; 
   ground.matrix.translate(0, -2, 0); 
   ground.matrix.scale(20, 0.1, 20);  
   ground.render();
}

function updateAnimationAngles(){
   if(g_Animation){
      g_jointAngle = 10*Math.sin(g_seconds);
      head_animation = 15*Math.sin(g_seconds);
   }
   g_lightPos[0]=2*cos(g_seconds);
}