import {EquipmentItem, EquipmentItemId} from '../equipment/equipment-item.model';
import {BehaviorSubject} from 'rxjs';
import {CharacterStat, CharacterStatId} from './character-stat.model';
import {InventoryItem} from "../inventory/inventory-item.model";

export class Character {
  name: string;
  trait: BehaviorSubject<'Indéfini' | 'Guerrier' | 'Paysan' | 'Prudent' | 'Débrouillard'> =
    new BehaviorSubject<'Indéfini' | 'Guerrier' | 'Paysan' | 'Prudent' | 'Débrouillard'>('Indéfini');
  equipment: BehaviorSubject<Array<EquipmentItem>> = new BehaviorSubject<Array<EquipmentItem>>([null, null, null]);
  ability: BehaviorSubject<CharacterStat> = new BehaviorSubject<CharacterStat>(
    new CharacterStat({
      id: CharacterStatId.ability,
      base: 2
    }));
  dexterity: BehaviorSubject<CharacterStat> = new BehaviorSubject<CharacterStat>(
    new CharacterStat({
      id: CharacterStatId.dexterity,
      base: 1
    }));
  toughness: BehaviorSubject<CharacterStat> = new BehaviorSubject<CharacterStat>(
    new CharacterStat({
      id: CharacterStatId.toughness,
      base: 2
    }));
  luck: BehaviorSubject<CharacterStat> = new BehaviorSubject<CharacterStat>(
    new CharacterStat({
      id: CharacterStatId.luck,
      base: 3
    }));
  glory = 0;
  wealth = 0;
  damage = new CharacterStat({
    id: CharacterStatId.damage,
    base: 0
  });
  armor = new CharacterStat({
    id: CharacterStatId.armor,
    base: 0
  });
  critical = new CharacterStat({
    id: CharacterStatId.critical,
    base: 0
  });

  maxLuck = 0;
  maxHp = 0;
  currentHp = 0;
  currentLuck = 0;

  items: Array<InventoryItem> = [];

  constructor(name: string) {
    this.name = name;

    this.toughness.subscribe(toughness => {
      this.maxHp = toughness.total * 3;
      if (this.currentHp > this.maxHp) {
        this.currentHp = this.maxHp
      }
    });

    this.luck.subscribe(luck => {
      this.maxLuck = luck.total;
      if (this.currentLuck > this.maxLuck) {
        this.currentLuck = this.maxLuck;
      }
    });

    this.trait.subscribe(trait => {
      const ability = this.ability.getValue();
      const dexterity = this.dexterity.getValue();
      const toughness = this.toughness.getValue();
      const luck = this.luck.getValue();
      switch (trait) {
        case 'Guerrier':
          ability.trait = 2;
          luck.trait = -1;
          this.damage.trait = 1;
          break;
        case 'Prudent':
          luck.trait = 2;
          ability.trait = -1;
          break;
        case 'Paysan':
          toughness.trait = 2;
          dexterity.trait = -1;
          break;
        case 'Débrouillard':
          dexterity.trait = 2;
          toughness.trait = -1;
          break;
      }
      this.ability.next(ability);
      this.dexterity.next(dexterity);
      this.toughness.next(toughness);
      this.luck.next(luck);
    });

    this.equipment.subscribe(equipment => {
      this.trait.next(
        equipment.filter(i => i?.category === 'weapon').length >= 2 ? 'Guerrier' :
          equipment.filter(i => i?.category === 'tool').length >= 2 ? 'Paysan' :
            equipment.filter(i => i?.category === 'support').length >= 2 ? 'Prudent' :
              equipment.filter(i => !!i).length === 3 ? 'Débrouillard' :
                'Indéfini');

      const ability = this.ability.getValue();
      const dexterity = this.dexterity.getValue();
      const toughness = this.toughness.getValue();
      const luck = this.luck.getValue();

      const equipmentStats: {
        id: CharacterStatId,
        value: number;
      }[] = [{
        id: CharacterStatId.ability,
        value: 0
      }, {
        id: CharacterStatId.dexterity,
        value: 0
      }, {
        id: CharacterStatId.luck,
        value: 0
      }, {
        id: CharacterStatId.toughness,
        value: 0
      }, {
        id: CharacterStatId.armor,
        value: 0
      }, {
        id: CharacterStatId.critical,
        value: 0
      }, {
        id: CharacterStatId.damage,
        value: 0
      }];

      for (const item of equipment) {
        if (!!item && !!item.statModifier) {
          for (let modifier of item.statModifier) {
            equipmentStats.find(stat => stat.id === modifier.statId).value += modifier.value;
          }
        }
      }

      if (this.equipment.getValue().filter(equipment => !!equipment && (equipment.id === EquipmentItemId.arc || equipment.id === EquipmentItemId.dague)).length === 2) {
        equipmentStats.find(stat => stat.id === CharacterStatId.ability).value--;
      }

      ability.equipment = equipmentStats.find(stat => stat.id === CharacterStatId.ability).value;
      dexterity.equipment = equipmentStats.find(stat => stat.id === CharacterStatId.dexterity).value;
      toughness.equipment = equipmentStats.find(stat => stat.id === CharacterStatId.toughness).value;
      luck.equipment = equipmentStats.find(stat => stat.id === CharacterStatId.luck).value;
      this.damage.equipment = equipmentStats.find(stat => stat.id === CharacterStatId.damage).value;
      this.armor.equipment = equipmentStats.find(stat => stat.id === CharacterStatId.armor).value;
      this.critical.equipment = equipmentStats.find(stat => stat.id === CharacterStatId.critical).value;
      this.ability.next(ability);
      this.dexterity.next(dexterity);
      this.toughness.next(toughness);
      this.luck.next(luck);
    });
  }

