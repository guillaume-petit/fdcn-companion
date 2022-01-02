import {Character} from "../character/character.model";
import {Enemy} from "./enemy.model";
import {FightSituation, FightStatus, SITUATION_TABLE} from "./fight-rules.interface";
import {BehaviorSubject, combineLatest} from "rxjs";

export class FightState {
  billy: Character;
  enemy: Enemy;
  fightTurns: Array<FightStatus> = [];
  currentSituation: FightSituation;
  brinkOfDeath = 0;
  turnLimit = -1;
  abilityOffset = new BehaviorSubject<number>(0);

  constructor(billy: Character, enemy: Enemy) {
    this.billy = billy;
    this.enemy = enemy;

    combineLatest([this.billy.ability, this.enemy.ability, this.enemy.bonusPB]).subscribe(([billyAbility, enemyAbility, bonusPB]) => {
      this.abilityOffset.next(billyAbility.combatValue + bonusPB - enemyAbility);
    });

    this.abilityOffset.subscribe(abilityOffset => {
      if (abilityOffset < -7) {
        this.currentSituation = {
          name: 'Dominé',
          fleeCost: -1,
          abilityOffset: abilityOffset,
          damages: []
        };
      } else if (abilityOffset > 7) {
        this.currentSituation = {
          name: 'Dominant',
          fleeCost: -1,
          abilityOffset: abilityOffset,
          damages: []
        };
      } else {
        this.currentSituation = SITUATION_TABLE.find(s => s.abilityOffset === abilityOffset);
      }
    });
  }
}
