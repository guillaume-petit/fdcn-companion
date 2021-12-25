import {CharacterStatId} from "./character-stat.model";

export interface StatModifier {
  statId: CharacterStatId;
  value: number;
}