  static fromCharacterModel(c: CharacterModel): Character {
    const character = new Character(c.name);
    character.glory = c.glory;
    character.wealth = c.wealth;
    character.damage = new CharacterStat(c.damage);
    character.armor = new CharacterStat(c.armor);
    character.critical = new CharacterStat(c.critical);
    character.items = c.items;
    character.ability.next(new CharacterStat(c.ability));
    character.dexterity.next(new CharacterStat(c.dexterity));
    character.toughness.next(new CharacterStat(c.toughness));
    character.luck.next(new CharacterStat(c.luck));
    character.equipment.next(c.equipment);
    character.currentHp = c.currentHp;
    character.currentLuck = c.currentLuck;
    return character;
  }

  static toCharacterModel(character: Character): CharacterModel {
    return {
      name: character.name,
      trait: character.trait.getValue(),
      equipment: character.equipment.getValue(),
      ability: character.ability.getValue(),
      dexterity: character.dexterity.getValue(),
      toughness: character.toughness.getValue(),
      luck: character.luck.getValue(),
      glory: character.glory,
      wealth: character.wealth,
      damage: character.damage,
      armor: character.armor,
      critical: character.critical,
      maxLuck: character.maxLuck,
      maxHp: character.maxHp,
      currentHp: character.currentHp,
      currentLuck: character.currentLuck,
      items: character.items
    };
  }

  get weapons() {
    return this.equipment.getValue().filter(i => i.category === 'weapon');
  }

  get tools() {
    return this.equipment.getValue().filter(i => i.category === 'tool');
  }

  get supports() {
    return this.equipment.getValue().filter(i => i.category === 'support');
  }

  heal(amount: number) {
    this.currentHp += amount;
    if (this.currentHp > this.maxHp) {
      this.currentHp = this.maxHp;
    }
  }

  hurt(amount: number) {
    this.currentHp -= amount;
    if (this.currentHp < 0) {
      this.currentHp = 0;
    }
  }

  gainLuck(amount: number) {
    this.currentLuck += amount;
    if (this.currentLuck > this.maxLuck) {
      this.currentLuck = this.maxLuck;
    }
  }

  spendLuck(amount: number) {
    this.currentLuck -= amount;
    if (this.currentLuck < 0) {
      this.currentLuck = 0;
    }
  }

  getStat(statId: CharacterStatId): CharacterStat {
    switch (statId) {
      case CharacterStatId.luck:
        return this.luck.getValue();
      case CharacterStatId.ability:
        return this.ability.getValue();
      case CharacterStatId.dexterity:
        return this.dexterity.getValue();
      case CharacterStatId.toughness:
        return this.toughness.getValue();
      case CharacterStatId.armor:
        return this.armor;
      case CharacterStatId.damage:
        return this.damage;
      case CharacterStatId.critical:
        return this.critical;
    }
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
