import {
  CustomPluginOptions,
  KontentItem,
  KontentItemElement,
  RichTextElementLink,
  RichTextElementImage,
} from './types';
import { loadAllKontentItems } from './client';
import {
  getKontentItemNodeStringForId,
  getKontentItemNodeTypeName,
} from './naming';

const addPreferredLanguageProperty = (
  items: Array<KontentItem>,
  language: string,
): Array<KontentItem> => {
  for (const item of items) {
    item['preferred_language'] = language;
  }
  return items;
};

const alterRichTextElements = (items: Array<KontentItem>): void => {
  const richTextElements = items
    .flatMap(i => Object.values(i.elements))
    .filter((element: KontentItemElement) => element.type === 'rich_text');

  for (const element of richTextElements as KontentItemElement[]) {
    (element.links as RichTextElementLink[]) = Object.keys(element.links).map(
      (key: string) => {
        (element.links as { [key: string]: RichTextElementLink })[key][
          'link_id'
        ] = key;
        return (element.links as { [key: string]: RichTextElementLink })[key];
      },
    );

    (element.images as RichTextElementImage[]) = Object.keys(
      element.images,
    ).map(key => {
      // key is stored in image_id
      return (element.images as { [key: string]: RichTextElementImage })[key];
    });
  }
};

const getKontentItemLanguageVariantArtifact = (
  kontentItem: KontentItem,
): KontentItem => {
  const nodeData: KontentItem = {
    ...kontentItem
  };
  return nodeData;
};

const sourceNodes = async (
  options: CustomPluginOptions,
): Promise<Array<KontentItem>> => {
  const nodes = Array<KontentItem>();
  for (const language of options.languageCodenames) {
    const kontentItems = await loadAllKontentItems(options, language);
    addPreferredLanguageProperty(kontentItems, language);
    alterRichTextElements(kontentItems);
    for (const kontentItem of kontentItems) {
      const nodeData = getKontentItemLanguageVariantArtifact(kontentItem);
      nodes.push(nodeData);
    }
  }
  return nodes;
};

export { sourceNodes as kontentItemsSourceNodes };
