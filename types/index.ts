import { Color } from "three";

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

  type Edge = {
    source: Satellite;
    target: Satellite;
    visible: boolean;
  };

  type Satellite = {
    node: L0Node;
    color: Color;
    visible: boolean;
  };
}
