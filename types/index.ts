import { Color, Vector3 } from "three";

declare global {
  type L0Node = {
    ip: number;
    state: string;
    host: {
      name: string;
      city: string;
      region: string;
      country: string;
      org: string;
      latitude: number;
      longitude: number;
    };
  };

  type Satellite = {
    node: L0Node;
    color: Color;
    mode: {
      graph: {
        visible: boolean;
        vector: Vector3;
      };
      globe: {
        visible: boolean;
        vector: Vector3;
      };
    };
  };

  type Edge = {
    source: Satellite;
    target: Satellite;
  };

  type Dot = {
    x: number;
    y: number;
    z: number;
  };

  type NodeData = {
    satellites: Satellite[];
    satelliteEdges: Edge[];
    graphEdges: Edge[];
  };

  type GeometryVertices = {
    points: Vector3[];
    indices: number[];
    colors: ArrayBuffer;
  };
}
