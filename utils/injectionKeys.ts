import type { SelectiveBloomEffect } from "postprocessing";
import type { Camera, Scene } from "three";
import type { InjectionKey } from "vue";

export const colorKey = Symbol() as InjectionKey<Ref<string[]>>;
export const sceneKey = Symbol() as InjectionKey<Scene>;
export const cameraKey = Symbol() as InjectionKey<Camera>;
export const bloomKey = Symbol() as InjectionKey<SelectiveBloomEffect>;
