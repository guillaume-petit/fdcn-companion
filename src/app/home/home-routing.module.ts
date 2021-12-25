import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'game',
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: 'game/load-game',
    loadChildren: () => import('../game/load-game/load-game.module').then( m => m.LoadGamePageModule)
  },
  {
    path: 'game/settings',
    loadChildren: () => import('../game/settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'game/character-sheet/:name',
    loadChildren: () => import('../game/character/character-sheet/character-sheet.module').then( m => m.CharacterSheetPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
