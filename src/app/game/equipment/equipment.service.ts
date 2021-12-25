import {Injectable} from '@angular/core';
import {EquipmentItem, EquipmentItemId} from "./equipment-item.model";
import {CharacterStatId} from "../character/character-stat.model";

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {

  private _equipmentList: Array<EquipmentItem> = [
    {
      id: EquipmentItemId.epee,
      category: 'weapon',
      name: 'Épée',
      statModifier: [{
        statId: CharacterStatId.ability,
        value: 4
      }]
    },
    {
      id: EquipmentItemId.lance,
      category: 'weapon',
      name: 'Lance',
      statModifier: [{
        statId: CharacterStatId.ability,
        value: 3
      }, {
        statId: CharacterStatId.dexterity,
        value: 1
      }]
    },
    {
      id: EquipmentItemId.morgenstern,
      category: 'weapon',
      name: 'Morgenstern',
      statModifier: [{
        statId: CharacterStatId.ability,
        value: 1
      }, {
        statId: CharacterStatId.toughness,
        value: 1
      }, {
        statId: CharacterStatId.damage,
        value: 1
      }]
    },
    {
      id: EquipmentItemId.arc,
      category: 'weapon',
      name: 'Arc',
      statModifier: [{
        statId: CharacterStatId.ability,
        value: 3
      }, {
        statId: CharacterStatId.dexterity,
        value: 1
      }, {
        statId: CharacterStatId.critical,
        value: 4
      }]
    },
    {
      id: EquipmentItemId.petiteMassue,
      category: 'weapon',
      name: 'Petite Massue',
      statModifier: [{
        statId: CharacterStatId.damage,
        value: 1
      }]
    },
    {
      id: EquipmentItemId.cotteDeMaille,
      category: 'support',
      name: 'Cotte de maille',
      statModifier: [{
        statId: CharacterStatId.ability,
        value: -1
      }, {
        statId: CharacterStatId.dexterity,
        value: -1
      }, {
        statId: CharacterStatId.toughness,
        value: 1
      }, {
        statId: CharacterStatId.armor,
        value: 2
      }]
    },
    {
      id: EquipmentItemId.marmite,
      category: 'support',
      name: 'Marmite',
      statModifier: [{
        statId: CharacterStatId.toughness,
        value: 2
      }, {
        statId: CharacterStatId.armor,
        value: 1
      }]
    },
    {
      id: EquipmentItemId.pamphletTouristique,
      category: 'support',
      name: 'Pamphlet touristique',
      statModifier: [{
        statId: CharacterStatId.luck,
        value: 4
      }]
    },
    {
      id: EquipmentItemId.kitDeSoin,
      category: 'support',
      name: 'Kit de soin',
      statModifier: [{
        statId: CharacterStatId.luck,
        value: 1
      }]
    },
    {
      id: EquipmentItemId.fourche,
      category: 'tool',
      name: 'Fourche',
      statModifier: [{
        statId: CharacterStatId.ability,
        value: 1
      }, {
        statId: CharacterStatId.toughness,
        value: 3
      }]
    },
    {
      id: EquipmentItemId.dague,
      category: 'tool',
      name: 'Dague',
      statModifier: [{
        statId: CharacterStatId.ability,
        value: 1
      }, {
        statId: CharacterStatId.critical,
        value: 6
      }]
    },
    {
      id: EquipmentItemId.kitDEscalade,
      category: 'tool',
      name: 'Kit d\'escalade',
      statModifier: [{
        statId: CharacterStatId.dexterity,
        value: 1
      }]
    },
    {
      id: EquipmentItemId.sacDeGrain,
      category: 'tool',
      name: 'Sac de grain',
      statModifier: [{
        statId: CharacterStatId.toughness,
        value: 2
      }, {
        statId: CharacterStatId.luck,
        value: 2
      }]
    }
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
