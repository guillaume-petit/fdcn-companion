import {FightRules} from './fight-rules.interface';
import {ITEM} from "../inventory/inventory-item.model";
import {FightState} from "./fight-state";
import {CharacterStatId} from "../character/character-stat.model";

export class BasicFightRules implements FightRules {

  start(fightState: FightState) {
    if (fightState.enemy.statModifier) {
      const modifiers = fightState.enemy.statModifier.call(this, fightState.billy);
      for (const modifier of modifiers) {
        fightState.billy.modifyStat(modifier.statId, modifier.value);
        fightState.steps.push(`Vous obtenez ${modifier.value} de ${modifier.statId} durant ce combat.`);
      }
    }
    if (fightState.enemy.turnLimit) {
      fightState.turnLimit = fightState.enemy.turnLimit(fightState.billy);
    }
    if (fightState.turnLimit !== -1) {
      fightState.steps.push(`Nombre de tours restants: ${fightState.turnLimit}`);
    }

    fightState.fightTurns.push({
      billyHp: fightState.billy.currentHp.getValue(),
      enemyHp: fightState.enemy.hp.getValue()
    });

    fightState.billy.currentHp.subscribe(hp => {
      if (hp === 0) {
        fightState.steps.push('Vous avez été vaincu !');
        fightState.fightEnded = true;
      }
    });

    fightState.currentSituation.subscribe(currentSituation => {
      if (currentSituation.abilityOffset < -7) {
        fightState.steps.push('Votre adversaire vous domine totalement. Vous perdez automatiquement le combat.');
        fightState.fightEnded = true;
      }
      if (currentSituation.abilityOffset > 7) {
        fightState.steps.push('Vous dominez totalement votre adversaire. Vous remportez automatiquement le combat.');
        fightState.fightEnded = true;
      }
    });
  }

  billyAttack(fightState: FightState, attack: number, critical: boolean, damage: number) {
    if (fightState.enemy.dodge(attack, fightState)) {
      fightState.steps.push('L\'adversaire esquive votre coup!');
    }

    const billyDamage = this.getBillyDamage(critical, damage, fightState);
    fightState.steps.push(`Vous infligez ${billyDamage} de dégats ${critical ? 'critiques ' : ''} à votre adversaire.`);
    fightState.enemy.hurt(billyDamage);

    if (fightState.enemy.isDefeated) {
      fightState.steps.push(`Vous avez vaincu votre adversaire !`);
      fightState.fightEnded = true;
      if (fightState.billy.items.find(value => value.ref === ITEM.petitMedaillon)) {
        fightState.billy.heal(2);
        fightState.steps.push(`Votre ${ITEM.petitMedaillon} vous restaure 2 POINTS DE VIE`);
      }
    }
  }

  getBillyDamage(critical: boolean, damage: number, fightState: FightState): number {
    let billyDamage: number;
    if (critical) {
      billyDamage = damage + fightState.billy.critical.combatValue;
    } else {
      billyDamage = damage + fightState.billy.damage.combatValue - fightState.enemy.armor;
      if (billyDamage < 0) {
        billyDamage = 0;
      }
    }
    return billyDamage;
  }

  enemyAttack(fightState: FightState, dodge: number, damage: number): number {
    if (dodge && dodge <= fightState.billy.dexterity.getValue().combatValue) {
      fightState.steps.push(`Vous esquivez l'attaque de votre adversaire.`);
      return 0;
    } else {
      let enemyDamage = this.getEnemyDamage(fightState, damage);
      fightState.steps.push(`Votre adversaire vous inflige ${enemyDamage}  de dégats.`);
      fightState.billy.hurt(enemyDamage);
      return enemyDamage;
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
    fightState.steps = [];
    if (dodge === 1) {
      attack = 6;
    }
    const situationTableDamages = fightState.currentSituation.getValue().damages.find(damage => damage.dice === attack);

    if (!fightState.enemy.hasInitiative) {
      this.billyAttack(fightState, attack, dodge === 1, situationTableDamages.billyDamage);
      if (!fightState.fightEnded) {
        this.enemyAttack(fightState, dodge, situationTableDamages.enemyDamage);
      }
    } else {
      this.enemyAttack(fightState, dodge, situationTableDamages.enemyDamage);
      if (!fightState.fightEnded) {
        this.billyAttack(fightState, attack, dodge === 1, situationTableDamages.billyDamage);
      }
    }

    if (!fightState.fightEnded) {
      this.endTurn(fightState);
    }

    fightState.fightTurns.push({
      billyHp: fightState.billy.currentHp.getValue(),
      enemyHp: fightState.enemy.hp.getValue()
    });
  }

  endTurn(fightState: FightState) {
    if (fightState.turnLimit !== -1) {
      if (fightState.fightTurns.length === fightState.turnLimit) {
        fightState.steps.push(`Vous n'avez pas réussi à vaincre votre adversaire dans le temps imparti!`);
        fightState.fightEnded = true;
      } else {
        fightState.steps.push(`Nombre de tours restants: ${fightState.turnLimit - fightState.fightTurns.length}`);
      }
    }
  }

  tryToDoubleDamage(fightState: FightState, luckTest?: number): boolean {
    const success = fightState.billy.currentLuck > 5 || luckTest <= fightState.billy.currentLuck;
    fightState.billy.spendLuck(1);
    const previousDamage = fightState.fightTurns[fightState.fightTurns.length - 2].enemyHp - fightState.fightTurns[fightState.fightTurns.length - 1].enemyHp;
    const steps = fightState.steps;
    if (success) {
      fightState.enemy.hurt(previousDamage);
      fightState.fightTurns[fightState.fightTurns.length - 1].enemyHp = fightState.enemy.hp.getValue();
      steps.push(`Vous infligez ${previousDamage} de dégâts chanceux supplémentaires à votre adversaire !`);
      if (fightState.enemy.isDefeated) {
        steps.push(`Vous avez vaincu votre adversaire !`);
      }
    } else {
      fightState.enemy.heal(previousDamage);
      fightState.fightTurns[fightState.fightTurns.length - 1].enemyHp = fightState.enemy.hp.getValue();
      steps.push(`Vous avez complètement raté votre attaque !`);
    }
    return success;
  }

  tryToFlee(fightState: FightState, luckTest?: number): boolean {
    const success = fightState.billy.currentLuck > 5 || luckTest <= fightState.billy.currentLuck;
    fightState.billy.spendLuck(fightState.currentSituation.getValue().fleeCost);
    fightState.steps.push(success ? 'Vous réussissez à fuir le combat !'
      : 'Vous ne parvenez pas à fuir le combat.');
    return success;
  }

  tryToSurvive(fightState: FightState, luckTest?: number): boolean {
    const success = fightState.billy.currentLuck > 5 || luckTest <= fightState.billy.currentLuck;
    fightState.billy.spendLuck(++fightState.brinkOfDeath);
    const steps = fightState.steps;
    if (success) {
      const hpRestored = fightState.fightTurns[fightState.fightTurns.length - 2].billyHp;
      fightState.fightTurns[fightState.fightTurns.length - 1].billyHp = hpRestored;
      fightState.billy.heal(hpRestored);
      steps[steps.length - 1] = 'Vous réussissez à survivre miraculeusement et reprenez le combat !';
      fightState.fightEnded = false;
    } else {
      steps[steps.length - 1] = 'Vous ne survivez pas à cette attaque. Ce sont des choses qui arrivent.';
    }
    return success;
  }

  end(fightState: FightState): void {
    for (const stat in CharacterStatId) {
      fightState.billy.modifyStat(CharacterStatId[stat], 0);
    }
  }
}
