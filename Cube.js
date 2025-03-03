class Cube{
    constructor(){
       this.color = [1.0, 1.0, 1.0, 1.0];
       this.matrix = new Matrix4();
       this.normalMatrix = new Matrix4();
       this.textureNum = -2;
    }
 
    render() {
      if (this.textureNum == 0) {
         gl.uniform1i(u_whichTexture, 0); 
     } else if (this.textureNum == 1) {
         gl.uniform1i(u_whichTexture, 1); 
     } else {
         gl.uniform1i(u_whichTexture, -2); 
     }
     
       var rgba = this.color;
       
 
       gl.uniform1i(u_whichTexture, this.textureNum);
 
       
       gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
 
      
       gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
 
       
       gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);
 
       
       drawTriangle3DUVNormal([0,0,0, 1,1,0, 1,0,0],[0,0, 1,1, 1,0], [0,0,-1, 0,0,-1, 0,0,-1]);
       drawTriangle3DUVNormal([0,0,0, 0,1,0, 1,1,0],[0,0, 0,1, 1,1], [0,0,-1, 0,0,-1, 0,0,-1]);
 
     
       drawTriangle3DUVNormal([1,1,0, 1,1,1, 0,1,0],[1,0, 1,1, 0,0], [0,1,0, 0,1,0, 0,1,0]);
       drawTriangle3DUVNormal([0,1,1, 1,1,1, 0,1,0],[0,1, 1,1, 0,0], [0,1,0, 0,1,0, 0,1,0]);
 
     
       drawTriangle3DUVNormal([1,0,0, 1,1,0, 1,1,1],[0,0, 0,1, 1,1], [1,0,0, 1,0,0, 1,0,0]);
       drawTriangle3DUVNormal([1,0,0, 1,0,1, 1,1,1],[0,0, 1,0, 1,1], [1,0,0, 1,0,0, 1,0,0]);
 
       
       drawTriangle3DUVNormal([0,0,0, 0,0,1, 0,1,1],[1,0, 0,0, 0,1], [-1,0,0, -1,0,0, -1,0,0]);
       drawTriangle3DUVNormal([0,0,0, 0,1,0, 0,1,1],[1,0, 1,1, 0,1], [-1,0,0, -1,0,0, -1,0,0]);
 
       
       drawTriangle3DUVNormal([0,0,0, 1,0,1, 1,0,0],[0,1, 1,0, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);
       drawTriangle3DUVNormal([0,0,0, 0,0,1, 1,0,1],[0,1, 0,0, 1,0], [0,-1,0, 0,-1,0, 0,-1,0]);
 
       
       drawTriangle3DUVNormal([1,0,1, 0,0,1, 0,1,1],[0,0, 1,0, 1,1], [0,0,1, 0,0,1, 0,0,1]);
       drawTriangle3DUVNormal([1,0,1, 1,1,1, 0,1,1],[0,1, 0,1, 1,1], [0,0,1, 0,0,1, 0,0,1]);
 
 
       gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
       }
 
       renderfast() {
          var rgba = this.color;
 
          gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
          gl.uniform1i(u_whichTexture, this.textureNum);
 
         
 
          
          gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
 
          var allverts = [];
         
          allverts = allverts.concat([0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0 ]);
          allverts = allverts.concat([0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0 ]);
          
          allverts = allverts.concat([0.0,0.0,1.0, 1.0,1.0,1.0, 1.0,0.0,1.0 ]);
          allverts = allverts.concat([0.0,0.0,1.0, 0.0,1.0,1.0, 1.0,1.0,1.0 ]);
          
          allverts = allverts.concat([0.0,1.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0 ]);
          allverts = allverts.concat([0.0,1.0,1.0, 0.0,1.0,0.0, 1.0,1.0,1.0 ]);
          
          allverts = allverts.concat([0.0,0.0,0.0, 0.0,0.0,1.0, 1.0,0.0,0.0 ]);
          allverts = allverts.concat([1.0,0.0,0.0, 1.0,0.0,1.0, 0.0,0.0,1.0 ]);
 
          
          allverts = allverts.concat([0.0,0.0,0.0, 0.0,1.0,0.0, 0.0,1.0,1.0 ]);
          allverts = allverts.concat([0.0,1.0,1.0, 0.0,0.0,0.0, 0.0,0.0,1.0 ]);
          
          allverts = allverts.concat([1.0,0.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0 ]);
          allverts = allverts.concat([1.0,1.0,1.0, 1.0,0.0,0.0, 1.0,0.0,1.0 ]);
 
          var alluvs=[
             0,0, 1,1, 1,0,
             0,0, 0,1, 1,1,
             1,0, 1,1, 0,0,
             0,1, 1,1, 0,0,
             0,0, 0,1, 1,1,
             0,0, 1,0, 1,1,
             1,0, 0,0, 0,1,
             1,0, 1,1, 0,1,
             0,1, 1,0, 1,1,
             0,1, 0,0, 1,0,
             0,0, 1,0, 1,1,
             0,1, 0,1, 1,1
          ];
 
          var allnorms = [
             0,0,-1, 0,0,-1, 0,0,-1,
             0,0,-1, 0,0,-1, 0,0,-1,
             0,1,0, 0,1,0, 0,1,0,
             0,1,0, 0,1,0, 0,1,0,
             1,0,0, 1,0,0, 1,0,0,
             1,0,0, 1,0,0, 1,0,0,
             -1,0,0, -1,0,0, -1,0,0,
             -1,0,0, -1,0,0, -1,0,0,
             0,-1,0, 0,-1,0, 0,-1,0,
             0,-1,0, 0,-1,0, 0,-1,0,
             0,0,1, 0,0,1, 0,0,1,
             0,0,1, 0,0,1, 0,0,1
          ];
 
          drawTriangle3DUVNormal(allverts, alluvs, allnorms);
          }
 
 }