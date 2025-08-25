// webglRenderer.js - Renderiza el contenido del canvas 2D en una textura WebGL
import { mat4 } from 'https://cdn.jsdelivr.net/npm/gl-matrix@3.4.3/esm/index.js';
import { contextWebGL } from './racer.js';

// Usar contextWebGL en lugar de gl
let program;
let renderTexture;
let quadBuffer;
let textureCoordBuffer;
let indexBuffer;

// // Shader para renderizar una textura con inversión de colores
// const vsSource = `
//   attribute vec4 aVertexPosition;
//   attribute vec2 aTextureCoord;

//   varying highp vec2 vTextureCoord;

//   void main(void) {
//     gl_Position = aVertexPosition;
//     vTextureCoord = aTextureCoord;
//   }
// `;

// // Shader de fragmento con inversión de colores
// const fsSource = `
//   precision mediump float;
//   varying highp vec2 vTextureCoord;
//   uniform sampler2D uSampler;

//   void main(void) {
//     vec4 color = texture2D(uSampler, vTextureCoord);

//     // Invertir los colores
//     vec3 invertedColor = vec3(1.0 - color.r, 1.0 - color.g, 1.0 - color.b);

//     gl_FragColor = vec4(invertedColor, color.a);
//   }
// `;

// Inicializa WebGL y crea los recursos necesarios
export function initWebGL(canvas) {
    if (!contextWebGL) {
        console.error('No se pudo inicializar WebGL');
        return false;
    }

    // Crear y compilar shaders
    const vertexShader = loadShader(
        contextWebGL,
        contextWebGL.VERTEX_SHADER,
        vsSource
    );
    const fragmentShader = loadShader(
        contextWebGL,
        contextWebGL.FRAGMENT_SHADER,
        fsSource
    );

    // Crear programa de shader
    program = contextWebGL.createProgram();
    contextWebGL.attachShader(program, vertexShader);
    contextWebGL.attachShader(program, fragmentShader);
    contextWebGL.linkProgram(program);

    if (!contextWebGL.getProgramParameter(program, contextWebGL.LINK_STATUS)) {
        console.error(
            'No se pudo inicializar el programa de shader: ' +
                contextWebGL.getProgramInfoLog(program)
        );
        return false;
    }

    // Configurar buffers para un cuadrado que cubre toda la pantalla
    setupBuffers();

    // Crear textura para renderizar el contenido del canvas 2D
    setupTexture(canvas.width, canvas.height);

    return true;
}

// Carga y compila un shader
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(
            'Error al compilar shader: ' + gl.getShaderInfoLog(shader)
        );
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Configura los buffers para un cuadrado que cubre toda la pantalla
function setupBuffers() {
    // Posiciones de los vértices (cuadrado que cubre toda la pantalla)
    const positions = [
        -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0,
    ];

    // Coordenadas de textura
    const textureCoordinates = [0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0];

    // Índices para dibujar dos triángulos que forman el cuadrado
    const indices = [0, 1, 2, 0, 2, 3];

    // Crear y llenar buffer de posiciones
    quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Crear y llenar buffer de coordenadas de textura
    textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(textureCoordinates),
        gl.STATIC_DRAW
    );

    // Crear y llenar buffer de índices
    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(indices),
        gl.STATIC_DRAW
    );
}

// Configura la textura para renderizar el contenido del canvas 2D
function setupTexture(width, height) {
    // Crear textura
    renderTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, renderTexture);

    // Configurar parámetros de la textura
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Asignar espacio para la textura (vacía inicialmente)
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        width,
        height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
    );
}

// Renderiza el contenido del canvas 2D en una textura WebGL e invierte los colores
export function renderCanvasToWebGL(canvas2D) {
    if (!gl || !program) {
        console.error('WebGL no está inicializado');
        return;
    }

    // Actualizar la textura con el contenido del canvas 2D
    gl.bindTexture(gl.TEXTURE_2D, renderTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        canvas2D
    );

    // Limpiar el canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Usar el programa de shader
    gl.useProgram(program);

    // Configurar atributos de vértices
    const vertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPosition);

    // Configurar atributos de coordenadas de textura
    const textureCoord = gl.getAttribLocation(program, 'aTextureCoord');
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.vertexAttribPointer(textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(textureCoord);

    // Configurar la textura en la unidad 0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, renderTexture);
    gl.uniform1i(gl.getUniformLocation(program, 'uSampler'), 0);

    // Dibujar el cuadrado
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}
