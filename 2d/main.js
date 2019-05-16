"use strict";

function main() {

    let canvas = document.getElementById("c");
    let gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    let program =  webglUtils.createProgramFromScripts(gl, ["2d-vertex-shader", "2d-fragment-shader"]); // call func

    let position_attribute_location = gl.getAttribLocation(program, "a_position"); // find the location of the attribute for the program

    let resolution_uniform_location = gl.getUniformLocation(program, "u_resolution"); // find the location of the uniform for the program

    let position_buffer = gl.createBuffer(); // create buffer

    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer); // bind the position buffer

    let positions = [
        10, 20,
        80, 20,
        10, 30,
        10, 30,
        80, 20,
        80, 30,
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

    // set the resolution
    gl.uniform2f(resolution_uniform_location, gl.canvas.width, gl.canvas.height);

    // execute GLSL program, draw
    let primitive_type = gl.TRIANGLES;
    let offset_new = 0;
    let count = 6;
    gl.drawArrays(primitive_type, offset_new, count);
}

main();
