'use strict';

let gl;                         // The webgl context.
let surface;                    // A surface model
let shProgram;                  // A shader program
let spaceball;                  // A SimpleRotator object that lets the user rotate the view by mouse.
let sphere;
let pS = [0.7, 0.3]

let diffTex = null
let normTex = null
let specTex = null

function deg2rad(angle) {
    return angle * Math.PI / 180;
}


// Constructor
function Model(name) {
    this.name = name;

    // Buffers
    this.iVertexBuffer = gl.createBuffer();
    this.iNormalBuffer = gl.createBuffer();
    this.iTangentBuffer = gl.createBuffer();
    this.iBitangentBuffer = gl.createBuffer();
    this.iTextureBuffer = gl.createBuffer();
    this.iIndexBuffer = gl.createBuffer(); // Index buffer
    this.count = 0;

    // Method to set vertex data
    this.BufferData = function (vertices, indices, normals, tangent, bitanangent, textures) {
        // Bind and upload vertex data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTangentBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tangent), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iBitangentBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bitanangent), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTextureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textures), gl.STATIC_DRAW);

        // Bind and upload index data
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.count = indices.length; // Total indices for drawing
    };

    // Method to draw the object
    this.Draw = function () {
        // Bind the vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.iVertexBuffer);
        gl.vertexAttribPointer(shProgram.iAttribVertex, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribVertex);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iNormalBuffer);
        gl.vertexAttribPointer(shProgram.iAttribNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribNormal);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTangentBuffer);
        gl.vertexAttribPointer(shProgram.iAttribTangent, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribTangent);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iBitangentBuffer);
        gl.vertexAttribPointer(shProgram.iAttribBitangent, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribBitangent);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.iTextureBuffer);
        gl.vertexAttribPointer(shProgram.iAttribTexture, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(shProgram.iAttribTexture);

        // Bind the index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iIndexBuffer);

        // Draw the model using TRIANGLE_STRIP
        // gl.drawElements(gl.LINE_STRIP, this.count, gl.UNSIGNED_SHORT, 0);
        // gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
        gl.drawElements(gl.TRIANGLE_STRIP, this.count, gl.UNSIGNED_SHORT, 0);
        // gl.uniform4fv(shProgram.iColor, [0, 1, 0, 1]);
        // gl.drawElements(gl.LINE_STRIP, this.count, gl.UNSIGNED_SHORT, 0);
    };
}

function draw2() {
    draw()
    window.requestAnimationFrame(draw2)
}



// Constructor
function ShaderProgram(name, program) {

    this.name = name;
    this.prog = program;

    // Location of the attribute variable in the shader program.
    this.iAttribVertex = -1;

    this.iAttribNormal = -1;

    this.iAttribTexture = -1;
    // Location of the uniform specifying a color for the primitive.
    this.iColor = -1;
    this.iLightPos = -1;
    // Location of the uniform matrix representing the combined transformation.
    this.iModelViewProjectionMatrix = -1;
    this.iModelViewMatrix = -1;
    this.iProjectionMatrix = -1;
    this.iNormalMatrix = -1;

    this.Use = function () {
        gl.useProgram(this.prog);
    }
}


/* Draws a colored cube, along with a set of coordinate axes.
 * (Note that the use of the above drawPrimitive function is not an efficient
 * way to draw with WebGL.  Here, the geometry is so simple that it doesn't matter.)
 */
