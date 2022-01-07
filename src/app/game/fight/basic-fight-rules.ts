import {FightRules} from './fight-rules.interface';
import {ITEM} from "../inventory/inventory-item.model";
import {FightState} from "./fight-state";
import {CharacterStatId} from "../character/character-stat.model";

export class BasicFightRules implements FightRules {

  billyAttack(fightState: FightState, attack: number, critical: boolean, damage: number, steps: any[]) {
    if (fightState.enemy.dodge(attack, fightState)) {
      steps.push('L\'adversaire esquive votre coup!');
    }
    if (critical) {
      this.billyCriticalHit(damage, fightState, steps);
    } else {
      this.billyNormalHit(damage, fightState, steps);
    }
    if (fightState.enemy.isDefeated) {
      steps.push(`Vous avez vaincu votre adversaire !`);
      fightState.fightEnded = true;
      if (fightState.billy.items.find(value => value.ref === ITEM.petitMedaillon)) {
        fightState.billy.heal(2);
        steps.push(`Votre ${ITEM.petitMedaillon} vous restaure 2 POINTS DE VIE`);
      }
    }
  }

  billyNormalHit(damage: number, fightState: FightState, steps: any[]) {
    let billyDamage = damage + fightState.billy.damage.combatValue - fightState.enemy.armor;
    if (billyDamage < 0) {
      billyDamage = 0;
    }
    steps.push(`Vous infligez ${billyDamage} de dégats à votre adversaire.`);
    fightState.enemy.hurt(billyDamage);
  }

  billyCriticalHit(damage: number, fightState: FightState, steps: any[]) {
    const billyDamage = damage + fightState.billy.critical.combatValue;
    fightState.enemy.hurt(billyDamage);
    steps.push(`Vous infligez ${billyDamage} de dégats critiques à votre adversaire.`);
  }

  end(fightState: FightState): void {
    for (const stat in CharacterStatId) {
      fightState.billy.modifyStat(CharacterStatId[stat], 0);
    }
  }

  enemyAttack(fightState: FightState, dodge: number, damage: number, steps: any[]) {
    if (dodge && dodge <= fightState.billy.dexterity.getValue().combatValue) {
      steps.push(`Vous esquivez l'attaque de votre adversaire.`);
    } else {
      let enemyDamage = this.getEnemyDamage(fightState, damage);
      steps.push(`Votre adversaire vous inflige ${enemyDamage}  de dégats.`);
      fightState.billy.hurt(enemyDamage);
    }
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

  next(fightState: FightState, attack: number, dodge?: number) {
    const steps = [];
    if (dodge === 1) {
      attack = 6;
    }
    const situationTableDamages = fightState.currentSituation.getValue().damages.find(damage => damage.dice === attack);

    if (!fightState.enemy.hasInitiative) {
      this.billyAttack(fightState, attack, dodge === 1, situationTableDamages.billyDamage, steps);
      if (!fightState.fightEnded) {
        this.enemyAttack(fightState, dodge, situationTableDamages.enemyDamage, steps);
      }
    } else {
      this.enemyAttack(fightState, dodge, situationTableDamages.enemyDamage, steps);
      if (!fightState.fightEnded) {
        this.billyAttack(fightState, attack, dodge === 1, situationTableDamages.billyDamage, steps);
      }
    }

    if (!fightState.fightEnded) {
      this.endTurn(fightState, steps);
    }

    fightState.fightTurns.push({
      billyHp: fightState.billy.currentHp.getValue(),
      enemyHp: fightState.enemy.hp,
      steps
    });
  }

  endTurn(fightState: FightState, steps: string[]) {
    if (fightState.turnLimit !== -1) {
      if (fightState.fightTurns.length === fightState.turnLimit) {
        steps.push(`Vous n'avez pas réussi à vaincre votre adversaire dans le temps imparti!`);
        fightState.fightEnded = true;
      } else {
        steps.push(`Nombre de tours restants: ${fightState.turnLimit - fightState.fightTurns.length}`);
      }
    }
  }

  start(fightState: FightState) {
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

    fightState.fightTurns.push({
      billyHp: fightState.billy.currentHp.getValue(),
      enemyHp: fightState.enemy.hp,
      steps
    });

    fightState.billy.currentHp.subscribe(hp => {
      if (hp === 0) {
        fightState.fightTurns[fightState.fightTurns.length - 1].steps.push('Vous avez été vaincu !');
        fightState.fightEnded = true;
      }
    });

    fightState.currentSituation.subscribe(currentSituation => {
      if (currentSituation.abilityOffset < -7) {
        fightState.fightTurns[fightState.fightTurns.length - 1].steps.push('Votre adversaire vous domine totalement. Vous perdez automatiquement le combat.');
        fightState.fightEnded = true;
      }
      if (currentSituation.abilityOffset > 7) {
        fightState.fightTurns[fightState.fightTurns.length - 1].steps.push('Vous dominez totalement votre adversaire. Vous remportez automatiquement le combat.');
        fightState.fightEnded = true;
      }
    });
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
      if (fightState.enemy.isDefeated) {
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
    fightState.billy.spendLuck(fightState.currentSituation.getValue().fleeCost);
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
}
