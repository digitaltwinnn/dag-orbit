<script setup lang="ts">
import daisyuiColors from "daisyui/src/theming/themes";
import type { Theme } from "daisyui";

const colorMode = useColorMode();
let colors = ref<string[]>([]);

onMounted(() => {
  watch(
    colorMode,
    () => {
      colors.value = [];
      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = tmpCanvas.height = 1;
      colors.value.push(
        cssColorToHEX(daisyuiColors[<Theme>colorMode.value].primary, tmpCanvas),
        cssColorToHEX(daisyuiColors[<Theme>colorMode.value].secondary, tmpCanvas),
        cssColorToHEX(daisyuiColors[<Theme>colorMode.value].accent, tmpCanvas)
      );
    },
    {
      immediate: true,
    }
  );
});
</script>

<template>
  <div class="flex flex-row">
    <div
      class="w-1/2 h-1/2 flex flex-row justify-center items-center shadow bg-neutral border-2 border-primary rounded-box"
      id="left-wall"
    >
      <div class="flex flex-col">
        <div><ChartsBarExample id="bar1" :colors="colors" /></div>
        <div><ChartsBarExample id="bar2" :colors="colors" /></div>
      </div>
      <div class="flex flex-col">
        <div><ChartsBarExample id="bar3" :colors="colors" /></div>
        <div><ChartsBarExample id="bar4" :colors="colors" /></div>
      </div>
    </div>
    <div
      class="w-1/2 h-1/2 flex flex-row justify-center items-center shadow bg-neutral border-2 border-primary rounded-box"
      id="right-wall"
    >
      <div class="flex flex-col">
        <div><ChartsBarExample id="bar5" :colors="colors" /></div>
        <div><ChartsBarExample id="bar6" :colors="colors" /></div>
      </div>
      <div class="flex flex-col">
        <div><ChartsBarExample id="bar7" :colors="colors" /></div>
        <div><ChartsBarExample id="bar8" :colors="colors" /></div>
      </div>
    </div>
  </div>
</template>
