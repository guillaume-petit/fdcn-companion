import {EquipmentItem, EquipmentItemId} from '../equipment/equipment-item.model';
import {BehaviorSubject} from 'rxjs';
import {CharacterStat, CharacterStatId} from './character-stat.model';
import {CharacterModel} from "../../storage.service";

export class Character {
  name: string;
  trait: BehaviorSubject<'Indéfini' | 'Guerrier' | 'Paysan' | 'Prudent' | 'Débrouillard'> =
    new BehaviorSubject<'Indéfini' | 'Guerrier' | 'Paysan' | 'Prudent' | 'Débrouillard'>('Indéfini');
  equipment: BehaviorSubject<Array<EquipmentItem>> = new BehaviorSubject<Array<EquipmentItem>>([null, null, null]);
  ability: BehaviorSubject<CharacterStat> = new BehaviorSubject<CharacterStat>(
    new CharacterStat({
      id: CharacterStatId.ability,
      name: 'Habileté',
      base: 2
    }));
  dexterity: BehaviorSubject<CharacterStat> = new BehaviorSubject<CharacterStat>(
    new CharacterStat({
      id: CharacterStatId.dexterity,
      name: 'Adresse',
      base: 3
    }));
  toughness: BehaviorSubject<CharacterStat> = new BehaviorSubject<CharacterStat>(
    new CharacterStat({
      id: CharacterStatId.toughness,
      name: 'Endurance',
      base: 2
    }));
  luck: BehaviorSubject<CharacterStat> = new BehaviorSubject<CharacterStat>(
    new CharacterStat({
      id: CharacterStatId.luck,
      name: 'Chance',
      base: 3
    }));
  glory = 0;
  wealth = 0;
  damage = new CharacterStat({
    id: CharacterStatId.damage,
    name: 'Dégats',
    base: 0
  });
  armor = new CharacterStat({
    id: CharacterStatId.armor,
    name: 'Armure',
    base: 0
  });
  critical = new CharacterStat({
    id: CharacterStatId.critical,
    name: 'Critique',
    base: 0
  });

  maxLuck = 0;
  maxHp = 0;
  currentHp = 0;
  currentLuck = 0;

  items: Array<string> = [];

  constructor(name: string) {
    this.name = name;

    this.toughness.subscribe(toughness => {
      const newHpMax = toughness.total * 3;
      this.currentHp += newHpMax - this.maxHp;
      this.maxHp = newHpMax;
    });

    this.luck.subscribe(luck => {
      this.currentLuck += luck.total - this.maxLuck;
      this.maxLuck = luck.total;
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

      ability.equipment = 0;
      dexterity.equipment = 0;
      toughness.equipment = 0;
      luck.equipment = 0;
      this.damage.equipment = 0;
      this.armor.equipment = 0;
      this.critical.equipment = 0;

      for (const item of equipment) {
        if (!!item) {
          switch (item.id) {
            case EquipmentItemId.epee:
              ability.equipment += 4;
              break;
            case EquipmentItemId.lance:
              ability.equipment += 3;
              dexterity.equipment += 1;
              break;
            case EquipmentItemId.morgenstern:
              ability.equipment += 1;
              toughness.equipment += 1;
              this.damage.equipment += 1;
              break;
            case EquipmentItemId.arc:
              ability.equipment += 3;
              dexterity.equipment += 1;
              this.critical.equipment += 4;
              break;
            case EquipmentItemId.cotteDeMaille:
              ability.equipment += -1;
              dexterity.equipment += -1;
              toughness.equipment += 1;
              this.armor.equipment += 2;
              break;
            case EquipmentItemId.marmite:
              toughness.equipment += 2;
              this.armor.equipment += 1;
              break;
            case EquipmentItemId.pamphletTouristique:
              luck.equipment += 4;
              break;
            case EquipmentItemId.kitDeSoin:
              luck.equipment += 1;
              break;
            case EquipmentItemId.fourche:
              ability.equipment += 1;
              toughness.equipment += 3;
              break;
            case EquipmentItemId.dague:
              if (!equipment.find(e => e.id === EquipmentItemId.arc)) {
                ability.equipment += 1;
              }
              this.critical.equipment += 6;
              break;
            case EquipmentItemId.kitDEscalade:
              dexterity.equipment += 1;
              break;
            case EquipmentItemId.sacDeGrain:
              toughness.equipment += 4;
              luck.equipment += 4;
              break;
          }
        }
      }
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
