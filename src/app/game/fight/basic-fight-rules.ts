import {FightRules, FightSituation, FightStatus, SITUATION_TABLE} from './fight-rules.interface';
import {BehaviorSubject, combineLatest} from "rxjs";
import {Character} from "../character/character.model";
import {Enemy} from "./enemy.model";
import {ITEM} from "../inventory/inventory-item.model";

export class BasicFightRules implements FightRules {

  billy: Character;
  enemy: Enemy;
  fightTurns: Array<FightStatus> = [];
  currentSituation: FightSituation;
  brinkOfDeath = 0;
  turnLimit = -1;
  abilityOffset = new BehaviorSubject<number>(0);

  billyAttack(attack: number, critical: boolean, damage: number, steps: any[]): boolean {
    if (this.enemy.dodge(attack)) {
      steps.push('L\'adversaire esquive votre coup!');
      return true;
    }
    if (critical) {
      const billyDamage = damage + this.billy.critical.combatValue;
      this.enemy.hurt(billyDamage);
      steps.push(`Vous infligez ${billyDamage} de dégats critiques à votre adversaire.`);
    } else {
      let billyDamage = damage + this.billy.damage.combatValue - this.enemy.armor;
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
      return false;
    }
    return true;
  }

  end(): void {
    if (this.enemy.statModifier) {
      for (const modifier of this.enemy.statModifier.call(this, this.billy)) {
        this.billy.modifyStat(modifier.statId, 0);
      }
    }
  }

  enemyAttack(dodge: number, damage: number, steps: any[]): boolean {
    if (dodge && dodge <= this.billy.dexterity.getValue().combatValue) {
      steps.push(`Vous esquivez complètement l'attaque de votre adversaire.`);
    } else {
      let enemyDamage = damage + this.enemy.damage - this.billy.armor.combatValue;
      if (this.billy.trait.getValue() === 'Paysan' && enemyDamage > 3) {
        enemyDamage = 3;
      }
      if (enemyDamage < 0) {
        enemyDamage = 0;
      }
      steps.push(`Votre adversaire vous inflige ${enemyDamage}  de dégats.`);
      this.billy.hurt(enemyDamage);

      if (this.billy.currentHp === 0) {
        steps.push(`Vous avez été vaincu !`);
        return false;
      }
    }
    return true;
  }

  next(attack: number, dodge?: number): boolean {
    let continueFighting = true;
    const steps = [];
    if (dodge === 1) {
      attack = 6;
    }
    const result = this.currentSituation.damages.find(damage => damage.dice === attack);

    if (!this.enemy.hasInitiative) {
      continueFighting = continueFighting && this.billyAttack(attack, dodge === 1, result.billyDamage, steps);
      if (continueFighting) {
        continueFighting = continueFighting && this.enemyAttack(dodge, result.enemyDamage, steps);
      }
    } else {
      continueFighting = continueFighting && this.enemyAttack(dodge, result.enemyDamage, steps);
      if (continueFighting) {
        continueFighting = continueFighting && this.billyAttack(attack, dodge === 1, result.billyDamage, steps);
      }
    }

    if (continueFighting) {
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

  start(billy: Character, enemy: Enemy): boolean {
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

    const steps = [];
    if (enemy.statModifier) {
      const modifiers = enemy.statModifier.call(this, this.billy);
      for (const modifier of modifiers) {
        this.billy.modifyStat(modifier.statId, modifier.value);
        steps.push(`Vous obtenez ${modifier.value} de ${modifier.statId} durant ce combat.`);
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
