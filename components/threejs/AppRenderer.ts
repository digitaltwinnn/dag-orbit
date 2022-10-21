import { WebGLRenderer } from "three";

class AppRenderer {
  private renderer!: WebGLRenderer;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      stencil: false,
      depth: false,
      powerPreference: "high-performance",
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
