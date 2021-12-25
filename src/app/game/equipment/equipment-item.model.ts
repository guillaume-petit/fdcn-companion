import {StatModifier} from "../character/stat-modifier.model";

export interface EquipmentItem {
  id: EquipmentItemId;
  category: 'weapon' | 'support' | 'tool';
  name: string;
  statModifier?: StatModifier[];
}

export enum EquipmentItemId {
  epee,
  lance,
  morgenstern,
  arc,
  petiteMassue,
  cotteDeMaille,
  marmite,
  pamphletTouristique,
  kitDeSoin,
  fourche,
  dague,
  kitDEscalade,
  sacDeGrain
}

