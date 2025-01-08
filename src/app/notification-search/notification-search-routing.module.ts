import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationSearchComponent } from './notification-search.component';

const routes: Routes = [
  {
    path: '',
    component: NotificationSearchComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationSearchRoutingModule { }