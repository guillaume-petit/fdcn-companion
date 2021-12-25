export class CharacterStat {
  id: CharacterStatId;
  base = 0;
  trait = 0;
  equipment = 0;
  modifier = 0;

  constructor(obj: any) {
    this.id = obj.id;
    this.base = obj.base;
    this.trait = obj.trait || 0;
    this.equipment = obj.equipment || 0;
    this.modifier = obj.modifier || 0;
  }

  get total() {
    let total = this.base + this.equipment + this.trait;
    if (this.id === CharacterStatId.dexterity && total > 5) {
      total = 5;
    }
    return total;
  }

  get combatValue() {
    let total = this.base + this.equipment + this.trait + this.modifier;
    if (this.id === CharacterStatId.dexterity && total > 5) {
      total = 5;
    }
    return total;
  }

  levelUp() {
    this.base++;
    return this;
  }

  reset() {
    switch (this.id) {
      case CharacterStatId.ability:
      case CharacterStatId.toughness:
        this.base = 2;
        break;
      case CharacterStatId.dexterity:
        this.base = 1;
        break;
      case CharacterStatId.luck:
        this.base = 3;
        break;
      default:
        this.base = 0;
    }
    return this;
  }
}

export enum CharacterStatId {
  ability = 'Habileté',
  dexterity = 'Adresse',
  toughness = 'Endurance',
  luck = 'Chance',
  damage = 'Dégâts',
  armor = 'Armure',
  critical = 'Critique'
}
