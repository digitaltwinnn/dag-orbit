import {
  CubicBezierCurve3,
  MathUtils,
  PerspectiveCamera,
  Vector3,
} from "three";
import TWEEN from "@tweenjs/tween.js";
import { geoInterpolate } from "d3-geo";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GlobeUtils } from "../utils/GlobeUtils";
import { AppRenderer } from "./AppRenderer";

class AppCamera {
  private camera!: PerspectiveCamera;
  private controls!: OrbitControls;
  private startPos = new Vector3(0, 0, 400);
  private radius = 100;

  constructor(width: number, height: number, renderer: AppRenderer) {
    this.camera = new PerspectiveCamera(50, width / height, 0.1, 40000);
    this.camera.position.set(this.startPos.x, this.startPos.y, this.startPos.z);
    this.camera.up.set(0, 1, 0);

    this.controls = new OrbitControls(this.camera, renderer.get().domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 0;
    this.controls.maxDistance = 5000;
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  public get(): PerspectiveCamera {
    return this.camera;
  }

  public getControls(): OrbitControls {
    return this.controls;
  }

  public tick(delta: number): void {
    TWEEN.update();
    if (this.controls.enabled) {
      this.controls.update();
    }
  }

  public toGlobeView(cb: any) {
    const self = this;

    const target = { lat: 40.7, lng: 74.0 };
    const height = 500;
    const lookAt = new Vector3(this.radius, 0.5 * this.radius, 0);
    const duration = 14000;

    this.toLatLng(target, height, lookAt, duration, function () {
      self.controls.minPolarAngle = 0;
      self.controls.maxPolarAngle = Math.PI;
      self.controls.minAzimuthAngle = Infinity;
      self.controls.maxAzimuthAngle = Infinity;
      cb();
    });
  }

  public toIntroView(cb: any) {
    const self = this;

    const target = this.startPos;
    const lookAt = new Vector3(0, 0, 0);
    const duration = 4000;

    this.toVector(target, lookAt, duration, function () {
      self.controls.minPolarAngle = 0;
      self.controls.maxPolarAngle = Math.PI;
      self.controls.minAzimuthAngle = Infinity;
      self.controls.maxAzimuthAngle = Infinity;
      cb();
    });
  }

  private toVector(
    target: Vector3,
    lookAt: Vector3,
    duration: number,
    cb: any
  ): void {
    const utils = new GlobeUtils(this.radius);
    const t = utils.toLatLng(target);
    const v = utils.toVector(t[0], t[1], 0);
    this.toLatLng(
      { lat: t[0], lng: t[1] },
      target.distanceTo(v),
      lookAt,
      duration,
      cb
    );
  }

  private toLatLng(
    target: { lat: number; lng: number },
    alt: number,
    lookAt: Vector3,
    duration: number,
    cb: any
  ): void {
    const utils = new GlobeUtils(this.radius);
    const origin = this.camera.position.clone();

    // convert origin to latitude and longitude coordinates and interpolate
    const startLatLng = utils.toLatLng(origin.clone());
    const interpolate = geoInterpolate(
      [startLatLng[1], startLatLng[0]],
      [target.lng, target.lat - 5]
    );
    const midCoord1 = interpolate(0.25);
    const midCoord2 = interpolate(0.75);

    // convert the destination lat-long coordinate to vectors as well
    const targetVector = utils.toVector(target.lat, target.lng, alt);

    // convert the interpolated lat-long coordinates to vectors
    const curveHeight = MathUtils.clamp(
      origin.distanceTo(targetVector) * 0.75,
      1 * alt,
      2 * alt
    );
    const mid1 = utils.toVector(midCoord1[1], midCoord1[0], curveHeight);
    const mid2 = utils.toVector(midCoord2[1], midCoord2[0], curveHeight);

    const camCurve = new CubicBezierCurve3(origin, mid1, mid2, targetVector);
    this.followCurve(camCurve, lookAt.clone(), duration, cb);
  }

  private followCurve(
    camCurve: CubicBezierCurve3,
    lookAt: Vector3,
    duration: number,
    onCompleteCb: any
  ) {
    const camera = this.camera;
    const controls = this.controls;

    const currLookAt = controls.target;
    const _tmpCam = new Vector3();
    new TWEEN.Tween({ progress: 0 })
      .to({ progress: 1 }, duration)
      .easing(TWEEN.Easing.Quartic.InOut)
      .onStart(function () {
        controls.enabled = false;
      })
      .onUpdate(function (values) {
        camCurve.getPoint(values.progress, _tmpCam);
        camera.position.set(_tmpCam.x, _tmpCam.y, _tmpCam.z);
        camera.lookAt(currLookAt.lerp(lookAt, values.progress));
      })
      .onComplete(function () {
        controls.enabled = true;
        onCompleteCb();
      })
      .start();
  }
}

export { AppCamera };
