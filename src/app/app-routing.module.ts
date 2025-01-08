import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';

const routes: Routes = [
  { path: 'search', loadChildren:()=> import('./notification-search/notification-search.module').then(m => m.NotificationSearchModule) },
  { path: '', component: SearchComponent, pathMatch: 'full' },
  // { path: '*', redirectTo: '', pathMatch: 'full' },
]
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
