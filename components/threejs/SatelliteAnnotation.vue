<script setup lang="ts">
import { BufferGeometry, Line, LineBasicMaterial, Object3D, Vector3 } from "three";
import { CSS3DObject } from "three/examples/jsm/Addons.js";
import { gsap } from "gsap";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  parent: {
    type: Object3D,
    required: true,
  },
  satellite: {
    type: Object as PropType<Satellite>,
    required: true,
  },
});

let camera = inject(cameraKey);
if (!camera) throw new Error("Camera not found");

let colors = inject(colorKey);
if (!colors) throw new Error("Colors not found");

watch(props.satellite, () => {
  line.material.color.set(props.satellite.color);
});

const material = new LineBasicMaterial({ color: props.satellite.color });
const line = new Line(undefined, material);
line.name = "AnnotationLine";
props.parent.add(line);
// can only be created after the html element is mounted
let annotation: CSS3DObject;

/**
 * Animates the annotation by continuously updating its orientation to face the camera.
 */
const animate = () => {
  let target = { t: 0 };
  gsap.to(target, {
    t: 1,
    duration: 1,
    repeat: -1,
    yoyo: true,
    onUpdate: function () {
      annotation.lookAt(camera.position);
    },
  });
};

onMounted(() => {
  const label = document.getElementById(props.id);
  if (label == null) throw new Error("Html element not found");

  annotation = new CSS3DObject(label);
  annotation.name = "Annotation";
  props.parent.add(annotation);

  const satelliteVector = new Vector3(
    props.satellite.mode.globe.vector.x,
    props.satellite.mode.globe.vector.y,
    props.satellite.mode.globe.vector.z
  );
  const annotationVector = satelliteVector.clone().setLength(satelliteVector.length() + 100);
  annotation.position.set(annotationVector.x, annotationVector.y, annotationVector.z);
  annotation.scale.set(0.2, 0.2, 0.2);
  line.geometry = new BufferGeometry().setFromPoints([satelliteVector, annotation.position]);

  animate();
});
</script>

<template>
  <div class="card card-compact w-96 bg-base-100 shadow-xl" :id="props.id">
    <ChartsBarExample :id="'bar' + props.id" :colors="colors" />
    <div class="card-body">
      <h2 class="card-title">
        {{ satellite.node.host.city + " (" + satellite.node.host.country + ")" }}
      </h2>
      <h3 class="card-subtitle">{{ satellite.node.host.org }}</h3>
      <p>
        This card is used to display information about the L0 Node that is represented by this
        satellite.
      </p>
      <div class="card-actions justify-end">
        <button class="btn btn-primary">Click me</button>
      </div>
    </div>
  </div>
</template>
