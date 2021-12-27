import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {ENEMIES, Enemy, EnemyModel} from '../enemy.model';
import {Character} from '../../character/character.model';
import {FightService} from '../fight.service';
import {DiceHelper} from '../../helpers/dice.helper';
import {ModalController} from '@ionic/angular';


@Component({
  selector: 'app-fight-modal',
  templateUrl: './fight-modal.component.html',
  styleUrls: ['./fight-modal.component.scss'],
})
export class FightModalComponent implements OnInit {

  @Input() billy: Character;

  @ViewChild('luckDice', {read: ElementRef, static: false}) luckDice: ElementRef;
  @ViewChild('surviveDice', {read: ElementRef, static: false}) surviveDice: ElementRef;
  @ViewChild('dodgeDice', {read: ElementRef, static: false}) dodgeDice: ElementRef;
  @ViewChild('attackDice', {read: ElementRef, static: false}) attackDice: ElementRef;
  @ViewChild('doubleDamageDice', {read: ElementRef, static: false}) doubleDamageDice: ElementRef;

  enemy: Enemy;

  luckDiceValue: number;
  dodgeDiceValue: number;
  attackDiceValue: number;

  fleeSuccess: boolean;
  surviveSuccess: boolean = null;
  doubleDamageSuccess: boolean = null;

  fightStatus:
    'preparing' |
    'fleeing' |
    'pending_attack' |
    'attacking' |
    'pending_reroll' |
    'testing_double_damage' |
    'brink_of_death' |
    'trying_to_survive' |
    'ended' = 'preparing';

  allEnemies: EnemyModel[] = ENEMIES;

  constructor(
    public fightService: FightService,
    private diceHelper: DiceHelper,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  attack() {
    this.fightStatus = 'attacking';
    this.dodgeDiceValue = null;
    this.attackDiceValue = null;
    this.surviveSuccess = null;
    this.fleeSuccess = null;
    this.doubleDamageSuccess = null;
    setTimeout(async () => {
      const attackPromise = this.diceHelper.roll(this.attackDice);
      let dodgePromise;
      if (this.canDodge) {
        dodgePromise = this.diceHelper.roll(this.dodgeDice);
      }
      Promise.all([attackPromise, dodgePromise]).then(result => {
        this.attackDiceValue = result[0];
        this.dodgeDiceValue = result[1];
        if (this.billy.trait.getValue() === 'Débrouillard' && this.dodgeDiceValue > 1) {
          this.fightStatus = 'pending_reroll';
        } else {
          const continueFighting = this.fightService.nextTurn(this.attackDiceValue, this.dodgeDiceValue);
          if (this.billy.currentHp === 0 &&
            this.billy.trait.getValue() === 'Prudent' &&
            this.billy.currentLuck > this.fightService.brinkOfDeath) {
            this.fightStatus = 'brink_of_death';
          } else {
            this.fightStatus = continueFighting ? 'pending_attack' : 'ended';
          }
        }
      });
    }, 200);
  }

  async confirmAttack(reroll: boolean) {
    if (reroll) {
      this.fightStatus = 'attacking';
      this.attackDiceValue = await this.diceHelper.roll(this.attackDice);
    }
    this.fightService.nextTurn(this.attackDiceValue, this.dodgeDiceValue);
    this.fightStatus = this.billy.currentHp === 0 || this.fightService.enemy.hp === 0 ? 'ended' : 'pending_attack';
  }

  flee() {
    this.luckDiceValue = null;
    this.fightStatus = 'fleeing';
    if (this.billy.currentLuck > 5) {
      this.fightService.tryToFlee();
      this.fightStatus = 'ended';
    } else {
      setTimeout(async () => {
        this.luckDiceValue = await this.diceHelper.roll(this.luckDice);
        this.fleeSuccess = this.fightService.tryToFlee(this.luckDiceValue);
        this.fightStatus = this.fleeSuccess ? 'ended' : 'pending_attack';
      }, 200);
    }
  }

  survive() {
    this.fightStatus = 'trying_to_survive';
    this.luckDiceValue = null;
    if (this.billy.currentLuck > 5) {
      this.fightService.tryToSurvive();
      this.fightStatus = 'pending_attack';
    } else {
      setTimeout(async () => {
        this.luckDiceValue = await this.diceHelper.roll(this.surviveDice);
        this.surviveSuccess = this.fightService.tryToSurvive(this.luckDiceValue);
        this.fightStatus = this.surviveSuccess ? 'pending_attack' : 'ended';
      }, 200);
    }
  }

  doubleDamage() {
    this.fightStatus = 'testing_double_damage';
    this.luckDiceValue = null;
    if (this.billy.currentLuck > 5) {
      this.fightService.tryToDoubleDamage();
      this.fightStatus = this.fightService.enemy.hp === 0 ? 'ended' : 'pending_attack';
    } else {
      setTimeout(async () => {
        this.luckDiceValue = await this.diceHelper.roll(this.doubleDamageDice);
        this.doubleDamageSuccess = this.fightService.tryToDoubleDamage(this.luckDiceValue);
        this.fightStatus = this.fightService.enemy.hp === 0 ? 'ended' : 'pending_attack';
      }, 200);
    }
  }

  onFinishFight() {
    this.fightService.endFight();
    this.modalCtrl.dismiss(this.billy);
  }

  onSelectEnemy(enemy: EnemyModel) {
    this.enemy = new Enemy(enemy);
    if (!this.fightService.startFight(this.billy, this.enemy)) {
      this.fightStatus = 'ended';
    }
  }

  get canFlee() {
    return this.billy.trait.getValue() === 'Prudent' &&
      this.billy.currentLuck >= this.fightService.currentSituation?.fleeCost &&
      this.fightService.fightTurns.length === 1 &&
      this.fightStatus === 'preparing';
  }

  get canDodge() {
    return this.billy.dexterity.getValue().combatValue >= 2;
  }

  get canAttack() {
    return !['brink_of_death', 'trying_to_survive', 'ended'].includes(this.fightStatus);
  }

  get canDoubleDamage() {
    return this.billy.trait.getValue() === 'Prudent' &&
      this.billy.currentLuck > 0 &&
      this.fightService.fightTurns.length > 1 &&
      this.fightStatus === 'pending_attack' &&
      this.doubleDamageSuccess === null;
  }

  get isDodgeDiceDisplayed() {
    return ['pending_attack', 'attacking', 'pending_reroll', 'brink_of_death', 'ended'].includes(this.fightStatus) &&
      this.canDodge &&
      this.surviveSuccess === null &&
      this.doubleDamageSuccess === null &&
      this.fleeSuccess === null;
  }

  get isAttackDiceDisplayed() {
    return ['pending_attack', 'attacking', 'pending_reroll', 'brink_of_death', 'ended'].includes(this.fightStatus) &&
      this.surviveSuccess === null &&
      this.doubleDamageSuccess === null &&
      this.fleeSuccess === null;
  }

  get isStepsDisplayed() {
    return ['preparing', 'pending_attack', 'ended', 'brink_of_death'].includes(this.fightStatus);
  }

  get isDoubleDamageDiceDisplayed() {
    return this.fightStatus === 'testing_double_damage' || this.doubleDamageSuccess !== null;
  }
}
