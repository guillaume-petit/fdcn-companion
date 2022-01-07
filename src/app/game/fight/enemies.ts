import {CharacterStatId} from "../character/character-stat.model";
import {EquipmentItemId} from "../equipment/equipment-item.model";
import {ITEM} from "../inventory/inventory-item.model";
import {EnemyModel} from "./enemy.model";
import {BasicFightRules} from "./basic-fight-rules";
import {FightState} from "./fight-state";

export const ENEMIES: Array<EnemyModel> = [
  {
    id: '14',
    name: 'Guerrier orcs',
    ability: 5,
    hp: 8,
    bonusPB: 4,
    icon: 'orc-head.svg'
  }, {
    id: '19',
    name: 'Gardes corrompus',
    ability: 8,
    hp: 12,
    armor: 1,
    bonusPB: 4,
    icon: 'guards.svg',
    statModifier: () => [{statId: CharacterStatId.dexterity, value: -1}]
  }, {
    id: '36',
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
    id: '54',
    name: 'Orc familier',
    ability: 10,
    hp: 16,
    damage: 1,
    icon: 'orc-head.svg'
  }, {
    id: '58',
    name: 'Gnoll sanguinaire',
    ability: 5,
    hp: 10,
    icon: 'goblin-head.svg',
    statModifier: billy => [{ statId: CharacterStatId.ability, value: -Math.floor(billy.ability.getValue().total / 2) }]
  }, {
    id: '74',
    name: '5 bandits de grand chemin',
    ability: 11,
    hp: 15,
    bonusPB: 6,
    icon: 'cowled.svg',
    statModifier: () => [{ statId: CharacterStatId.dexterity, value: -1 }]
  }, {
    id: '76',
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
    id: '97',
    name: 'Massacre',
    ability: 12,
    hp: 20,
    damage: 1,
    bonusPB: 4,
    icon: 'massacre.png',
    additionalProperties: {
      counter: 0
    },
    turnLimit: billy => billy.items.filter(item => item.ref === ITEM.info).length >= 3 ? 8 : 5,
    onEndTurn: (billy, enemy) => {
      const steps = [];
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
    id: '114',
    name: 'Orc Esclavagiste',
    icon: 'orc-head.svg',
    ability: 10,
    hp: 10,
    bonusPB: 4,
    hasInitiative: true
  }, {
    id: '133',
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
    id: '155',
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
    id: '162',
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
    id: '173',
    name: 'Bandit à la cape cramoisie (rouge)',
    icon: 'evil-minion.svg',
    ability: 6,
    hp: 10,
    dodge: (attackDice) => attackDice <= 2
  }, {
    id: '175',
    name: '3 elfes noires',
    icon: 'woman-elf-face.svg',
    ability: 11,
    hp: 8,
    bonusPB: 4,
    dodge: (attackDice) => attackDice % 2 === 0
  }, {
    id: '231',
    name: '4 hommes d\'armes',
    icon: 'guards.svg',
    ability: 11,
    hp: 16,
    bonusPB: 4,
    onEndTurn: (billy, enemy) => {
      enemy.ability.next(7 + Math.ceil(enemy.hp / 4));
      return [];
    }
  }, {
    id: '232',
    name: 'Ogre mal embouché',
    icon: 'troll.svg',
    ability: 10,
    hp: 20,
    damage: 1,
    bonusPB: 4,
    fightRules: new class extends BasicFightRules {
      getEnemyDamage(fightState: FightState, damage: number): number {
        let enemyDamage = super.getEnemyDamage(fightState, damage);
        if (fightState.enemy.hp <= 10) {
          enemyDamage *= 2;
        }
        return enemyDamage;
      }
    }()
  }, {
    id: '240',
    name: 'Guêpe géante',
    ability: 8,
    hp: 10,
    dodge: ((attackDice, ctx) => {
      if (!ctx.billy.equipment.getValue().find(e => e.id === EquipmentItemId.arc || e.id === EquipmentItemId.lance)) {
        return attackDice <= 3;
      }
      return false;
    }),
    minHp: 3
  }, {
    id: '274a',
    name: 'Gardes corrompus',
    ability: 6,
    hp: 8
  }, {
    id: '274b',
    name: 'Trollesse',
    ability: 13,
    hp: 16,
    damage: 1,
    fightRules: new class extends BasicFightRules {
      billyCriticalHit(damage: number, fightState: FightState, steps: any[]) {
        steps.push('La trollesse esquive votre coup critique grâce à ses multiples bras.');
      }
    }
  }, {
    id: '276',
    name: 'Mortelle',
    ability: 12,
    hp: 26,
    bonusPB: 2,
    additionalProperties: {
      entangled: true
    },
    fightRules: new class extends BasicFightRules {
      start(fightState: FightState) {
        fightState.billy.modifyStat(CharacterStatId.dexterity, -2);
        return super.start(fightState);
      }

      billyAttack(fightState: FightState, attack: number, critical: boolean, damage: number, steps: any[]) {
        if (attack >= 5 && fightState.enemy.additionalProperties.entangled) {
          fightState.enemy.additionalProperties.entangled = false;
          fightState.enemy.bonusPB.next(4);
          fightState.billy.modifyStat(CharacterStatId.dexterity, 0);
          steps.push('Vous vous libérez des toiles d\'araignées qui gênaient vos mouvements.');
        }
        super.billyAttack(fightState, attack, critical, damage, steps);
      }

      end(fightState: FightState) {
        if (fightState.enemy.additionalProperties.entangled) {
          fightState.billy.modifyStat(CharacterStatId.dexterity, 0);
        }
        super.end(fightState);
      }
    }
  }
];
