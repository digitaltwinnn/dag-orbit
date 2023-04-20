import { Color } from "three";

export {};

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
  };

  type Satellite = {
    lat: number;
    lng: number;
    id: number;
    objectId: number;
    nodeIPs: number[];
    color: Color;
  };
}
