var g_map = [];

function drawMap() {
    for (let x = 0; x < 32; x++) {
        for (let y = 0; y < 32; y++) {
            let wall = new Cube();
            wall.textureNum = -2;
            wall.matrix.scale(0.25, (x === 0 || x === 31 || y === 0 || y === 31) && (x % 4 !== 0 || y % 4 !== 0) ? 0.73 : 0.25, 0.25);
            wall.matrix.translate(x - 16, -0.25, y - 16);
            
            if ((x === 0 || x === 31) && y % 4 === 0 || (y === 0 || y === 31) && x % 4 === 0) {
                wall.color = [0.80, 0.70, 0.40, 1.0];
            } else {
                wall.color = [0.60, 0.40, 0.20, 1.0];
            }
            
            wall.render();
        }
    }
}

function drawAllShapes() {
    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    gl.uniform3f(u_cameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
    gl.uniform1i(u_lightOn, g_lightOn);

    let sphere = new Sphere();
    sphere.color = [0.9, 0.6, 0.95, 1];
    sphere.textureNum = g_normalOn ? -3 : 0;
    sphere.matrix.scale(0.5, 0.5, 0.5);
    sphere.matrix.translate(3, 0.75, -1.25);
    sphere.render();

    let light = new Cube();
    light.color = [6, 5, 0, 1];
    light.matrix.translate(g_lightPos[5], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(-0.1, -0.1, -0.1);
    light.matrix.translate(-0.5, -0.5, -0.5);
    light.renderfast();

    let sky = new Cube();
    sky.color = [0.8, 0.1, 0.95, 1];
    sky.textureNum = g_normalOn ? -3 : 1;
    sky.matrix.scale(-10, -10, -10);
    sky.matrix.translate(-0.5, -0.5, -0.5);
    sky.render();

    let floor = new Cube();
    floor.color = [0.2, 0.9, 0.4, 1];
    floor.textureNum = 1;
    floor.matrix.translate(0, -0.25, 0);
    floor.matrix.scale(10, 0, 10);
    floor.matrix.translate(-0.5, 0, -0.5);
    floor.render();
}
