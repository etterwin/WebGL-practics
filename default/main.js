"use strict";

// All of this is initialization code


// creating shaders func
function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}


// create link func
function createProgram(gl, vertex_shader, fragment_shader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertex_shader);
    gl.attachShader(program, fragment_shader);
    gl.linkProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function main() {

    let canvas = document.getElementById("canvas");
    let gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    let vertex_shader_source = document.getElementById('2d-vertex-shader').text;
    let fragment_shader_source = document.getElementById('2d-fragment-shader').text;

// create shaders
    let vertex_shader = createShader(gl, gl.VERTEX_SHADER, vertex_shader_source);
    let fragment_shader = createShader(gl, gl.FRAGMENT_SHADER, fragment_shader_source);


    let program = createProgram(gl, vertex_shader, fragment_shader); // call func

    let position_attribute_location = gl.getAttribLocation(program, "a_position"); // find the location of the attribute for the program

    let position_buffer = gl.createBuffer(); // create buffer

    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer); // bind the position buffer

    let positions = [
        0, 0,
        0, 0.5,
        0.7, 0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW); // put data in the buffer

    webglUtils.resizeCanvasToDisplaySize(gl.canvas); // tell WebGL how to convert from the clip space values

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // pass current size of the canvas

// clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

// tell it to use our program (pair of shaders)
    gl.useProgram(program);

// tell WebGL how to take data from the buffer, turn the attribute on
    gl.enableVertexAttribArray(position_attribute_location);

// Specify how to pull the data out
    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer); // bind the position buffer

// tell the attribute hot to get data out of position_buffer (ARRAY_BUFFER)
    let size = 2;           // 2 components per iteration
    let type = gl.FLOAT;    // the data is 32bit floats
    let normalize = false;  // don't normalize the data
    let stride = 0;         // 0 = move forward size * sizeof(type) each iteration to get the next positions
    let offset = 0;         // start at the begining of the buffer
    gl.vertexAttribPointer(position_attribute_location, size, type, normalize, stride, offset); // bind the current ARRAY_BUFFER to the attribute

// execute GLSL program
    let primitive_type = gl.TRIANGLES;
    let offset_new = 0;
    let count = 3;
    gl.drawArrays(primitive_type, offset_new, count);
}

main();