function draw() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /* Set the values of the projection transformation */
    let projection = m4.perspective(Math.PI / 8, 1, 8, 12);

    /* Get the view matrix from the SimpleRotator object.*/
    let modelView = spaceball.getViewMatrix();

    let rotateToPointZero = m4.axisRotation([0.707, 0.707, 0], 0.7);
    let translateToPointZero = m4.translation(0, 0, -10);

    let matAccum0 = m4.multiply(rotateToPointZero, modelView);
    let matAccum1 = m4.multiply(translateToPointZero, matAccum0);

    /* Multiply the projection matrix times the modelview matrix to give the
       combined transformation matrix, and send that to the shader program. */
    let modelViewProjection = m4.multiply(projection, matAccum1);
    let modelviewInv = new Float32Array(16);
    modelviewInv = m4.inverse(modelView)
    const normalMatrix = m4.transpose(modelviewInv)

    gl.uniformMatrix4fv(shProgram.iModelViewProjectionMatrix, false, modelViewProjection);
    gl.uniformMatrix4fv(shProgram.iModelViewMatrix, false, matAccum1);
    gl.uniformMatrix4fv(shProgram.iProjectionMatrix, false, projection);
    gl.uniformMatrix4fv(shProgram.iNormalMatrix, false, normalMatrix);

    /* Draw the six faces of a cube, with different colors. */
    gl.uniform4fv(shProgram.iColor, [1, 1, 0, 1]);

    const t = Date.now() * 0.002
    gl.uniform3fv(shProgram.iLightPos, m4.transformPoint(modelView, [3 * sin(t), 3 * cos(t), 0]).slice(0, 3));

    const uStepValue = document.getElementById('uStep').value
    const vStepValue = document.getElementById('vStep').value
    // console.log(uStepValue, vStepValue)
    surface.BufferData(...CreateSurfaceData2(parseFloat(uStepValue), parseFloat(vStepValue)));

    const rotValue = document.getElementById('rotId').value
    gl.uniform1f(shProgram.iRotValue, parseFloat(rotValue))
    gl.uniform2fv(shProgram.iP, [pS[0], (pS[1] + 5) / 10])
    // console.log(rotValue)
    assignTextures(gl, shProgram, diffTex, normTex, specTex)
    // prioritizing tangent
    gl.uniform1i(shProgram.iPN, false);
    surface.Draw();

    gl.uniform4fv(shProgram.iColor, [0, 0, 1, 1]);
    const v = twiceObliqueTrochoidCylindroid(...pS)
    gl.uniformMatrix4fv(shProgram.iModelViewMatrix, false, m4.multiply(matAccum1, m4.translation(v.x, v.y, v.z)));
    sphere.Draw();
}

function CreateSurfaceData() {
    let vertexList = [];

    for (let i = 0; i < 360; i += 5) {
        vertexList.push(Math.sin(deg2rad(i)), 1, Math.cos(deg2rad(i)));
        vertexList.push(Math.sin(deg2rad(i)), 0, Math.cos(deg2rad(i)));
    }

    return vertexList;
}


/* Initialize the WebGL context. Called from init() */
function initGL() {
    let prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);

    shProgram = new ShaderProgram('Basic', prog);
    shProgram.Use();

    shProgram.iAttribVertex = gl.getAttribLocation(prog, "vertex");
    shProgram.iAttribNormal = gl.getAttribLocation(prog, "normal");
    shProgram.iAttribTangent = gl.getAttribLocation(prog, "tangent");
    shProgram.iAttribBitangent = gl.getAttribLocation(prog, "bitangent");
    shProgram.iAttribTexture = gl.getAttribLocation(prog, "texture");
    shProgram.iModelViewProjectionMatrix = gl.getUniformLocation(prog, "ModelViewProjectionMatrix");
    shProgram.iModelViewMatrix = gl.getUniformLocation(prog, "ModelViewMatrix");
    shProgram.iProjectionMatrix = gl.getUniformLocation(prog, "ProjectionMatrix");
    shProgram.iNormalMatrix = gl.getUniformLocation(prog, "NormalMatrix");
    shProgram.iColor = gl.getUniformLocation(prog, "color");
    shProgram.iLightPos = gl.getUniformLocation(prog, "lightPos");
    shProgram.iP = gl.getUniformLocation(prog, "pS");
    shProgram.iRotValue = gl.getUniformLocation(prog, "rotValue");
    shProgram.iDiffTex = gl.getUniformLocation(prog, "diffTex");
    shProgram.iNormTex = gl.getUniformLocation(prog, "normTex");
    shProgram.iSpecTex = gl.getUniformLocation(prog, "specTex");
    shProgram.iPN = gl.getUniformLocation(prog, "prioritizeNormal");

    surface = new Model('Surface');
    surface.BufferData(...CreateSurfaceData2());
    sphere = new Model('Sphere');
    sphere.BufferData(...CreateSphereData());

    gl.enable(gl.DEPTH_TEST);
}


