import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform float u_t;
uniform vec2  u_res;

float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1,0)), u.x),
    mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.0 + vec2(3.1, 1.7);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p  = uv * 2.5;
  float t = u_t * 0.25;

  vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) + t * 0.8));
  float f = fbm(p + q);

  vec3 dark  = vec3(0.02, 0.05, 0.07);
  vec3 cyan  = vec3(0.02, 0.71, 0.83);
  vec3 green = vec3(0.06, 0.73, 0.51);
  vec3 mid   = vec3(0.03, 0.25, 0.35);

  float s = clamp(f * 1.8, 0.0, 1.0);
  vec3 col;
  if (s < 0.4)       col = mix(dark, mid,   s / 0.4);
  else if (s < 0.7)  col = mix(mid,  cyan,  (s - 0.4) / 0.3);
  else               col = mix(cyan, green, (s - 0.7) / 0.3);

  float vig = length(uv - 0.5) * 2.0;
  col *= 1.0 - smoothstep(0.5, 1.4, vig);
  col = clamp(col * 0.55, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
`;

function buildProgram(gl: WebGLRenderingContext) {
  function compile(type: number, src: string) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error("[AuroraBackground] Shader compile error:", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;

  const p = gl.createProgram()!;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error("[AuroraBackground] Program link error:", gl.getProgramInfoLog(p));
    return null;
  }
  
  console.log("[AuroraBackground] WebGL program compiled successfully");
  return p;
}

export function AuroraBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    console.log("[AuroraBackground] Initializing...");
    
    const gl = canvas.getContext("webgl", { 
      antialias: false, 
      powerPreference: "low-power",
      alpha: false,
    });
    
    if (!gl) { 
      console.error("[AuroraBackground] WebGL not supported"); 
      return; 
    }

    const prog = buildProgram(gl);
    if (!prog) {
      console.error("[AuroraBackground] Failed to build shader program");
      return;
    }
    
    gl.useProgram(prog);

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uT   = gl.getUniformLocation(prog, "u_t");
    const uRes = gl.getUniformLocation(prog, "u_res");

    const start = performance.now();
    let raf = 0;
    let alive = true;
    let frameCount = 0;

    function setSize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const ratio = Math.min(1, Math.sqrt(600000 / (w * h)));
      canvas!.width  = Math.round(w * ratio);
      canvas!.height = Math.round(h * ratio);
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      console.log(`[AuroraBackground] Canvas sized to ${canvas!.width}×${canvas!.height}`);
    }

    function frame() {
      if (!alive) return;
      
      const t = (performance.now() - start) / 1000;
      gl!.uniform1f(uT, t);
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      
      frameCount++;
      if (frameCount === 1) {
        console.log("[AuroraBackground] First frame rendered");
      }
      
      raf = window.setTimeout(() => {
        raf = requestAnimationFrame(frame);
      }, 42) as unknown as number;
    }

    setSize();
    window.addEventListener("resize", setSize);
    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(raf);
      window.removeEventListener("resize", setSize);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      console.log("[AuroraBackground] Disposed");
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}
