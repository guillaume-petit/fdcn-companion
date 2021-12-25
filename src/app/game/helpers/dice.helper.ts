import {ElementRef, Injectable} from "@angular/core";
import {AnimationController} from "@ionic/angular";

@Injectable({ providedIn: 'root' })
export class DiceHelper {

  constructor(
    private animationCtrl: AnimationController
  ) {
  }

  async roll(diceElement: ElementRef) {
    await this.animationCtrl.create()
      .addElement(diceElement.nativeElement)
      .duration(300)
      .iterations(5)
      .keyframes([
        {offset: 0, transform: 'rotate(0)'},
        {offset: 0, transform: 'rotate(-45deg)'},
        {offset: 0, transform: 'rotate(-90deg)'},
        {offset: 0, transform: 'rotate(-135deg)'},
        {offset: 0, transform: 'rotate(-180deg)'},
        {offset: 0, transform: 'rotate(-225deg)'},
        {offset: 0, transform: 'rotate(-270deg)'},
        {offset: 0, transform: 'rotate(-315deg)'},
        {offset: 0, transform: 'rotate(-360deg)'}
      ])
      .play();
    return Math.floor(Math.random() * 6 + 1);
  }
}
