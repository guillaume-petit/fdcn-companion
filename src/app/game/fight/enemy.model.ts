import {Character} from '../character/character.model';
import {BehaviorSubject} from "rxjs";
import {StatModifier} from "../character/stat-modifier.model";
import {FightRules} from "./fight-rules.interface";
import {BasicFightRules} from "./basic-fight-rules";
import {FightState} from "./fight-state";

export class Enemy {

  id: string;
  name: string;
  ability = new BehaviorSubject<number>(0);
  hp: number;
  armor = 0;
  damage = 0;
  bonusPB = new BehaviorSubject<number>(0);
  minHp = 0;
  statModifier: (billy: Character) => Array<StatModifier>;
  turnLimit: (billy: Character) => number;
  dodge: (attackDice: number, ctx?: FightState) => boolean;
  onEndTurn: (billy: Character, enemy: Enemy) => string[];
  additionalProperties: any;
  icon: string;
  hasInitiative: boolean;
  fightRules: FightRules;

  constructor(obj: EnemyModel) {
    this.id = obj.id;
    this.name = obj.name;
    this.ability.next(obj.ability);
    this.bonusPB.next(obj.bonusPB || 0);
    this.hp = obj.hp;
    this.armor = obj.armor || 0;
    this.damage = obj.damage || 0;
    this.minHp = obj.minHp || 0;
    this.statModifier = obj.statModifier;
    this.turnLimit = obj.turnLimit;
    this.dodge = obj.dodge || (() => false);
    this.onEndTurn = obj.onEndTurn;
    this.additionalProperties = obj.additionalProperties;
    this.icon = obj.icon || 'default.svg';
    this.hasInitiative = obj.hasInitiative || false;
    this.fightRules = obj.fightRules || new BasicFightRules();
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

  get isDefeated() {
    return this.hp === 0 || this.hp <= this.minHp;
  }
}

export interface EnemyModel {
  id: string;
  name: string;
  ability: number;
  hp: number;
  armor?: number;
  damage?: number;
  bonusPB?: number;
  minHp?: number;
  statModifier?: (billy: Character) => Array<StatModifier>;
  turnLimit?: (billy: Character) => number;
  dodge?: (attackDice: number, ctx?: FightState) => boolean;
  onEndTurn?: (billy: Character, enemy: Enemy) => string[];
  additionalProperties?: any;
  icon?: string;
  hasInitiative?: boolean;
  fightRules?: FightRules;
}
