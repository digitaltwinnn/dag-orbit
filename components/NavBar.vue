<script setup lang="ts">
import { Bars3Icon } from "@heroicons/vue/24/solid";
</script>

<template>
  <div class="navbar top-0">
    <div class="flex-none">
      <label for="my-drawer" class="btn drawer-button btn-ghost">
        <Bars3Icon class="h-6 w-6" />
      </label>
    </div>
    <div class="flex-1">
      <a class="btn btn-ghost normal-case text-xl">DAG Orbit</a>
    </div>
    <div class="flex-none">
      <ThemeSelector />
    </div>
  </div>
</template>
