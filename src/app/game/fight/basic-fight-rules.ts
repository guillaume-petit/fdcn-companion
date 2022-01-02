import {FightRules, FightSituation, FightStatus, SITUATION_TABLE} from './fight-rules.interface';
import {BehaviorSubject, combineLatest} from "rxjs";
import {Character} from "../character/character.model";
import {Enemy} from "./enemy.model";
import {ITEM} from "../inventory/inventory-item.model";
import {FightState} from "./fight-state";

export class BasicFightRules implements FightRules {

  billyAttack(fightState: FightState, attack: number, critical: boolean, damage: number, steps: any[]): boolean {
    if (fightState.enemy.dodge(attack)) {
      steps.push('L\'adversaire esquive votre coup!');
      return true;
    }
    if (critical) {
      const billyDamage = damage + fightState.billy.critical.combatValue;
      fightState.enemy.hurt(billyDamage);
      steps.push(`Vous infligez ${billyDamage} de dégats critiques à votre adversaire.`);
    } else {
      let billyDamage = damage + fightState.billy.damage.combatValue - fightState.enemy.armor;
      if (billyDamage < 0) {
        billyDamage = 0;
      }
      steps.push(`Vous infligez ${billyDamage} de dégats à votre adversaire.`);
      fightState.enemy.hurt(billyDamage);
    }
    if (fightState.enemy.hp === 0) {
      steps.push(`Vous avez vaincu votre adversaire !`);
      if (fightState.billy.items.find(value => value.ref === ITEM.petitMedaillon)) {
        fightState.billy.heal(2);
        steps.push(`Votre ${ITEM.petitMedaillon} vous restaure 2 POINTS DE VIE`);
      }
      return false;
    }
    return true;
  }

  end(fightState: FightState): void {
    if (fightState.enemy.statModifier) {
      for (const modifier of fightState.enemy.statModifier.call(this, fightState.billy)) {
        fightState.billy.modifyStat(modifier.statId, 0);
      }
    }
  }

  enemyAttack(fightState: FightState, dodge: number, damage: number, steps: any[]): boolean {
    if (dodge && dodge <= fightState.billy.dexterity.getValue().combatValue) {
      steps.push(`Vous esquivez l'attaque de votre adversaire.`);
    } else {
      let enemyDamage = this.getEnemyDamage(fightState, damage);
      steps.push(`Votre adversaire vous inflige ${enemyDamage}  de dégats.`);
      fightState.billy.hurt(enemyDamage);

      if (fightState.billy.currentHp === 0) {
        steps.push(`Vous avez été vaincu !`);
        return false;
      }
    }
    return true;
  }

  getEnemyDamage(fightState: FightState, damage: number): number {
    let enemyDamage = damage + fightState.enemy.damage - fightState.billy.armor.combatValue;
    if (fightState.billy.trait.getValue() === 'Paysan' && enemyDamage > 3) {
      enemyDamage = 3;
    }
    if (enemyDamage < 0) {
      enemyDamage = 0;
    }
    return enemyDamage;
  }

  next(fightState: FightState, attack: number, dodge?: number): boolean {
    let continueFighting = true;
    const steps = [];
    if (dodge === 1) {
      attack = 6;
    }
    const situationTableDamages = fightState.currentSituation.damages.find(damage => damage.dice === attack);

    if (!fightState.enemy.hasInitiative) {
      continueFighting = continueFighting && this.billyAttack(fightState, attack, dodge === 1, situationTableDamages.billyDamage, steps);
      if (continueFighting) {
        continueFighting = continueFighting && this.enemyAttack(fightState, dodge, situationTableDamages.enemyDamage, steps);
      }
    } else {
      continueFighting = continueFighting && this.enemyAttack(fightState, dodge, situationTableDamages.enemyDamage, steps);
      if (continueFighting) {
        continueFighting = continueFighting && this.billyAttack(fightState, attack, dodge === 1, situationTableDamages.billyDamage, steps);
      }
    }

    if (continueFighting) {
      // FIN DU TOUR
      if (fightState.enemy.onEndTurn) {
        steps.push(...fightState.enemy.onEndTurn(fightState.billy, fightState.enemy));
        continueFighting = continueFighting && BasicFightRules.checkDomination(fightState, steps);
      }
      if (fightState.billy.currentHp === 0) {
        steps.push(`Vous avez été vaincu !`);
        continueFighting = false;
      } else {
        if (fightState.turnLimit !== -1) {
          if (fightState.fightTurns.length === fightState.turnLimit) {
            steps.push(`Vous n'avez pas réussi à vaincre votre adversaire dans le temps imparti!`);
            continueFighting = false;
          } else {
            steps.push(`Nombre de tours restants: ${fightState.turnLimit - fightState.fightTurns.length}`);
          }
        }
      }
    }
    fightState.fightTurns.push({
      billyHp: fightState.billy.currentHp,
      enemyHp: fightState.enemy.hp,
      steps
    });
    return continueFighting;
  }

