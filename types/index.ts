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
  };

  type NodeMetrics = {
    todo: string;
  };

  type Satellite = {
    node: L0Node;
    color: Color;
    orientation: {
      globe: {
        position: Vector3;
        visible: boolean;
      };
      graph: {
        position: Vector3;
        visible: boolean;
      };
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
