import { Color, Line3, Vector3 } from "three";
import { gsap } from "gsap";
import { useGlobeUtils } from "~/composables/useGlobeUtils";

const createGeometry = (
  lineType: string,
  arcRadius: number,
  linePoints: number,
  edgeData: Edge[]
): GeometryVertices => {
  const points = new Float32Array(3 * edgeData.length * (linePoints + 1));
  const colors = new Float32Array(3 * edgeData.length * (linePoints + 1));
  const indices: number[] = [];
  const $globeUtils = useGlobeUtils();

  let pointIndex = 0;
  let colorIndex = 0;
  let indiceIndex = 0;

  const point = new Vector3();
  const line = new Line3();
  let pointPositions = new Array<Vector3>(linePoints + 1);

  edgeData.forEach((edge) => {
    // points
    if (lineType == "arc") {
      pointPositions = $globeUtils
        .createSphereArc(edge.source.node.host, edge.target.node.host, arcRadius)
        .getPoints(linePoints);
    } else if (lineType == "line") {
      line.set(edge.source.mode.graph.vector, edge.target.mode.graph.vector);
      for (let i = 0; i <= linePoints; i++) {
        line.at(i / linePoints, point);
        pointPositions[i] = point.clone();
      }
    }
    pointPositions.forEach((p) => {
      points[pointIndex++] = p.x;
      points[pointIndex++] = p.y;
      points[pointIndex++] = p.z;
    });

    // colors
    let color;
    for (let i = 0; i <= linePoints; i++) {
      color = gsap.utils.interpolate(edge.source.color, edge.target.color, i / linePoints);
      colors[colorIndex++] = color.r;
      colors[colorIndex++] = color.g;
      colors[colorIndex++] = color.b;
    }

    // indices
    for (let i = 0; i < linePoints; i++) {
      const indice = [indiceIndex + i, indiceIndex + i + 1];
      indices.push(...indice);
    }
    indiceIndex += linePoints + 1;
  });

  return {
    points: points,
    colors: colors,
    indices: indices,
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
        self.postMessage({ points, indices, colors }, [points.buffer, colors.buffer]);
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
