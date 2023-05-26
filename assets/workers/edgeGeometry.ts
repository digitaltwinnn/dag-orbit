import { Curve, Line3, Vector3 } from "three";
import { gsap } from "gsap";

const toVector = (lat: number, lng: number, radius: number): Vector3 => {
  const latRad = lat * (Math.PI / 180);
  const lonRad = -lng * (Math.PI / 180);
  return new Vector3(
    Math.cos(latRad) * Math.cos(lonRad) * radius,
    Math.sin(latRad) * radius,
    Math.cos(latRad) * Math.sin(lonRad) * radius
  );
};

const greatCircleFunction = (P: Vector3, Q: Vector3) => {
  const angle = P.angleTo(Q);
  return function (t: number) {
    const X = new Vector3()
      .addVectors(
        P.clone().multiplyScalar(Math.sin((1 - t) * angle)),
        Q.clone().multiplyScalar(Math.sin(t * angle))
      )
      .divideScalar(Math.sin(angle));
    return X;
  };
};

const createSphereArc = (
  o: { latitude: number; longitude: number },
  d: { latitude: number; longitude: number },
  radius: number
): Curve<Vector3> => {
  const origin = toVector(o.latitude, o.longitude, radius);
  const dest = toVector(d.latitude, d.longitude, radius);

  const sphereArc = new Curve<Vector3>();
  sphereArc.getPoint = greatCircleFunction(origin, dest);
  return sphereArc;
};

const createGeometry = (
  orientation: string,
  settings: any,
  edges: Edge[]
): {
  points: Vector3[];
  indices: number[];
  colors: number[];
  visibleEdges: number;
} => {
  // invisible edges at the end to be hidden using setDrawRange
  edges.sort((e1, e2) => {
    return e1.visible === e2.visible ? 0 : e1.visible ? -1 : 1;
  });
  const visibleEdges = edges.filter((e) => {
    return e.visible;
  }).length;

  // populate the lineSgements for all the edges
  const points: Vector3[] = [];
  const indices: number[] = [];
  const colors: number[] = [];
  let linePos = 0;
  let colorPos = 0;
  edges.forEach((edge) => {
    // points
    if (orientation == "globe") {
      const arc = createSphereArc(
        edge.source.node.host,
        edge.target.node.host,
        settings.globe.radius
      );
      points.push(...arc.getPoints(settings.edge.points));
    } else if (orientation == "graph") {
      const line = new Line3(
        edge.source.orientation.graph.position,
        edge.target.orientation.graph.position
      );
      const point = new Vector3();
      for (let i = 0; i <= settings.edge.points; i++) {
        line.at(i / settings.edge.points, point);
        points.push(point.clone());
      }
    }

    // indices
    for (let i = 0; i < settings.edge.points; i++) {
      const indice = [linePos + i, linePos + i + 1];
      indices.push(...indice);
    }
    linePos += settings.edge.points + 1;

    // colors
    let color;
    for (let i = 0; i <= settings.edge.points; i++) {
      color = gsap.utils.interpolate(
        edge.source.color,
        edge.target.color,
        i / settings.edge.points
      );
      colors[colorPos++] = color.r;
      colors[colorPos++] = color.g;
      colors[colorPos++] = color.b;
    }
  });
  return {
    points: points,
    indices: indices,
    colors: colors,
    visibleEdges: visibleEdges,
  };
};

self.addEventListener(
  "message",
  function (e) {
    const vertices = createGeometry(
      e.data.orientation,
      e.data.settings,
      e.data.edges
    );
    self.postMessage(vertices);
  },
  false
);
