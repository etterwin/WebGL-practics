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
    let matrix_location = gl.getUniformLocation(program, "u_matrix"); // find the location of the matrix for the program

    let position_buffer = gl.createBuffer(); // create buffer

    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer); // bind the position buffer

    setGeometry(gl);

    // set params
    let translation = [100, 150];
    let angle_in_radians = 0;
    let scale = [1, 1];
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
        angle_in_radians = angle_in_degrees * Math.PI / 180;

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

        // compute the matrices
        let translation_matrix = m3.translation(translation[0], translation[1]);
        let rotation_matrix = m3.rotation(angle_in_radians);
        let scale_matrix = m3.scaling(scale[0], scale[1]);

        // multiply the matrices
        let matrix = m3.multiply(translation_matrix, rotation_matrix);
        matrix = m3.multiply(matrix, scale_matrix);

        // set the matrix
        gl.uniformMatrix3fv(matrix_location, false, matrix);

        // draw the rectangle
        let primitive_type = gl.TRIANGLES;
        let offset_triangles = 0;
        let count = 18; // 6 triangles in the 'F', 3 points per triangle
        gl.drawArrays(primitive_type, offset_triangles, count);
    }

}

// matrices for translation, rotation and scale
let m3 = {
    translation: function (tx, ty) {
        return [
            1, 0, 0,
            0, 1, 0,
            tx, ty, 1,
        ];
    },

    rotation: function (angle_in_radians) {
        let c = Math.cos(angle_in_radians);
        let s = Math.sin(angle_in_radians);
        return [
            c, -s, 0,
            s, c, 0,
            0, 0, 1,
        ];
    },

    scaling: function (sx, sy) {
        return [
            sx, 0, 0,
            0, sy, 0,
            0, 0, 1,
        ];
    },

    multiply: function(a, b) {
        let a00 = a[0 * 3 + 0];
        let a01 = a[0 * 3 + 1];
        let a02 = a[0 * 3 + 2];
        let a10 = a[1 * 3 + 0];
        let a11 = a[1 * 3 + 1];
        let a12 = a[1 * 3 + 2];
        let a20 = a[2 * 3 + 0];
        let a21 = a[2 * 3 + 1];
        let a22 = a[2 * 3 + 2];
        let b00 = b[0 * 3 + 0];
        let b01 = b[0 * 3 + 1];
        let b02 = b[0 * 3 + 2];
        let b10 = b[1 * 3 + 0];
        let b11 = b[1 * 3 + 1];
        let b12 = b[1 * 3 + 2];
        let b20 = b[2 * 3 + 0];
        let b21 = b[2 * 3 + 1];
        let b22 = b[2 * 3 + 2];
        return [
            b00 * a00 + b01 * a10 + b02 * a20,
            b00 * a01 + b01 * a11 + b02 * a21,
            b00 * a02 + b01 * a12 + b02 * a22,
            b10 * a00 + b11 * a10 + b12 * a20,
            b10 * a01 + b11 * a11 + b12 * a21,
            b10 * a02 + b11 * a12 + b12 * a22,
            b20 * a00 + b21 * a10 + b22 * a20,
            b20 * a01 + b21 * a11 + b22 * a21,
            b20 * a02 + b21 * a12 + b22 * a22,
        ];
    },
};

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
