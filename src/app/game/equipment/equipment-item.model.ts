export interface EquipmentItem {
  id: EquipmentItemId;
  category: 'weapon' | 'support' | 'tool';
  name: string;
  characteristic: string;
}

export enum EquipmentItemId {
  epee,
  lance,
  morgenstern,
  arc,
  cotteDeMaille,
  marmite,
  pamphletTouristique,
  kitDeSoin,
  fourche,
  dague,
  kitDEscalade,
  sacDeGrain
}

