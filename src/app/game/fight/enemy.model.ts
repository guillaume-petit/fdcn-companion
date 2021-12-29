import {CharacterStatId} from '../character/character-stat.model';
import {EquipmentItemId} from '../equipment/equipment-item.model';
import {Character} from '../character/character.model';
import {ITEM} from '../inventory/inventory-item.model';
import {BehaviorSubject} from "rxjs";
import {StatModifier} from "../character/stat-modifier.model";

export class Enemy {

  id: number;
  name: string;
  ability = new BehaviorSubject<number>(0);
  hp: number;
  armor = 0;
  damage = 0;
  bonusPB = new BehaviorSubject<number>(0);
  statModifier: (billy: Character) => Array<StatModifier>;
  turnLimit: (billy: Character) => number;
  dodge: (attackDice: number) => boolean;
  onEndTurn: (billy: Character, enemy: Enemy) => string[];
  additionalProperties: any;
  icon: string;
  hasInitiative: boolean;

  constructor(obj: EnemyModel) {
    this.id = obj.id;
    this.name = obj.name;
    this.ability.next(obj.ability);
    this.bonusPB.next(obj.bonusPB || 0);
    this.hp = obj.hp;
    this.armor = obj.armor || 0;
    this.damage = obj.damage || 0;
    this.statModifier = obj.statModifier;
    this.turnLimit = obj.turnLimit;
    this.dodge = obj.dodge || (() => false);
    this.onEndTurn = obj.onEndTurn;
    this.additionalProperties = obj.additionalProperties;
    this.icon = obj.icon || 'default.svg';
    this.hasInitiative = obj.hasInitiative || false;
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

export const ENEMIES: Array<EnemyModel> = [
  {
    id: 14,
    name: 'Guerrier orcs',
    ability: 5,
    hp: 8,
    bonusPB: 4,
    icon: 'orc-head.svg'
  }, {
    id: 19,
    name: 'Gardes corrompus',
    ability: 8,
    hp: 12,
    armor: 1,
    bonusPB: 4,
    icon: 'guards.svg',
    statModifier: () => [{statId: CharacterStatId.dexterity, value: -1}]
  }, {
    id: 36,
    name: '2 squelettes',
    ability: 4,
    hp: 10,
    armor: 0,
    icon: 'evil-minion.svg',
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
      billy.items.filter(item => item.ref === ITEM.info).length >= 3 ? 8 : 5
  }, {
    id: 54,
    name: 'Orc familier',
    ability: 10,
    hp: 16,
    damage: 1,
    icon: 'orc-head.svg'
  }, {
    id: 58,
    name: 'Gnoll sanguinaire',
    ability: 5,
    hp: 10,
    icon: 'goblin-head.svg',
    statModifier: billy => [{ statId: CharacterStatId.ability, value: -Math.floor(billy.ability.getValue().total / 2) }]
  }, {
    id: 74,
    name: '5 bandits de grand chemin',
    ability: 11,
    hp: 15,
    bonusPB: 6,
    icon: 'cowled.svg',
    statModifier: () => [{ statId: CharacterStatId.dexterity, value: -1 }]
  }, {
    id: 76,
    name: '5 guerriers squelletes',
    ability: 12,
    hp: 20,
    bonusPB: 4,
    icon: 'evil-minion.svg',
    statModifier: billy => {
        if (billy.equipment.getValue().find(e => e.id === EquipmentItemId.arc)) {
          return [
            {statId: CharacterStatId.ability, value: -3},
            {statId: CharacterStatId.dexterity, value: -1},
            {statId: CharacterStatId.critical, value: -4},
          ];
        }
        if (billy.equipment.getValue().find(e => e.id === EquipmentItemId.morgenstern || e.id === EquipmentItemId.petiteMassue)) {
          return [{statId: CharacterStatId.damage, value: 1}];
        }
        return [];
      },
    onEndTurn: (billy, enemy) => {
      enemy.ability.next(7 + Math.ceil(enemy.hp / 4));
      return [];
    }
  }, {
    id: 97,
    name: 'Massacre',
    ability: 12,
    hp: 20,
    damage: 1,
    bonusPB: 4,
    icon: 'massacre.png',
    turnLimit: billy => billy.items.filter(item => item.ref === ITEM.info).length >= 3 ? 8 : 5,
    onEndTurn: (billy, enemy) => {
      const steps = [];
      if (!enemy.additionalProperties?.hasOwnProperty('counter')) {
        enemy.additionalProperties = {
          counter: 0
        };
      }
      if (++enemy.additionalProperties.counter % 3 === 0) {
        let dexterityRoll = Math.floor(Math.random() * 6 + 1);
        if (billy.dexterity.getValue().combatValue > 1) {
          if (dexterityRoll <= billy.dexterity.getValue().combatValue) {
            steps.push(`Massacre invoque un trait de flamme mais vous esquivez son attaque ! (Jet d\'esquive réussi : ${dexterityRoll})`);
          } else {
            billy.hurt(3);
            steps.push(`Massacre invoque un trait de flamme et vous inflige 3 de dégâts ! (Jet d\'esquive raté : ${dexterityRoll})`);
          }
        } else {
          billy.hurt(3);
          steps.push(`Massacre invoque un trait de flamme et vous inflige 3 de dégâts.`);
        }
      }
      return steps;
    }
  }, {
    id: 114,
    name: 'Orc Esclavagiste',
    icon: 'orc-head.svg',
    ability: 10,
    hp: 10,
    bonusPB: 4,
    hasInitiative: true
  }, {
    id: 133,
    name: 'Garde Corrompu (x2)',
    icon: 'guards.svg',
    ability: 4,
    hp: 7,
    damage: 1,
    statModifier: billy => {
      if (billy.ability.getValue().total < 4) {
        return [{statId: CharacterStatId.ability, value: (-billy.ability.getValue().total + 4)}];
      } else {
        return [];
      }
    }
  }, {
    id: 155,
    name: '5 guerriers squelletes',
    ability: 12,
    hp: 20,
    bonusPB: 2,
    icon: 'evil-minion.svg',
    statModifier: billy => {
      if (billy.equipment.getValue().find(e => e.id === EquipmentItemId.arc)) {
        return [
          {statId: CharacterStatId.ability, value: -3},
          {statId: CharacterStatId.dexterity, value: -2},
          {statId: CharacterStatId.critical, value: -4},
        ];
      }
      if (billy.equipment.getValue().find(e => e.id === EquipmentItemId.morgenstern || e.id === EquipmentItemId.petiteMassue)) {
        return [
          {statId: CharacterStatId.damage, value: 1},
          {statId: CharacterStatId.dexterity, value: -1}
        ];
      }
      return [{statId: CharacterStatId.dexterity, value: -1}];
    },
    onEndTurn: (billy, enemy) => {
      enemy.ability.next(7 + Math.ceil(enemy.hp / 4));
      return [];
    }
  }, {
    id: 162,
    name: 'Trollesse Affaiblie',
    icon: 'troll.svg',
    ability: 11,
    hp: 12,
    damage: 1,
    bonusPB: 4,
    statModifier: billy => {
      if (billy.critical.total > 0) {
        return [{statId: CharacterStatId.critical, value: -billy.critical.total}];
      }
      return [];
    }
  }, {
    id: 173,
    name: 'Bandit à la cape cramoisie (rouge)',
    icon: 'evil-minion.svg',
    ability: 6,
    hp: 10,
    dodge: (attackDice) => attackDice <= 2
  }
];

export interface EnemyModel {
  id: number;
  name: string;
  ability: number;
  hp: number;
  armor?: number;
  damage?: number;
  bonusPB?: number;
  statModifier?: (billy: Character) => Array<StatModifier>;
  turnLimit?: (billy: Character) => number;
  dodge?: (attackDice: number) => boolean;
  onEndTurn?: (billy: Character, enemy: Enemy) => string[];
  additionalProperties?: any;
  icon?: string;
  hasInitiative?: boolean;
}
