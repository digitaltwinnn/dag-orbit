import type { InjectionKey } from "vue";

export const colorKey = Symbol() as InjectionKey<Ref<string[]>>;
