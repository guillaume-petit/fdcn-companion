import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoadGamePage } from './load-game.page';

const routes: Routes = [
  {
    path: '',
    component: LoadGamePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoadGamePageRoutingModule {}
