import {CharacterStatId} from '../character/character-stat.model';
import {EquipmentItemId} from '../equipment/equipment-item.model';
import {Character} from '../character/character.model';
import {ITEM} from '../inventory/inventory-item.model';

export class Enemy {

  id: number;
  name: string;
  ability: number;
  hp: number;
  armor = 0;
  damage = 0;
  bonusPB = 0;
  statModifier: (billy: Character) => Array<StatModifier>;
  turnLimit: (billy: Character) => number;
  onEndTurn: (billy: Character, enemy: Enemy) => void;

  constructor(obj: EnemyModel) {
    this.id = obj.id;
    this.name = obj.name;
    this.ability = obj.ability;
    this.hp = obj.hp;
    this.armor = obj.armor || 0;
    this.damage = obj.damage || 0;
    this.statModifier = obj.statModifier;
    this.turnLimit = obj.turnLimit;
    this.onEndTurn = obj.onEndTurn;
  }

  hurt(amount: number) {
    this.hp -= amount;
    if (this.hp < 0) {
      this.hp = 0;
    }
  }

  heal(amount: number) {
    this.hp += amount;
  }
}

export const ENEMIES: Array<Enemy> = [
  new Enemy({
    id: 14,
    name: 'Guerrier orcs',
    ability: 5,
    hp: 8,
    bonusPB: 4
  }),
  new Enemy({
    id: 19,
    name: 'Gardes corrompus',
    ability: 8,
    hp: 12,
    armor: 1,
    bonusPB: 4,
    statModifier: () => [{statId: CharacterStatId.dexterity, value: -1}]
  }),
  new Enemy({
    id: 36,
    name: '2 squelettes',
    ability: 4,
    hp: 10,
    armor: 0,
    statModifier: billy => {
        if (billy.equipment.getValue().find(e => e.id === EquipmentItemId.arc)) {
          return [{statId: CharacterStatId.damage, value: -1}];
        }
        if (billy.equipment.getValue().find(e => e.id === EquipmentItemId.morgenstern)) {
          return [{statId: CharacterStatId.damage, value: 1}];
        }
        return [];
      },
    turnLimit: billy =>
      billy.items.filter(item => item === ITEM.info).length >= 3 ? 8 : 5
  }),
  new Enemy({
    id: 54,
    name: 'Orc familier',
    ability: 10,
    hp: 16,
    damage: 1
  }),
  new Enemy({
    id: 58,
    name: 'Gnoll sanguinaire',
    ability: 5,
    hp: 10,
    statModifier: billy => [{ statId: CharacterStatId.ability, value: -Math.floor(billy.ability.getValue().total / 2) }]
  }),
  new Enemy({
    id: 74,
    name: '5 bandits de grand chemin',
    ability: 11,
    hp: 15,
    bonusPB: 6,
    statModifier: () => [{ statId: CharacterStatId.dexterity, value: -1 }]
  }),
  new Enemy({
    id: 76,
    name: '5 guerriers squelletes',
    ability: 12,
    hp: 20,
    bonusPB: 4,
    statModifier: billy => {
        if (billy.equipment.getValue().find(e => e.id === EquipmentItemId.arc)) {
          return [
            {statId: CharacterStatId.ability, value: -3},
            {statId: CharacterStatId.dexterity, value: -1},
            {statId: CharacterStatId.critical, value: -4},
          ];
        }
        if (billy.equipment.getValue().find(e => e.id === EquipmentItemId.morgenstern)) {
          return [{statId: CharacterStatId.damage, value: 1}];
        }
        return [];
      },
    onEndTurn: (billy, enemy) => {
      if (enemy.hp > 16) {
        enemy.ability = 12;
      }
      if (enemy.hp > 12 && enemy.hp <= 16) {
        enemy.ability = 11;
      }
      if (enemy.hp > 8 && enemy.hp <= 12) {
        enemy.ability = 10;
      }
      if (enemy.hp > 4 && enemy.hp <= 8) {
        enemy.ability = 9;
      }
      if (enemy.hp <= 4) {
        enemy.ability = 8;
      }
    }
  })
];

interface EnemyModel {
  id: number;
  name: string;
  ability: number;
  hp: number;
  armor?: number;
  damage?: number;
  bonusPB?: number;
  statModifier?: (billy: Character) => Array<StatModifier>;
  turnLimit?: (billy: Character) => number;
  onEndTurn?: (billy: Character, enemy: Enemy) => void;
}

interface StatModifier {
  statId: CharacterStatId;
  value: number;
}