/* Creates a program for use in the WebGL context gl, and returns the
 * identifier for that program.  If an error occurs while compiling or
 * linking the program, an exception of type Error is thrown.  The error
 * string contains the compilation or linking error.  If no error occurs,
 * the program identifier is the return value of the function.
 * The second and third parameters are strings that contain the
 * source code for the vertex shader and for the fragment shader.
 */
function createProgram(gl, vShader, fShader) {
    let vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsh, vShader);
    gl.compileShader(vsh);
    if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
        throw new Error("Error in vertex shader:  " + gl.getShaderInfoLog(vsh));
    }
    let fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh, fShader);
    gl.compileShader(fsh);
    if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
        throw new Error("Error in fragment shader:  " + gl.getShaderInfoLog(fsh));
    }
    let prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error("Link error in program:  " + gl.getProgramInfoLog(prog));
    }
    return prog;
}


/**
 * initialization function that will be called when the page has loaded
 */
function init() {
    let canvas;
    try {
        canvas = document.getElementById("webglcanvas");
        gl = canvas.getContext("webgl");
        if (!gl) {
            throw "Browser does not support WebGL";
        }
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }
    try {
        initGL();  // initialize the WebGL graphics context
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context: " + e + "</p>";
        return;
    }

    spaceball = new TrackballRotator(canvas, draw, 0);

    diffTex = LoadTexture(img1)
    normTex = LoadTexture(img2)
    specTex = LoadTexture(img3)
    // draw();
    draw2();
}

// Assuming the textures are already loaded and created
function assignTextures(gl, shProgram, diffTex, normTex, specTex) {
    // Bind and assign the diffuse texture (diffTex) to texture unit 0
    gl.activeTexture(gl.TEXTURE0); // Activate texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, diffTex); // Bind the diffuse texture
    gl.uniform1i(shProgram.iDiffTex, 0); // Set the sampler to use texture unit 0

    // Bind and assign the normal texture (normTex) to texture unit 1
    gl.activeTexture(gl.TEXTURE1); // Activate texture unit 1
    gl.bindTexture(gl.TEXTURE_2D, normTex); // Bind the normal texture
    gl.uniform1i(shProgram.iNormTex, 1); // Set the sampler to use texture unit 1

    // Bind and assign the specular texture (specTex) to texture unit 2
    gl.activeTexture(gl.TEXTURE2); // Activate texture unit 2
    gl.bindTexture(gl.TEXTURE_2D, specTex); // Bind the specular texture
    gl.uniform1i(shProgram.iSpecTex, 2); // Set the sampler to use texture unit 2
}


function LoadTexture(src) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const image = new Image();
    image.crossOrigin = 'anonymus';
    image.src = src
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
        );
        console.log("imageLoaded")
        draw()
    }
    return texture;
}


window.onkeydown = (e) => {
    if (e.keyCode == 87) { //w V
        pS[1] = min(pS[1] + 0.2, 5);
    }
    else if (e.keyCode == 65) { //a U
        pS[0] = max(pS[0] - 0.02, 0);
    }
    else if (e.keyCode == 83) { //s V
        pS[1] = max(pS[1] - 0.2, -5);
    }
    else if (e.keyCode == 68) { //d U
        pS[0] = min(pS[0] + 0.02, 1);
    }
}