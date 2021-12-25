export interface InventoryItem {
  ref: string;
  paragraph: number;
}

export enum ITEM {
  ecussonOrcDechire = 'écusson d\'orc déchiré',
  bouleANeige = 'Boule à neige',
  ecailleDeDragon = 'écaille de dragon',
  lettreDeRecommandation = 'Lettre de recommandation',
  ferACheval = 'Fer à cheval',
  info = 'Info',
  petitMedaillon = 'Petit médaillon'
}

export const ITEMS: Array<InventoryItem> = [
  {
    ref: ITEM.ecussonOrcDechire,
    paragraph: 14,
  },
  {
    ref: ITEM.bouleANeige,
    paragraph: 18
  },
  {
    ref: ITEM.ecussonOrcDechire,
    paragraph: 19,
  },
  {
    ref: ITEM.ecailleDeDragon,
    paragraph: 26,
  },
  {
    ref: ITEM.lettreDeRecommandation,
    paragraph: 28,
  },
  {
    ref: ITEM.ferACheval,
    paragraph: 29,
  },
  {
    ref: ITEM.petitMedaillon,
    paragraph: 47,
  },
  {
    ref: ITEM.info,
    paragraph: 47,
  },
  {
    ref: ITEM.info,
    paragraph: 58,
  },
  {
    ref: ITEM.info,
    paragraph: 62,
  }
];