  start(fightState: FightState): boolean {
    const steps = [];
    if (fightState.enemy.statModifier) {
      const modifiers = fightState.enemy.statModifier.call(this, fightState.billy);
      for (const modifier of modifiers) {
        fightState.billy.modifyStat(modifier.statId, modifier.value);
        steps.push(`Vous obtenez ${modifier.value} de ${modifier.statId} durant ce combat.`);
      }
    }
    if (fightState.enemy.turnLimit) {
      fightState.turnLimit = fightState.enemy.turnLimit(fightState.billy);
    }
    if (fightState.turnLimit !== -1) {
      steps.push(`Nombre de tours restants: ${fightState.turnLimit}`);
    }
    let continueFighting = BasicFightRules.checkDomination(fightState, steps);
    fightState.fightTurns.push({
      billyHp: fightState.billy.currentHp,
      enemyHp: fightState.enemy.hp,
      steps
    });
    return continueFighting;
  }

  tryToDoubleDamage(fightState: FightState, luckTest?: number): boolean {
    const success = fightState.billy.currentLuck > 5 || luckTest <= fightState.billy.currentLuck;
    fightState.billy.spendLuck(1);
    const previousDamage = fightState.fightTurns[fightState.fightTurns.length - 2].enemyHp - fightState.fightTurns[fightState.fightTurns.length - 1].enemyHp;
    const steps = fightState.fightTurns[fightState.fightTurns.length - 1].steps;
    if (success) {
      fightState.enemy.hurt(previousDamage);
      fightState.fightTurns[fightState.fightTurns.length - 1].enemyHp = fightState.enemy.hp;
      steps.push(`Vous infligez ${previousDamage} de dégâts chanceux supplémentaires à votre adversaire !`);
      if (fightState.enemy.hp === 0) {
        steps.push(`Vous avez vaincu votre adversaire !`);
      }
    } else {
      fightState.enemy.heal(previousDamage);
      fightState.fightTurns[fightState.fightTurns.length - 1].enemyHp = fightState.enemy.hp;
      steps
        .push(`Vous avez complètement raté votre attaque !`);
    }
    return success;
  }

  tryToFlee(fightState: FightState, luckTest?: number): boolean {
    const success = fightState.billy.currentLuck > 5 || luckTest <= fightState.billy.currentLuck;
    fightState.billy.spendLuck(fightState.currentSituation.fleeCost);
    fightState.fightTurns[0].steps.push(success ? 'Vous réussissez à fuir le combat !'
      : 'Vous ne parvenez pas à fuir le combat. Vous devez vous battre !');
    return success;
  }

  tryToSurvive(fightState: FightState, luckTest?: number): boolean {
    const success = fightState.billy.currentLuck > 5 || luckTest <= fightState.billy.currentLuck;
    fightState.billy.spendLuck(++fightState.brinkOfDeath);
    const steps = fightState.fightTurns[fightState.fightTurns.length - 1].steps;
    if (success) {
      const hpRestored = fightState.fightTurns[fightState.fightTurns.length - 2].billyHp;
      fightState.fightTurns[fightState.fightTurns.length - 1].billyHp = hpRestored;
      fightState.billy.heal(hpRestored);
      steps[steps.length - 1] = 'Vous réussissez à survivre miraculeusement et reprenez le combat !';
    } else {
      steps[steps.length - 1] = 'Vous ne survivez pas à cette attaque. Ce sont des choses qui arrivent.';
    }
    return success;
  }

  private static checkDomination(fightState: FightState, steps: string[]) {
    if (fightState.currentSituation.abilityOffset < -7) {
      steps.push('Votre adversaire vous domine totalement. Vous perdez automatiquement le combat.');
      return false;
    }
    if (fightState.currentSituation.abilityOffset > 7) {
      steps.push('Vous dominez totalement votre adversaire. Vous remportez automatiquement le combat.');
      return false;
    }
    return true;
  }

}
