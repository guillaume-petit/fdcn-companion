import {Injectable} from '@angular/core';
import {Character} from "./character.model";
import {CharacterModel, StorageService} from "../../storage.service";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CharacterService {

  private characters: BehaviorSubject<Array<Character>> = new BehaviorSubject<Array<Character>>([]);

  constructor(private storage: StorageService) {
    this.storage.storageInitialized.subscribe(() => {
      this.storage.getCharacters().then((loadedCharacters: Array<CharacterModel>) => {
        this.characters.next(loadedCharacters.map(c => Character.fromCharacterModel(c)));

        this.characters.subscribe(characters => {
          this.storage.saveCharacters(characters.map(c => Character.toCharacterModel(c)));
        });
      });
    });
  }

  async saveCharacter(character: Character) {
    if (character) {
      const characters = this.characters.getValue().filter(c => c?.name !== character.name);
      characters.push(character);
      this.characters.next(characters);
      return character;
    }
  }

  getCharacter(name: string) {
    return this.characters?.getValue().find(c => c.name === name);
  }

  getCharacters() {
    return this.characters;
  }
}
