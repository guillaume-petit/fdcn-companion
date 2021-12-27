import {Injectable} from '@angular/core';
import {Storage} from "@ionic/storage-angular";
import {Subject} from "rxjs";
import {EquipmentItem} from "./game/equipment/equipment-item.model";
import {CharacterStat} from "./game/character/character-stat.model";
import {InventoryItem} from "./game/inventory/inventory-item.model";
import {CharacterModel} from "./game/character/character.model";

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  storageInitialized: Subject<void> = new Subject<void>();
  private localStorage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async getCharacters(): Promise<Array<CharacterModel>> {
    let characters = await this.localStorage?.get('characters');
    if (!characters) {
      characters = [];
      this.saveCharacters(characters);
    }
    return characters;
  }

  saveCharacters(characters: Array<CharacterModel>) {
    this.localStorage?.set('characters', characters);
  }

  public async init() {
    this.localStorage = await this.storage.create();
    this.storageInitialized.next();
  }
}
