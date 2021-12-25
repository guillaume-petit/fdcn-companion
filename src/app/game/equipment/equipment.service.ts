import {Injectable} from '@angular/core';
import {EquipmentItem, EquipmentItemId} from "./equipment-item.model";

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {

  private _equipmentList: Array<EquipmentItem> = [
    {
      id: EquipmentItemId.epee,
      category: 'weapon',
      name: 'L\'épée',
      characteristic: '+4HAB',
    },
    {
      id: EquipmentItemId.lance,
      category: 'weapon',
      name: 'La lance',
      characteristic: '+3HAB +1ADR',
    },
    {
      id: EquipmentItemId.morgenstern,
      category: 'weapon',
      name: 'La morgenstern',
      characteristic: '+1HAB +1END +1DEG',
    },
    {
      id: EquipmentItemId.arc,
      category: 'weapon',
      name: 'L\'arc',
      characteristic: '+3HAB +1ADR +4CRIT',
    },
    {
      id: EquipmentItemId.cotteDeMaille,
      category: 'support',
      name: 'La cotte de maille',
      characteristic: '-1HAB -1ADR +1END +2ARM',
    },
    {
      id: EquipmentItemId.marmite,
      category: 'support',
      name: 'La marmite',
      characteristic: '+2END +1ARM',
    },
    {
      id: EquipmentItemId.pamphletTouristique,
      category: 'support',
      name: 'Le pamphlet touristique',
      characteristic: '+4CHA',
    },
    {
      id: EquipmentItemId.kitDeSoin,
      category: 'support',
      name: 'Le kit de soin',
      characteristic: '+1CHA SOIN X2',
    },
    {
      id: EquipmentItemId.fourche,
      category: 'tool',
      name: 'La fourche',
      characteristic: '+1HAB +3END',
    },
    {
      id: EquipmentItemId.dague,
      category: 'tool',
      name: 'La dague',
      characteristic: '+1HAB +6CRIT',
    },
    {
      id: EquipmentItemId.kitDEscalade,
      category: 'tool',
      name: 'Le kit d\'escalade',
      characteristic: '+1ADR',
    },
    {
      id: EquipmentItemId.sacDeGrain,
      category: 'tool',
      name: 'Le sac de grain',
      characteristic: '+2END +2CHA',
    },
  ];

  constructor() { }

  get equipmentList() {
    return [...this._equipmentList];
  }

  get allWeapons() {
    return this.equipmentList.filter(i => i.category === 'weapon');
  }

  get allSupports() {
    return this.equipmentList.filter(i => i.category === 'support');
  }

  get allTools() {
    return this.equipmentList.filter(i => i.category === 'tool');
  }

}
