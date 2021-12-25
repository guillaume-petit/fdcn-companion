import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {LoadGamePageRoutingModule} from './load-game-routing.module';

import {LoadGamePage} from './load-game.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoadGamePageRoutingModule
  ],
  declarations: [LoadGamePage]
})
export class LoadGamePageModule {}
