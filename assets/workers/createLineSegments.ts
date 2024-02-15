import { Color, Line3, Vector3 } from "three";
import { gsap } from "gsap";
import { useGlobeUtils } from "~/composables/useGlobeUtils";

const createGeometry = (
  lineType: string,
  arcRadius: number,
  linePoints: number,
  edgeData: Edge[]
): GeometryVertices => {
  const points: Vector3[] = [];
  const indices: number[] = [];
  const colors = new Float32Array(3 * edgeData.length * (linePoints + 1));
  const $globeUtils = useGlobeUtils();

  let linePos = 0;
  let colorPos = 0;
  const point = new Vector3();

  edgeData.forEach((edge) => {
    // points
    if (lineType == "arc") {
      const arc = $globeUtils.createSphereArc(
        edge.source.node.host,
        edge.target.node.host,
        arcRadius
      );
      points.push(...arc.getPoints(linePoints));
    } else if (lineType == "line") {
      const line = new Line3(edge.source.mode.graph.vector, edge.target.mode.graph.vector);
      for (let i = 0; i <= linePoints; i++) {
        line.at(i / linePoints, point);
        points.push(point.clone());
      }
    }

    // indices
    for (let i = 0; i < linePoints; i++) {
      const indice = [linePos + i, linePos + i + 1];
      indices.push(...indice);
    }
    linePos += linePoints + 1;

    // colors
    let color;
    for (let i = 0; i <= linePoints; i++) {
      color = gsap.utils.interpolate(edge.source.color, edge.target.color, i / linePoints);
      colors[colorPos++] = color.r;
      colors[colorPos++] = color.g;
      colors[colorPos++] = color.b;
    }
  });

  return {
    points: points,
    indices: indices,
    colors: colors,
  };
};

const createColors = (
  linePoints: number,
  edgeData: Edge[],
  satelliteData: Satellite[]
): Float32Array => {
  const errorColor = new Color("black");
  const colors = new Float32Array(3 * edgeData.length * (linePoints + 1));
  let colorPos = 0;

  let source, target, color;
  edgeData.forEach((edge) => {
    source = satelliteData.find((sat) => {
      return edge.source.node.ip == sat.node.ip;
    });
    target = satelliteData.find((sat) => {
      return edge.target.node.ip == sat.node.ip;
    });
    if (source && target) {
      edge.source.color = source.color;
      edge.target.color = target.color;
    } else {
      edge.source.color = errorColor;
      edge.target.color = errorColor;
    }

    for (let i = 0; i <= linePoints; i++) {
      color = gsap.utils.interpolate(edge.source.color, edge.target.color, i / linePoints);
      colors[colorPos++] = color.r;
      colors[colorPos++] = color.g;
      colors[colorPos++] = color.b;
    }
  });
  return colors;
};

self.addEventListener(
  "message",
  function (e) {
    switch (e.data.cmd) {
      case "createGeometry":
        const { points, indices, colors } = createGeometry(
          e.data.lineType,
          e.data.arcRadius,
          e.data.linePoints,
          e.data.edges
        );
        self.postMessage({ points, indices, colors }, [colors.buffer]);
        break;
      case "createColors":
        const newColors = createColors(e.data.linePoints, e.data.edges, e.data.satellites);
        self.postMessage(newColors, [newColors.buffer]);
        break;
      default:
        self.postMessage("Unknown command");
    }
  },
  false
);
