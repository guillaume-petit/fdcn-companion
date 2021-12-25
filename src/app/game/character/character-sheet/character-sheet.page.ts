import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationStart, Router} from '@angular/router';
import {Character} from '../character.model';
import {CharacterService} from '../character.service';
import {ModalController} from '@ionic/angular';
import {SelectEquipmentModalComponent} from './select-equipment-modal/select-equipment-modal.component';
import {CharacterStat} from '../character-stat.model';
import {BehaviorSubject} from 'rxjs';
import {FightModalComponent} from '../../fight/fight-modal/fight-modal.component';
import {DiceHelper} from '../../helpers/dice.helper';
import {FightService} from '../../fight/fight.service';
import {AnimationHelper} from '../../helpers/animation.helper';
import {InventoryItem, ITEMS} from "../../inventory/inventory-item.model";
import {EquipmentItem} from "../../equipment/equipment-item.model";

@Component({
  selector: 'app-character-sheet',
  templateUrl: './character-sheet.page.html',
  styleUrls: ['./character-sheet.page.scss'],
})
export class CharacterSheetPage implements OnInit, OnDestroy {

  @ViewChild('healthCard', {read: ElementRef}) healthCard: ElementRef;
  @ViewChild('luckCard', {read: ElementRef}) luckCard: ElementRef;
  @ViewChild('dexterityCard', {read: ElementRef}) dexterityCard: ElementRef;
  @ViewChild('luckDice', {read: ElementRef, static: false}) luckDice: ElementRef;
  @ViewChild('dexterityDice', {read: ElementRef, static: false}) dexterityDice: ElementRef;
  @ViewChild('gloryCard', {read: ElementRef, static: false}) gloryCard: ElementRef;
  @ViewChild('wealthCard', {read: ElementRef, static: false}) wealthCard: ElementRef;

  billy: Character;

  editingName = false;
  testLuckActive = false;
  testingLuck = false;
  editingSecondStat = false;
  diceValue: number;

  constructor(
    private route: ActivatedRoute,
    private characterService: CharacterService,
    private router: Router,
    private modalCtrl: ModalController,
    private diceHelper: DiceHelper,
    private fightService: FightService,
    private animationHelper: AnimationHelper
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('name')) {
        this.billy = this.characterService.getCharacter(paramMap.get('name'));
        if (!this.billy) {
          this.router.navigate(['/']);
        }
      } else {
        this.router.navigate(['/']);
      }
    });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.characterService.saveCharacter(this.billy);
      }
    });
    window.addEventListener('beforeunload', () => {
      this.characterService.saveCharacter(this.billy);
    });
  }

  ngOnDestroy() {
    this.characterService.saveCharacter(this.billy);
  }

  ionViewDidEnter() {
    if (this.billy.equipment.getValue().filter(i => !!i).length < 3) {
        this.onEquipmentOpen();
    }
  }

  onToggleNameEdit() {
    this.editingName = !this.editingName;
  }

  onToggleSecondaryStatEdit() {
    this.editingSecondStat = !this.editingSecondStat;
  }

  async onEquipmentOpen() {
    const modal = await this.modalCtrl.create({
      component: SelectEquipmentModalComponent,
      componentProps: {
        items: this.billy.equipment.getValue()
      }
    });
    modal.onDidDismiss().then(result => {
      if (result.role !== 'backdrop') {
        this.billy.equipment.next(result.data);
      }
    });
    return modal.present();
  }

  isEquipmentEmpty() {
    return this.billy.equipment.getValue().filter(i => !!i).length === 0;
  }

  async onLuckTest() {
    this.testLuckActive = !this.testLuckActive;
    if (this.testLuckActive) {
      if (this.billy.currentLuck < 6) {
        this.testingLuck = true;
        setTimeout(async () => {
          this.diceValue = await this.diceHelper.roll(this.luckDice);
          this.animationHelper.blink(this.luckCard, this.diceValue <= this.billy.currentLuck ? 'success' : 'danger');
          setTimeout(() => {
            this.billy.spendLuck(1);
            this.diceValue = null;
            this.testingLuck = false;
            this.testLuckActive = false;
          }, 2000);
        }, 200);
      } else {
        setTimeout(() => {
          this.billy.spendLuck(1);
          this.testLuckActive = false;
        }, 2000);
      }
    } else {
      this.diceValue = null;
    }
  }

  onHeal() {
    this.animationHelper.blink(this.healthCard, 'success');
    this.billy.heal(1);
  }

  onHurt() {
    this.animationHelper.blink(this.healthCard, 'danger');
    this.billy.hurt(1);
  }

  onGainLuck() {
    this.animationHelper.blink(this.luckCard, 'success');
    this.billy.gainLuck(1);
  }

  onLooseLuck() {
    this.animationHelper.blink(this.luckCard, 'danger');
    this.billy.spendLuck(1);
  }

  onLevelUp(stat: BehaviorSubject<CharacterStat>) {
    stat.next(stat.getValue().levelUp());
  }

  onResetStat(stat: BehaviorSubject<CharacterStat>) {
    stat.next(stat.getValue().reset());
  }

  onAddGlory() {
    this.animationHelper.blink(this.gloryCard, 'success');
    this.billy.glory++;
  }

  onRemoveGlory() {
    this.animationHelper.blink(this.gloryCard, 'danger');
    this.billy.glory--;
  }

  onAddWealth() {
    this.animationHelper.blink(this.wealthCard, 'success');
    this.billy.wealth++;
  }

  onRemoveWealth() {
    this.animationHelper.blink(this.wealthCard, 'danger');
    this.billy.wealth--;
  }

  onAddItem(item: InventoryItem) {
    this.billy.items.push(item.ref);
    this.modalCtrl.dismiss();
  }

  onDeleteItem(i: number) {
    this.billy.items.splice(i, 1);
  }

  async onFight() {
    const modal = await this.modalCtrl.create({
      component: FightModalComponent,
      componentProps: {
        billy: this.billy
      }
    });
    modal.onDidDismiss().then(result => {
      if (result.role === 'backdrop') {
        this.fightService.endFight();
      }
    });
    return modal.present();
  }

  get availableItems() {
    return ITEMS.filter(i => !this.billy.items.includes(i.ref));
  }
}
