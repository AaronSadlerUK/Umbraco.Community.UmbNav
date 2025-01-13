import { manifests as modals } from "./modals/manifest.ts";
import { manifests as propertyEditors } from "./manifest.ts";

export const manifests: Array<UmbExtensionManifest> = [
    ...modals,
    ...propertyEditors
]