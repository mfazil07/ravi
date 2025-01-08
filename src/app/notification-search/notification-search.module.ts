import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationSearchComponent } from './notification-search.component';
import { NotificationSearchRoutingModule } from './notification-search-routing.module';
import { ClarityModule } from '@clr/angular';
import { NotificationDetailsComponent } from './notification-details/notification-details.component';
import { NotificationSearchFormComponent } from './notification-search-form/notification-search-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationSearchResultComponent } from './notification-search-result/notification-search-result.component';


@NgModule({
  declarations: [
    NotificationSearchComponent,
    NotificationDetailsComponent,
    NotificationSearchFormComponent,
    NotificationSearchResultComponent
  ],
  imports: [
    CommonModule,
    ClarityModule,
    NotificationSearchRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class NotificationSearchModule { }
