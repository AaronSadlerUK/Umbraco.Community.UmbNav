
export type Guid = '' |`${string}-${string}-${string}-${string}-${string}`;
export type GuidUdi = '' | `umb://document/${string}` | `umb://media/${string}`
export type UmbNavLinkPickerLinkType = 'document' | 'external' | 'media' | 'title';
export type ModelEntryType = {
    key: Guid | null | undefined,
    name: string | null | undefined,
    description?: string | null | undefined,
    url: string | null | undefined,
    icon: string | null | undefined,
    itemType: UmbNavLinkPickerLinkType | null | undefined,
    udi: GuidUdi | null | undefined,
    anchor: string | null | undefined,
    published: boolean | null | undefined,
    naviHide?: boolean | null | undefined,
    culture?: string | null | undefined,
    id?: number | null | undefined,
    contentKey: Guid | null | undefined,
    children: ModelEntryType[],
    expanded?: boolean,
    target?: string | null | undefined,
    image?: ImageItem[],
    customClasses?: string | null | undefined,
    hideLoggedIn?: boolean | null | undefined,
    hideLoggedOut?: boolean | null | undefined,
    noopener?: string | null | undefined,
    noreferrer?: string | null | undefined,
}

export type ImageItem = {
    udi: GuidUdi,
    key: Guid,
}