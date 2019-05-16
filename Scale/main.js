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
    let rotation_location = gl.getUniformLocation(program, "u_rotation");
    let scale_location = gl.getUniformLocation(program, "u_scale");

    let position_buffer = gl.createBuffer(); // create buffer

    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer); // bind the position buffer

    setGeometry(gl);

    // set params
    let translation = [0, 0];
    let rotation = [0, 1];
    let scale = [1, 1];
    let width = 100;
    let height = 30;
    let color = [Math.random(), Math.random(), Math.random(), 1];

    drawScene();

    // setup a UI
    webglLessonsUI.setupSlider("#x", {slide: updatePosition(0), max: gl.canvas.width });
    webglLessonsUI.setupSlider("#y", {slide: updatePosition(1), max: gl.canvas.height});
    webglLessonsUI.setupSlider("#angle", {slide: updateAngle, max: 360});
    webglLessonsUI.setupSlider("#scaleX", {value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2});
    webglLessonsUI.setupSlider("#scaleY", {value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2});

    function updatePosition(index) {
        return function (e, ui) {
            translation[index] = ui.value;
            drawScene();
        }
    }

    function updateAngle(e, ui) {
        let angle_in_degrees = 360 - ui.value;
        let angle_in_radians = angle_in_degrees * Math.PI / 180;

        rotation[0] = Math.sin(angle_in_radians);
        rotation[1] = Math.cos(angle_in_radians);
        drawScene();
    }

    function updateScale(index) {
        return function (e, ui) {
            scale[index] = ui.value;
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

        // set the rotation
        gl.uniform2fv(rotation_location, rotation);

        // set the scale
        gl.uniform2fv(scale_location, scale);

        // draw the geometry
        let primitive_type = gl.TRIANGLES;
        let offset_triangles = 0;
        let count = 18; // 6 triangles in the 'F', 3 points per triangle
        gl.drawArrays(primitive_type, offset_triangles, count);
    }

}

// Fill the buffer with the values that define a rectangle.
function setGeometry(gl) {

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            // left column
            0, 0,
            30, 0,
            0, 150,
            0, 150,
            30, 0,
            30, 150,

            // top rung
            30, 0,
            100, 0,
            30, 30,
            30, 30,
            100, 0,
            100, 30,

            // middle rung
            30, 60,
            67, 60,
            30, 90,
            30, 90,
            67, 60,
            67, 90,
        ]),
        gl.STATIC_DRAW);
}

main();
