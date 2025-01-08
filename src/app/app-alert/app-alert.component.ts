import { Component, OnInit } from '@angular/core';
import { AlertService, IAlertConfig } from '../services/alert.service';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';
@Component({
  selector: 'app-alert',
  templateUrl: './app-alert.component.html',
  styleUrls: ['./app-alert.component.css'],
  animations: [
    trigger('alertAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger(100, [
              animate(
                '0.3s ease',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
        query(
          ':leave',
          [
            animate(
              '0.3s ease',
              style({ opacity: 0, transform: 'translateY(-20px)' })
            ),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class AppAlertComponent implements OnInit {
  alerts: IAlertConfig[] = [];

  constructor(private alertService: AlertService) {}

  ngOnInit(): void {
    this.alertService.getAlerts$().subscribe((alerts) => {
      this.alerts = alerts;
    });
  }

  closeAlert(alert: IAlertConfig): void {
    this.alertService.removeMessage(alert);
  }
}
