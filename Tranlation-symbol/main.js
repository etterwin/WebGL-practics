"use strict";

function main() {

    /** @type {HTMLCanvasElement} */
    let canvas = document.getElementById("canvas");
    let gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    let program =  webglUtils.createProgramFromScripts(gl, ["2d-vertex-shader", "2d-fragment-shader"]); // call func

    let position_attribute_location = gl.getAttribLocation(program, "a_position"); // find the location of the attribute for the program

    let resolution_uniform_location = gl.getUniformLocation(program, "u_resolution"); // find the location of the uniform for the program
    let color_uniform_location = gl.getUniformLocation(program, "u_color"); // find the location of the uniform color
    let translation_location = gl.getUniformLocation(program, "u_translation");

    let position_buffer = gl.createBuffer(); // create buffer

    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer); // bind the position buffer

    // set params
    let translation = [0, 0];
    let width = 100;
    let height = 30;
    let color = [Math.random(), Math.random(), Math.random(), 1];

    drawScene();

    // setup a UI
    webglLessonsUI.setupSlider("#x", {slide: updatePosition(0), max: gl.canvas.width });
    webglLessonsUI.setupSlider("#y", {slide: updatePosition(1), max: gl.canvas.height});

    function updatePosition(index) {
        return function (e, ui) {
            translation[index] = ui.value;
            drawScene();
        }
    }

    function drawScene() {
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        // tell WebGL gow to convert from clip space to pixels
        gl.viewport(0,0, gl.canvas.width, gl.canvas.height);

        // clear the canvas
        gl.clear(gl.COLOR_BUFFER_BIT);

        // tell it to use our program (pair of shaders)
        gl.useProgram(program);

        // turn on the attribute
        gl.enableVertexAttribArray(position_attribute_location);

        // bind the position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);

        // compute new geometry and put in the positionBuffer
        setGeometry(gl, translation[0], translation[1]);

        // tell the attribute how to get data u=out of position_buffer (ARRAY_BUFFER)
        let size = 2;          // 2 components per iteration
        let type = gl.FLOAT;   // the data is 32bit floats
        let normalize = false; // don't normalize the data
        let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        let offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(position_attribute_location, size, type, normalize, stride, offset);

        // set the resolution
        gl.uniform2f(resolution_uniform_location, gl.canvas.width, gl.canvas.height);

        // set the color
        gl.uniform4fv(color_uniform_location, color);

        // set the translation
        gl.uniform2fv(translation_location, translation);

        // draw the geometry
        let primitive_type = gl.TRIANGLES;
        let offset_triangles = 0;
        let count = 6;
        gl.drawArrays(primitive_type, offset_triangles, count);
    }

}

// Fill the buffer with the values that define a rectangle.
function setGeometry(gl, x, y) {
    let width = 100;
    let height = 150;
    let thickness = 30;
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            // left column
            x, y,
            x + thickness, y,
            x, y + height,
            x, y + height,
            x + thickness, y,
            x + thickness, y + height,

            // top rung
            x + thickness, y,
            x + width, y,
            x + thickness, y + thickness,
            x + thickness, y + thickness,
            x + width, y,
            x + width, y + thickness,

            // middle rung
            x + thickness, y + thickness * 2,
            x + width * 2 / 3, y + thickness * 2,
            x + thickness, y + thickness * 3,
            x + thickness, y + thickness * 3,
            x + width * 2 / 3, y + thickness * 2,
            x + width * 2 / 3, y + thickness * 3]),
        gl.STATIC_DRAW);
}

main();
