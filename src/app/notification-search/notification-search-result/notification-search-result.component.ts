import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { weatherEventType } from '../../models/notification';

@Component({
  selector: 'notification-search-result',
  templateUrl: './notification-search-result.component.html',
  styleUrl: './notification-search-result.component.css'
})
export class NotificationSearchResultComponent implements OnInit {
  selected: Array<weatherEventType> = [];
  prevSelected: Array<weatherEventType> = [];
  weatherEventsList: weatherEventType[] | null = null;
  @Output() onSelectChange = new EventEmitter();
  @Output() onUnSelectChange = new EventEmitter();
  @Input() set weatherEvents(_events: weatherEventType[] | null) {
    if (_events?.length && !this.weatherEventsList?.length) {
      this.weatherEventsList = _events;
    }
  };

  tableHeader: Array<string> = ['Weather Event', 'Weather Type', 'Description', 'Location', 'Country', 'State', 'Event Start Date', 'Event End Date', 'Status'];
  /**
   *  Emit the value when a change in selection is happening
   * 
   */
  handleRowChange() {
    if (this.prevSelected.length > this.selected.length) {
      this.onUnSelectChange.emit(this.prevSelected.filter(o => !this.selected.some(i => i === o)));
    }
    else {
      this.onSelectChange.emit(this.selected);
    }
    this.prevSelected = Array.from(this.selected);

  }

  ngOnInit() {
    if (this.weatherEventsList) {
      setTimeout(() => {
        this.selected = this.weatherEventsList?.filter(weather => weather.status === 'active') || [];
        this.prevSelected = Array.from(this.selected);
      }, 0);
    }
  }
}
