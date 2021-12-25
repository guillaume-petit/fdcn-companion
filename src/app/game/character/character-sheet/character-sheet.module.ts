import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CharacterSheetPageRoutingModule } from './character-sheet-routing.module';

import { CharacterSheetPage } from './character-sheet.page';
import {MainStatCardComponent} from "./main-stat-card/main-stat-card.component";
import {SelectEquipmentModalComponent} from "./select-equipment-modal/select-equipment-modal.component";
import {SelectEquipmentItemComponent} from "./select-equipment-modal/select-equipment-item/select-equipment-item.component";
import {SecondStatCardComponent} from "./second-stat-card/second-stat-card.component";
import {FightModalComponent} from "../../fight/fight-modal/fight-modal.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CharacterSheetPageRoutingModule
  ],
  declarations: [
    CharacterSheetPage,
    MainStatCardComponent,
    SelectEquipmentModalComponent,
    SelectEquipmentItemComponent,
    SecondStatCardComponent,
    FightModalComponent
  ]
})
export class CharacterSheetPageModule {}
