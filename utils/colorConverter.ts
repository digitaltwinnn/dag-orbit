import { Color } from "three";

export const cssColorToHEX = (color: string, canvas: HTMLCanvasElement) => {
    if (color.startsWith("oklch")) {
      const crl = new Color("black");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        const dt = ctx.getImageData(0, 0, 1, 1).data;
        crl.setRGB(dt[0] / 255, dt[1] / 255, dt[2] / 255);
      }
      return "#" + crl.getHexString();
    } else {
      return color;
    }
  };