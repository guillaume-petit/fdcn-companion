import {ElementRef, Injectable} from "@angular/core";
import {AnimationController} from "@ionic/angular";

@Injectable({ providedIn: 'root' })
export class AnimationHelper {

  constructor(private animationCtrl: AnimationController) {
  }

  blink(element: ElementRef, color: string) {
    this.animationCtrl.create()
      .addElement(element.nativeElement)
      .duration(500)
      .keyframes([
        { offset: 0, outline: `0 solid var(--ion-color-${color})`, backgroundColor: '' },
        { offset: 0.5, outline: `2px solid var(--ion-color-${color})`, backgroundColor: `var(--ion-color-${color}-shade)` },
        { offset: 1, outline: `0px solid var(--ion-color-${color})`, backgroundColor: '' }
      ])
      .play();
  }
}
