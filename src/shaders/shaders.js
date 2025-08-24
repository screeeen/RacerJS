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

export const fsSource = `
    precision mediump float;
    uniform sampler2D u_tex;
    varying vec2 v_uv;

    // Bayer 4x4 como función float
    float bayer4x4(float x, float y) {
        float xx = mod(x, 4.0);
        float yy = mod(y, 4.0);

        if (yy < 1.0) {
            if (xx < 1.0) return 0.0/16.0;
            else if (xx < 2.0) return 8.0/16.0;
            else if (xx < 3.0) return 2.0/16.0;
            else return 10.0/16.0;
        } else if (yy < 2.0) {
            if (xx < 1.0) return 12.0/16.0;
            else if (xx < 2.0) return 4.0/16.0;
            else if (xx < 3.0) return 14.0/16.0;
            else return 6.0/16.0;
        } else if (yy < 3.0) {
            if (xx < 1.0) return 3.0/16.0;
            else if (xx < 2.0) return 11.0/16.0;
            else if (xx < 3.0) return 1.0/16.0;
            else return 9.0/16.0;
        } else {
            if (xx < 1.0) return 15.0/16.0;
            else if (xx < 2.0) return 7.0/16.0;
            else if (xx < 3.0) return 13.0/16.0;
            else return 5.0/16.0;
        }
    }

    void main() {
        vec4 color = texture2D(u_tex, v_uv);

        // Coordenadas del pixel en pantalla
        vec2 pixel = gl_FragCoord.xy;
        float dither = bayer4x4(pixel.x, pixel.y);

        // Aplicar dithering
        vec3 dithered = floor((color.rgb) * 2.0 + dither) / 2.0;

        gl_FragColor = vec4(dithered, color.a);
    }
`;
