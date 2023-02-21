import { WebGLRenderer } from "three";

class AppRenderer {
  private renderer!: WebGLRenderer;

  constructor(el: HTMLElement) {
    this.renderer = new WebGLRenderer({
      powerPreference: "high-performance",
      antialias: false,
      stencil: false,
      depth: false,
    });
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    el.appendChild(this.renderer.domElement);
  }

  public get(): WebGLRenderer {
    return this.renderer;
  }
}

export { AppRenderer };
