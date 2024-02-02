<script setup lang="ts">
import vAtmos from "~/assets/shaders/atmosphere/vertex.glsl?raw";
import fAtmos from "~/assets/shaders/atmosphere/fragment.glsl?raw";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import daisyuiColors from "daisyui/src/theming/themes";
import { Color, MathUtils, Vector3 } from "three";

gsap.registerPlugin(ScrollTrigger);

// set the preferred theme
const colorMode = useColorMode();

// get the latest cluster node information from our db
const nodes: L0Node[] = await $fetch("/api/nodes");

// create the threejs scene once the dom is loaded
onMounted(async () => {
  // get the current theme color on the page
  const colors = [
    daisyuiColors["[data-theme=" + colorMode.value + "]"].primary,
    daisyuiColors["[data-theme=" + colorMode.value + "]"].secondary,
    daisyuiColors["[data-theme=" + colorMode.value + "]"].accent,
  ]

  // create satellite data objects for threejs visualisations
  let nodeV: Vector3 = new Vector3();
  let satV: Vector3 = new Vector3();
  const nearbySatellites = (
    node: L0Node,
    proximity: number,
    target: Satellite[]
  ): boolean => {
    const sats = target.filter((s: Satellite) => {
      nodeV.set(node.vector.globe.x, node.vector.globe.y, node.vector.globe.x);
      satV.set(s.node.vector.globe.x, s.node.vector.globe.y, s.node.vector.globe.x);

      console.log(nodeV, satV, nodeV.distanceTo(satV), proximity);
      return nodeV.distanceTo(satV) < proximity
    });
    return sats.length > 0;
  };
  const satellites: Satellite[] = [];
  nodes.forEach((node) => {
    satellites.push({
      node: node,
      visibility: {
        globe: !nearbySatellites(node, 10, satellites),
        graph: true
      },
      color: new Color(colors[MathUtils.randInt(0, colors.length - 1)]),
    });
  })

  // create edge data objects for threejs visualisations
  const edges: Edge[] = [];
  edges.push(
    {
      source: satellites[1],
      target: satellites[2],
      visible: true,
    },
    {
      source: satellites[2],
      target: satellites[3],
      visible: true,
    },
    {
      source: satellites[3],
      target: satellites[4],
      visible: true,
    });

  // load the threejs scene
  const canvas = document.getElementById("scene-container");
  if (canvas != null) {
    let $scene = useScene(canvas);
    gsap.ticker.add((time, deltaTime, frame) => {
      $scene.tick(deltaTime);
    });

    // load the natural globe in threejs
    const $sun = await useSun($scene.scene);
    const $naturalGlobe = useNaturalGlobe(
      $sun.light,
      vAtmos,
      fAtmos,
      "#54a6ef"
    );
    watch($naturalGlobe.loaded, () => {
      if ($naturalGlobe.loaded.value) {
        $scene.scene.add($naturalGlobe.object);
      }
    }, { immediate: true });

    // load the digital globe in threejs
    await useDigitalGlobe($scene.scene, colors);

    // load the satellites in threejs
    const $satellites = useSatellites(satellites);
    watch($satellites.loaded, () => {
      if ($satellites.loaded.value) {
        $scene.scene.add($satellites.object);
      }
    }, { immediate: true });

    // load the edges (between satellites) in threejs
    const $edges = useEdges(edges);
    watch($edges.loaded, () => {
      if ($edges.loaded.value) {
        $scene.scene.add($edges.object);
        $scene.bloom.selection.add($edges.object);
      }
    }, { immediate: true });

    // setup the page scroll animations
    gsap.to($satellites.object.scale, {
      x: 2,
      y: 2,
      z: 2,
      scrollTrigger: {
        trigger: "#panel-1",
        scrub: 0.6,
        markers: true,
      },
    });
  }
});
</script>

<template>
  <div class="w-full h-full">
    <div id="stats" class="absolute top-20 left-4" />
    <canvas id="scene-container" class="w-full h-full block"></canvas>
  </div>
</template>
