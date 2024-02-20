import {
  DoubleSide,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  RectAreaLight,
  Scene,
} from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";

RectAreaLightUniformsLib.init();

/**
 * Creates a 3D chart room in the given scene with the specified colors.
 * @param scene - The scene to add the chart room to.
 * @param colors - An array of colors to use for the walls and lights.
 * @returns An object containing the room, loaded state, and a function to change the colors.
 */
export const use3dChartRoom = (scene: Scene, colors: string[]) => {
  const loaded = ref(false);
  const room = new Group();
  room.rotation.y = MathUtils.degToRad(45);
  room.scale.set(1.2, 1.2, 1.2);
  room.position.y = -150;
  room.name = "Room";
  scene.add(room);

  // Floor
  const floorGeometry = new PlaneGeometry(500, 500);
  const floorMaterial = new MeshStandardMaterial({
    color: "#bcc6cc",
    metalness: 0.8,
    roughness: 0.2,
    side: DoubleSide,
  });
  const floor = new Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.name = "Floor";
  room.add(floor);

  const wallMaterial = new MeshStandardMaterial({
    color: colors[1],
    transparent: true,
    opacity: 0.1,
    metalness: 0.9,
    roughness: 0.7,
    side: DoubleSide,
  });

  // left wall
  const leftWallGeometry = new PlaneGeometry(500, 350);
  const leftWall = new Mesh(leftWallGeometry, wallMaterial);
  leftWall.position.z = -250;
  leftWall.position.y = 175;
  leftWall.name = "LeftWall";
  room.add(leftWall);

  const leftLight = new RectAreaLight(colors[0], 1, 500, 350);
  leftLight.position.z = -251;
  leftLight.position.y = 176;
  leftLight.rotation.y = -Math.PI;
  leftLight.name = "LeftLight";
  room.add(leftLight);

  const leftChart = document.getElementById("left-wall");
  if (leftChart) {
    const chart = new CSS3DObject(leftChart);
    chart.position.z = -230;
    chart.position.y = 160;
    chart.name = "LeftChart";
    room.add(chart);
  }

  // Right wall
  const rightWallGeometry = new PlaneGeometry(500, 350);
  const rightWall = new Mesh(rightWallGeometry, wallMaterial);
  rightWall.position.x = 250;
  rightWall.position.y = 175;
  rightWall.rotation.y = Math.PI / 2;
  rightWall.name = "RightWall";
  room.add(rightWall);

  const rightLight = new RectAreaLight(colors[1], 1, 500, 350);
  rightLight.position.x = 251;
  rightLight.position.y = 176;
  rightLight.rotation.y = Math.PI / 2;
  rightLight.name = "RightLight";
  room.add(rightLight);

  const rightChart = document.getElementById("right-wall");
  if (rightChart) {
    const chart = new CSS3DObject(rightChart);
    chart.position.x = 230;
    chart.position.y = 160;
    chart.rotation.y = -Math.PI / 2;
    chart.name = "RightChart";
    room.add(chart);
  }

  const changeColor = (newColors: string[]) => {
    wallMaterial.color.set(newColors[1]);
    leftLight.color.set(newColors[0]);
    rightLight.color.set(newColors[1]);
  };

  const load = async () => {
    loaded.value = true;
  };
  load();

  return { room, loaded, changeColor };
};
