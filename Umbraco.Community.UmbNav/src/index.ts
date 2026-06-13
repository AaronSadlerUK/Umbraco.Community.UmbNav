import { manifests as modals } from "./modals/manifests.ts";
import { manifests as propertyEditors } from "./manifests.ts";
import { manifests as localization } from "./localization/manifests.ts";

export const manifests: Array<UmbExtensionManifest> = [
    ...modals,
    ...propertyEditors,
    ...localization
];
