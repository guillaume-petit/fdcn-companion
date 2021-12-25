import {Component, OnInit} from '@angular/core';
import {CharacterService} from "../character/character.service";
import {Character} from "../character/character.model";

@Component({
  selector: 'app-load-game',
  templateUrl: './load-game.page.html',
  styleUrls: ['./load-game.page.scss'],
})
export class LoadGamePage implements OnInit {

  loadedCharacters: Array<Character> = [];

  constructor(
    public characterService: CharacterService
  ) { }

  ngOnInit() {
    this.characterService.getCharacters().subscribe(characters => {
      this.loadedCharacters = characters;
    });
  }

}
