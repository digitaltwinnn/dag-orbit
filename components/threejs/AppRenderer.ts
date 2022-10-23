import { WebGLRenderer } from "three";

class AppRenderer {
  private renderer!: WebGLRenderer;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      powerPreference: "high-performance",
      antialias: false,
      stencil: false,
      depth: false,
    });
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);
  }

  public get(): WebGLRenderer {
    return this.renderer;
  }
}

export { AppRenderer };
