const localization = {
    type: "localization",
    alias: "umbnav-localize-en",
    name: "UmbNav Localization",
    meta: {
        "culture": "en"
    },
    js: () => import('./en')
};

export const manifests = [
    localization
];