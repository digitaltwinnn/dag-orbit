<template>
    <canvas ref="threejsCanvas"></canvas>
</template>

<script>
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    Mesh,
    SphereGeometry,
    MeshBasicMaterial,
} from "three";

export default {
    mounted() {
        const scene = new Scene();
        const camera = new PerspectiveCamera(
            75,
            innerWidth / innerHeight,
            0.1,
            1000
        );

        const renderer = new WebGLRenderer({
            canvas: this.$refs.threejsCanvas,
        });
        renderer.setSize(innerWidth, innerHeight);
        document.body.appendChild(renderer.domElement);

        // Create a sphere
        const sphere = new Mesh(
            new SphereGeometry(5, 50, 50),
            new MeshBasicMaterial({
                color: 0x00ff00,
                wireframe: true
            })
        );

        // Add objects into scene
        scene.add(sphere);

        camera.position.z = 10;

        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        animate();
    }
}
</script>