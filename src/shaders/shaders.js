// Vertex shader: dibuja un quad a pantalla completa
// Vertex shader: dibuja un quad a pantalla completa
export const vsSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    // mapear de [-1,1] a [0,1], pero invirtiendo Y
    v_uv = vec2((a_position.x + 1.0) * 0.5,
                (1.0 - a_position.y) * 0.5);
    gl_Position = vec4(a_position, 0, 1);
  }
`;

// Fragment shader: invierte colores
export const fsSource = `
    precision mediump float;
    uniform sampler2D u_tex;
    varying vec2 v_uv;
    void main() {
      vec4 color = texture2D(u_tex, v_uv);
      gl_FragColor = vec4(1.0 - color.rgb, color.a);
    }
  `;
