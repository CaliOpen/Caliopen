export const getConfig = (i18n) => [
  {
    id: 'draft',
    // this can evolve in `conditions[{ propName, values[], test='equal|lower|in…'}]`
    condition: { propertyName: 'is_draft', value: true },
    label: i18n._(/* i18n */ 'view.draft.label', null, { message: 'Drafts' }),
  },
];
