import { Component, Input } from '@angular/core';
import { NotificationEventType } from '../../models/notification';

@Component({
  selector: 'notification-details',
  templateUrl: './notification-details.component.html',
  styleUrl: './notification-details.component.css'
})
export class NotificationDetailsComponent {
  @Input() notification:NotificationEventType | null = null;

}

