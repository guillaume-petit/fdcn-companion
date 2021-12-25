import {Injectable} from '@angular/core';
import {Storage} from "@ionic/storage-angular";
import {Subject} from "rxjs";
import {EquipmentItem} from "./game/equipment/equipment-item.model";
import {CharacterStat} from "./game/character/character-stat.model";
import {InventoryItem} from "./game/inventory/inventory-item.model";

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

export interface CharacterModel {
  name: string;
  trait: 'Indéfini' | 'Guerrier' | 'Paysan' | 'Prudent' | 'Débrouillard';
  equipment: Array<EquipmentItem>;
  ability: CharacterStat;
  dexterity: CharacterStat;
  toughness: CharacterStat;
  luck: CharacterStat;
  glory: number;
  wealth: number;
  damage: CharacterStat;
  armor: CharacterStat;
  critical: CharacterStat;

  maxLuck: number;
  maxHp: number;
  currentHp: number;
  currentLuck: number;

  items: Array<InventoryItem>;
}
