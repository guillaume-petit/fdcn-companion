import { Component } from '@angular/core';
import {CharacterService} from "../game/character/character.service";
import {Character} from "../game/character/character.model";
import {Router} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    private characterService: CharacterService,
    private router: Router
  ) {}

  async newGame() {
    let i = 0;
    let billy = this.characterService.getCharacter('Billy');
    if (!!billy) {
      i++;
      while (!!billy) {
        billy = this.characterService.getCharacter(`Billy (${i})`);
        i++;
      }
    }
    if (i === 0) {
      billy = await this.characterService.saveCharacter(new Character('Billy'));
    } else {
      billy = await this.characterService.saveCharacter(new Character(`Billy (${i - 1})`));
    }
    this.router.navigate(['/game/character-sheet', billy.name]);
  }
}
