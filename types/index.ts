import {
  Color,
  Group,
  InstancedMesh,
  LineSegments,
  Mesh,
  Object3D,
  PointLight,
  Vector3,
} from "three";

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

    vector: {
      graph: {
        x: number,
        y: number,
        z: number
      },
      globe: {
        x: number,
        y: number,
        z: number
      },
    }
  };

  type NodeMetrics = {
    todo: string;
  };

  type Satellite = {
    node: L0Node;
    color: Color;
    visibility: {
      globe: boolean;
      graph: boolean;
    };
  };

  type Edge = {
    source: Satellite;
    target: Satellite;
    visible: boolean;
  };

  type ThreeJsComposable = {
    loaded: Ref<boolean>;
    object: InstancedMesh | Mesh | LineSegments | Group | Object3D | PointLight;
  };
}
