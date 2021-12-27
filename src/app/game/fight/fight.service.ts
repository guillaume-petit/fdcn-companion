import {Injectable} from '@angular/core';
import {Enemy} from './enemy.model';
import {Character} from '../character/character.model';
import {ITEM} from '../inventory/inventory-item.model';
import {BehaviorSubject, combineLatest, pipe} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FightService {

  billy: Character;
  enemy: Enemy;
  fightTurns: Array<FightStatus> = [];
  currentSituation: FightSituation;
  brinkOfDeath = 0;
  turnLimit = -1;
  abilityOffset = new BehaviorSubject<number>(0);

  constructor() { }

  startFight(billy: Character, enemy: Enemy) {
    this.billy = billy;
    this.enemy = enemy;

    combineLatest([this.billy.ability, this.enemy.ability, this.enemy.bonusPB]).subscribe(([billyAbility, enemyAbiliy, bonusPB]) => {
      this.abilityOffset.next(billyAbility.combatValue + bonusPB - enemyAbiliy);
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

    const steps = [];
    if (enemy.statModifier) {
      const modifiers = enemy.statModifier.call(this, this.billy);
      for (const modifier of modifiers) {
        const stat = this.billy.getStat(modifier.statId);
        stat.modifier = modifier.value;
        steps.push(`Vous obtenez ${modifier.value} de ${stat.id} durant ce combat.`);
      }
    }
    if (enemy.turnLimit) {
      this.turnLimit = enemy.turnLimit(this.billy);
    }
    if (this.turnLimit !== -1) {
      steps.push(`Nombre de tours restants: ${this.turnLimit}`);
    }
    let continueFighting = this.checkCurrentSituation(steps);
    this.fightTurns.push({
      billyHp: this.billy.currentHp,
      enemyHp: this.enemy.hp,
      steps
    });
    return continueFighting;
  }

  endFight() {
    if (this.enemy.statModifier) {
      for (const modifier of this.enemy.statModifier.call(this, this.billy)) {
        this.billy.getStat(modifier.statId).modifier = 0;
      }
    }
    this.billy = null;
    this.enemy = null;
    this.brinkOfDeath = 0;
    this.fightTurns = [];
  }

  nextTurn(attack: number, dodge?: number): boolean {
    let continueFighting = true;
    const steps = [];
    if (dodge === 1) {
      attack = 6;
    }
    const result = this.currentSituation.damages.find(damage => damage.dice === attack);

    // ATTAQUE DE BILLY
    if (dodge === 1) {
      const billyDamage = result.billyDamage + this.billy.critical.combatValue;
      this.enemy.hurt(billyDamage);
      steps.push(`Vous infligez ${billyDamage} de dégats critiques à votre adversaire.`);
    } else {
      let billyDamage = result.billyDamage + this.billy.damage.combatValue - this.enemy.armor;
      if (billyDamage < 0) {
        billyDamage = 0;
      }
      steps.push(`Vous infligez ${billyDamage} de dégats à votre adversaire.`);
      this.enemy.hurt(billyDamage);
    }
    if (this.enemy.hp === 0) {
      steps.push(`Vous avez vaincu votre adversaire !`);
      if (this.billy.items.find(value => value.ref === ITEM.petitMedaillon)) {
        this.billy.heal(2);
        steps.push(`Votre ${ITEM.petitMedaillon} vous restaure 2 POINTS DE VIE`);
      }
      continueFighting = false;
    } else {
      // ATTAQUE DE L'ADVERSAIRE
      if (dodge && dodge <= this.billy.dexterity.getValue().combatValue) {
        steps.push(`Vous esquivez complètement l'attaque de votre adversaire.`);
      } else {
        let enemyDamage = result.enemyDamage + this.enemy.damage - this.billy.armor.combatValue;
        if (this.billy.trait.getValue() === 'Paysan' && enemyDamage > 3) {
          enemyDamage = 3;
        }
        if (enemyDamage < 0) {
          enemyDamage = 0;
        }
        steps.push(`Votre adversaire vous inflige ${enemyDamage}  de dégats.`);
        this.billy.hurt(enemyDamage);
      }

      // FIN DU TOUR
      if (this.enemy.onEndTurn) {
        steps.push(...this.enemy.onEndTurn(this.billy, this.enemy));
        continueFighting = continueFighting && this.checkCurrentSituation(steps);
      }
      if (this.billy.currentHp === 0) {
        steps.push(`Vous avez été vaincu !`);
        continueFighting = false;
      } else {
        if (this.turnLimit !== -1) {
          if (this.fightTurns.length === this.turnLimit) {
            steps.push(`Vous n'avez pas réussi à vaincre votre adversaire dans le temps imparti!`);
            continueFighting = false;
          } else {
            steps.push(`Nombre de tours restants: ${this.turnLimit - this.fightTurns.length}`);
          }
        }
      }
    }
    this.fightTurns.push({
      billyHp: this.billy.currentHp,
      enemyHp: this.enemy.hp,
      steps
    });
    return continueFighting;
  }

  tryToFlee(luckTest?: number): boolean {
    const success = this.billy.currentLuck > 5 || luckTest <= this.billy.currentLuck;
    this.billy.spendLuck(this.currentSituation.fleeCost);
    this.fightTurns[0].steps.push(success ? 'Vous réussissez à fuir le combat !'
      : 'Vous ne parvenez pas à fuir le combat. Vous devez vous battre !');
    return success;
  }

  tryToSurvive(luckTest?: number): boolean {
    const success = this.billy.currentLuck > 5 || luckTest <= this.billy.currentLuck;
    this.billy.spendLuck(++this.brinkOfDeath);
    const steps = this.fightTurns[this.fightTurns.length - 1].steps;
    if (success) {
      const hpRestored = this.fightTurns[this.fightTurns.length - 2].billyHp;
      this.fightTurns[this.fightTurns.length - 1].billyHp = hpRestored;
      this.billy.heal(hpRestored);
      steps[steps.length - 1] = 'Vous réussissez à survivre miraculeusement et reprenez le combat !';
    } else {
      steps[steps.length - 1] = 'Vous ne survivez pas à cette attaque. Ce sont des choses qui arrivent.';
    }
    return success;
  }

  tryToDoubleDamage(luckTest?: number): boolean {
    const success = this.billy.currentLuck > 5 || luckTest <= this.billy.currentLuck;
    this.billy.spendLuck(1);
    const previousDamage = this.fightTurns[this.fightTurns.length - 2].enemyHp - this.fightTurns[this.fightTurns.length - 1].enemyHp;
    const steps = this.fightTurns[this.fightTurns.length - 1].steps;
    if (success) {
      this.enemy.hurt(previousDamage);
      this.fightTurns[this.fightTurns.length - 1].enemyHp = this.enemy.hp;
      steps.push(`Vous infligez ${previousDamage} de dégâts chanceux supplémentaires à votre adversaire !`);
      if (this.enemy.hp === 0) {
        steps.push(`Vous avez vaincu votre adversaire !`);
      }
    } else {
      this.enemy.heal(previousDamage);
      this.fightTurns[this.fightTurns.length - 1].enemyHp = this.enemy.hp;
      steps
        .push(`Vous avez complètement raté votre attaque !`);
    }
    return success;
  }

  private checkCurrentSituation(steps: string[]) {
    if (this.currentSituation.abilityOffset < -7) {
      steps.push('Votre adversaire vous domine totalement. Vous perdez automatiquement le combat.');
      return false;
    }
    if (this.currentSituation.abilityOffset > 7) {
      steps.push('Vous dominez totalement votre adversaire. Vous remportez automatiquement le combat.');
      return false;
    }
    return true;
  }
}

interface FightStatus {
  billyHp: number;
  enemyHp: number;
  steps: Array<string>;
}

interface FightSituation {
  name: string;
  abilityOffset: number;
  fleeCost: number;
  damages: Array<{
    dice: number;
    billyDamage: number;
    enemyDamage: number;
  }>;
}

const SITUATION_TABLE: Array<FightSituation> = [{
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
