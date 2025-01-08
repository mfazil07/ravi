import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, timer } from 'rxjs';

export interface IAlertConfig {
  clrAlertType: string; // Add your own types
  message: string;
  clrAlertAppLevel?: boolean;
  clrAlertClosable?: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private messageQueue: IAlertConfig[] = [];
  private alertListSubject = new BehaviorSubject<IAlertConfig[]>([]);
  close = new Subject<any>();

  constructor() {}

  /**
   * Push a new message to the queue.
   */
  pushMessage(config: IAlertConfig): void {
    this.messageQueue.push(config);
    this.emitAlertList();
    this.autoClose(config);
  }

  /**
   * Remove a message from the queue.
   */
  removeMessage(message: IAlertConfig): void {
    const index = this.messageQueue.indexOf(message);
    if (index > -1) {
      this.messageQueue.splice(index, 1);
      this.emitAlertList();
    }
  }

  /**
   * Get observable for the current alert list.
   */
  getAlerts$() {
    return this.alertListSubject.asObservable();
  }

  /**
   * Emit the current alert list.
   */
  private emitAlertList(): void {
    this.alertListSubject.next([...this.messageQueue]);
  }

  /**
   * Auto-close a message after 7 seconds.
   */
  private autoClose(config: IAlertConfig): void {
    timer(7000).subscribe(() => {
      this.removeMessage(config);
    });
  }
}
