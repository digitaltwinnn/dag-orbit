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

  type NodeData = {
    satellites: Satellite[];
    satelliteEdges: Edge[];
    graphEdges: Edge[];
  };

  type GeometryVertices = {
    points: ArrayBuffer;
    colors: ArrayBuffer;
    indices: Uint16Array;
  };
}
