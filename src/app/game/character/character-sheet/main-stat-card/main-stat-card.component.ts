import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {CharacterStat, CharacterStatId} from "../../character-stat.model";
import {DiceHelper} from "../../../helpers/dice.helper";
import {AnimationHelper} from "../../../helpers/animation.helper";

@Component({
  selector: 'app-main-stat-card',
  templateUrl: './main-stat-card.component.html',
  styleUrls: ['./main-stat-card.component.scss'],
})
export class MainStatCardComponent implements OnInit {

  @Input() stat: CharacterStat;
  @Output() levelUp = new EventEmitter<void>();
  @Output() resetStat = new EventEmitter<void>();
  @ViewChild('statCard', {read: ElementRef, static: false}) statCard: ElementRef;
  @ViewChild('dice', {read: ElementRef, static: false}) dice: ElementRef;

  testStatActive: boolean;
  testingStat: boolean;
  diceValue: number;

  constructor(
    private diceHelper: DiceHelper,
    private animationHelper: AnimationHelper
  ) { }

  ngOnInit() {}

  onLevelUp() {
    this.levelUp.emit();
  }

  onResetStat() {
    this.resetStat.emit();
  }

  get dexterityId() {
    return CharacterStatId.dexterity;
  }

  onTestStat() {
    this.testStatActive = !this.testStatActive;
    if (this.testStatActive) {
      this.testingStat = true;
      setTimeout(async () => {
        this.diceValue = await this.diceHelper.roll(this.dice);
        this.animationHelper.blink(this.statCard, this.diceValue <= this.stat.total ? 'success' : 'danger');
        setTimeout(() => {
          this.diceValue = null;
          this.testingStat = false;
          this.testStatActive = false;
        }, 2000);
      }, 200);
    } else {
      this.diceValue = null;
    }
  }
}
