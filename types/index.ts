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
    }
  };

  type NodeMetrics = {
    todo: string;
  };

  type Satellite = {
    node: L0Node;
    color: Color;
    position: {
      globe: Vector3;
      graph: Vector3;
    };
    visible: boolean;
  };

  type Edge = {
    source: Satellite;
    target: Satellite;
    visible: boolean;
  };
}
