//import * as twgl from 'https://twgljs.org/dist/5.x/twgl-full.module.js'
//import * as twgl from 'twgl-full.module.js'
import * as twgl from 'twgl.js'

const gl = document.getElementById("c").getContext("webgl");

// Shaders
const vertexShaderSource = `
attribute vec4 position;

void main() {
  gl_Position = position;
}
`;

const fragmentShaderSource = `
precision highp float;
float grid_intensity = 0.7;

uniform vec2 resolution;

// Thick lines
float grid(vec2 fragCoord, float space, float gridWidth)
{
    vec2 p  = fragCoord - vec2(.5);
    vec2 size = vec2(gridWidth);

    vec2 a1 = mod(p - size, space);
    vec2 a2 = mod(p + size, space);
    vec2 a = a2 - a1;

    float g = min(a.x, a.y);
    return clamp(g, 0., 1.0);
}


void main()
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = gl_FragCoord.xy/resolution.xy;

    // Pixel color
    vec3 col = vec3(.7,.7,.7);

    // Gradient across screen
    vec2 p = gl_FragCoord.xy;           // Point
	  vec2 c = resolution.xy / 2.0;   // Center
    col *= (1.0 - length(c - p)/resolution.x*0.7);

    // 2-size grid
    col *= clamp(grid(gl_FragCoord.xy, 10., 0.5) *  grid(gl_FragCoord.xy, 50., 1.), grid_intensity, 1.0);

    // Output to screen
    gl_FragColor = vec4(col,1.0);
}
`;

const programInfo = twgl.createProgramInfo(gl, [vertexShaderSource, fragmentShaderSource]);

const arrays = {
  position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
};
const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

function render(time) {
  twgl.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  const uniforms = {
    time: time * 0.001,
    resolution: [gl.canvas.width, gl.canvas.height],
  };

  gl.useProgram(programInfo.program);
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  twgl.setUniforms(programInfo, uniforms);
  twgl.drawBufferInfo(gl, bufferInfo);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);