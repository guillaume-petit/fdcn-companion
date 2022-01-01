import {Character} from "../character/character.model";
import {Enemy} from "./enemy.model";
import {BehaviorSubject} from "rxjs";

export interface FightRules {
  billy: Character;
  enemy: Enemy;
  fightTurns: Array<FightStatus>;
  currentSituation: FightSituation;
  brinkOfDeath: number;
  turnLimit: number;
  abilityOffset: BehaviorSubject<number>;

  start(billy: Character, enemy: Enemy): boolean;

  end(): void;

  next(attack: number, dodge?: number): boolean;

  enemyAttack(dodge: number, damage: number, steps: any[]): boolean;

  billyAttack(attack: number, critical: boolean, damage: number, steps: any[]): boolean;

  tryToFlee(luckTest?: number): boolean;

  tryToSurvive(luckTest?: number): boolean;

  tryToDoubleDamage(luckTest?: number): boolean;
}

export interface FightStatus {
  billyHp: number;
  enemyHp: number;
  steps: Array<string>;
}

export interface FightSituation {
  name: string;
  abilityOffset: number;
  fleeCost: number;
  damages: Array<{
    dice: number;
    billyDamage: number;
    enemyDamage: number;
  }>;
}

export const SITUATION_TABLE: Array<FightSituation> = [{
  name: 'Désavantage lourd',
  abilityOffset: -7,
  fleeCost: 5,
  damages: [{
    dice: 1,
    billyDamage: 0,
    enemyDamage: 12
  }, {
    dice: 2,
    billyDamage: 0,
    enemyDamage: 9
  }, {
    dice: 3,
    billyDamage: 1,
    enemyDamage: 8
  }, {
    dice: 4,
    billyDamage: 2,
    enemyDamage: 6
  }, {
    dice: 5,
    billyDamage: 2,
    enemyDamage: 5
  }, {
    dice: 6,
    billyDamage: 3,
    enemyDamage: 4
  }]
}, {
  name: 'Désavantage lourd',
  abilityOffset: -6,
  fleeCost: 5,
  damages: [{
    dice: 1,
    billyDamage: 1,
    enemyDamage: 8
  }, {
    dice: 2,
    billyDamage: 1,
    enemyDamage: 7
  }, {
    dice: 3,
    billyDamage: 1,
    enemyDamage: 6
  }, {
    dice: 4,
    billyDamage: 2,
    enemyDamage: 5
  }, {
    dice: 5,
    billyDamage: 2,
    enemyDamage: 5
  }, {
    dice: 6,
    billyDamage: 3,
    enemyDamage: 4
  }]
}, {
  name: 'Désavantage lourd',
  abilityOffset: -5,
  fleeCost: 5,
  damages: [{
    dice: 1,
    billyDamage: 1,
    enemyDamage: 7
  }, {
    dice: 2,
    billyDamage: 1,
    enemyDamage: 6
  }, {
    dice: 3,
    billyDamage: 1,
    enemyDamage: 5
  }, {
    dice: 4,
    billyDamage: 2,
    enemyDamage: 5
  }, {
    dice: 5,
    billyDamage: 3,
    enemyDamage: 4
  }, {
    dice: 6,
    billyDamage: 4,
    enemyDamage: 4
  }]
}, {
  name: 'Désavantage',
  abilityOffset: -4,
  fleeCost: 3,
  damages: [{
    dice: 1,
    billyDamage: 1,
    enemyDamage: 6
  }, {
    dice: 2,
    billyDamage: 2,
    enemyDamage: 6
  }, {
    dice: 3,
    billyDamage: 2,
    enemyDamage: 5
  }, {
    dice: 4,
    billyDamage: 2,
    enemyDamage: 4
  }, {
    dice: 5,
    billyDamage: 3,
    enemyDamage: 3
  }, {
    dice: 6,
    billyDamage: 4,
    enemyDamage: 3
  }]
}, {
  name: 'Désavantage',
  abilityOffset: -3,
  fleeCost: 3,
  damages: [{
    dice: 1,
    billyDamage: 2,
    enemyDamage: 6
  }, {
    dice: 2,
    billyDamage: 2,
    enemyDamage: 5
  }, {
    dice: 3,
    billyDamage: 2,
    enemyDamage: 4
  }, {
    dice: 4,
    billyDamage: 3,
    enemyDamage: 4
  }, {
    dice: 5,
    billyDamage: 3,
    enemyDamage: 3
  }, {
    dice: 6,
    billyDamage: 4,
    enemyDamage: 3
  }]
}, {
  name: 'Désavantage léger',
  abilityOffset: -2,
  fleeCost: 1,
  damages: [{
    dice: 1,
    billyDamage: 2,
    enemyDamage: 6
  }, {
    dice: 2,
    billyDamage: 2,
    enemyDamage: 5
  }, {
    dice: 3,
    billyDamage: 2,
    enemyDamage: 4
  }, {
    dice: 4,
    billyDamage: 3,
    enemyDamage: 3
  }, {
    dice: 5,
    billyDamage: 4,
    enemyDamage: 3
  }, {
    dice: 6,
    billyDamage: 5,
    enemyDamage: 3
  }]
}, {
  name: 'Désavantage léger',
  abilityOffset: -1,
  fleeCost: 1,
  damages: [{
    dice: 1,
    billyDamage: 3,
    enemyDamage: 6
  }, {
    dice: 2,
    billyDamage: 3,
    enemyDamage: 5
  }, {
    dice: 3,
    billyDamage: 3,
    enemyDamage: 4
  }, {
    dice: 4,
    billyDamage: 3,
    enemyDamage: 3
  }, {
    dice: 5,
    billyDamage: 4,
    enemyDamage: 3
  }, {
    dice: 6,
    billyDamage: 5,
    enemyDamage: 3
  }]
}, {
  name: 'égalité',
  abilityOffset: 0,
  fleeCost: 1,
  damages: [{
    dice: 1,
    billyDamage: 3,
    enemyDamage: 5
  }, {
    dice: 2,
    billyDamage: 3,
    enemyDamage: 4
  }, {
    dice: 3,
    billyDamage: 3,
    enemyDamage: 3
  }, {
    dice: 4,
    billyDamage: 3,
    enemyDamage: 3
  }, {
    dice: 5,
    billyDamage: 4,
    enemyDamage: 3
  }, {
    dice: 6,
    billyDamage: 5,
    enemyDamage: 3
  }]
}, {
  name: 'Avantage léger',
  abilityOffset: 1,
  fleeCost: 1,
  damages: [{
    dice: 1,
    billyDamage: 3,
    enemyDamage: 5
  }, {
    dice: 2,
    billyDamage: 3,
    enemyDamage: 4
  }, {
    dice: 3,
    billyDamage: 3,
    enemyDamage: 3
  }, {
    dice: 4,
    billyDamage: 4,
    enemyDamage: 3
  }, {
    dice: 5,
    billyDamage: 5,
    enemyDamage: 3
  }, {
    dice: 6,
    billyDamage: 6,
    enemyDamage: 3
  }]
}, {
  name: 'Avantage léger',
  abilityOffset: 2,
  fleeCost: 1,
  damages: [{
    dice: 1,
    billyDamage: 3,
    enemyDamage: 5
  }, {
    dice: 2,
    billyDamage: 3,
    enemyDamage: 4
  }, {
    dice: 3,
    billyDamage: 3,
    enemyDamage: 3
  }, {
    dice: 4,
    billyDamage: 4,
    enemyDamage: 2
  }, {
    dice: 5,
    billyDamage: 5,
    enemyDamage: 2
  }, {
    dice: 6,
    billyDamage: 6,
    enemyDamage: 2
  }]
}, {
  name: 'Avantage',
  abilityOffset: 3,
  fleeCost: 1,
  damages: [{
    dice: 1,
    billyDamage: 3,
    enemyDamage: 4
  }, {
    dice: 2,
    billyDamage: 3,
    enemyDamage: 3
  }, {
    dice: 3,
    billyDamage: 4,
    enemyDamage: 3
  }, {
    dice: 4,
    billyDamage: 4,
    enemyDamage: 2
  }, {
    dice: 5,
    billyDamage: 5,
    enemyDamage: 2
  }, {
    dice: 6,
    billyDamage: 6,
    enemyDamage: 2
  }]
}, {
  name: 'Avantage',
  abilityOffset: 4,
  fleeCost: 1,
  damages: [{
    dice: 1,
    billyDamage: 3,
    enemyDamage: 4
  }, {
    dice: 2,
    billyDamage: 3,
    enemyDamage: 3
  }, {
    dice: 3,
    billyDamage: 4,
    enemyDamage: 2
  }, {
    dice: 4,
    billyDamage: 5,
    enemyDamage: 2
  }, {
    dice: 5,
    billyDamage: 6,
    enemyDamage: 2
  }, {
    dice: 6,
    billyDamage: 6,
    enemyDamage: 1
  }]
}, {
  name: 'Avantage lourd',
  abilityOffset: 5,
  fleeCost: 0,
  damages: [{
    dice: 1,
    billyDamage: 4,
    enemyDamage: 4
  }, {
    dice: 2,
    billyDamage: 4,
    enemyDamage: 3
  }, {
    dice: 3,
    billyDamage: 5,
    enemyDamage: 2
  }, {
    dice: 4,
    billyDamage: 5,
    enemyDamage: 1
  }, {
    dice: 5,
    billyDamage: 6,
    enemyDamage: 1
  }, {
    dice: 6,
    billyDamage: 7,
    enemyDamage: 1
  }]
}, {
  name: 'Avantage lourd',
  abilityOffset: 6,
  fleeCost: 0,
  damages: [{
    dice: 1,
    billyDamage: 4,
    enemyDamage: 3
  }, {
    dice: 2,
    billyDamage: 5,
    enemyDamage: 2
  }, {
    dice: 3,
    billyDamage: 5,
    enemyDamage: 2
  }, {
    dice: 4,
    billyDamage: 6,
    enemyDamage: 1
  }, {
    dice: 5,
    billyDamage: 7,
    enemyDamage: 1
  }, {
    dice: 6,
    billyDamage: 8,
    enemyDamage: 1
  }]
}, {
  name: 'Avantage lourd',
  abilityOffset: 7,
  fleeCost: 0,
  damages: [{
    dice: 1,
    billyDamage: 4,
    enemyDamage: 3
  }, {
    dice: 2,
    billyDamage: 5,
    enemyDamage: 2
  }, {
    dice: 3,
    billyDamage: 6,
    enemyDamage: 2
  }, {
    dice: 4,
    billyDamage: 8,
    enemyDamage: 1
  }, {
    dice: 5,
    billyDamage: 9,
    enemyDamage: 0
  }, {
    dice: 6,
    billyDamage: 12,
    enemyDamage: 0
  }]
}];
