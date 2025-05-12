import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { NotificationWeatherEvent } from '../../models/notification';
import { ClrDatagridSortOrder } from '@clr/angular';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'notification-search-result',
  templateUrl: './notification-search-result.component.html',
  styleUrl: './notification-search-result.component.css'
})
export class NotificationSearchResultComponent {
  descSort = ClrDatagridSortOrder.DESC;
  @Output() onSelectChange = new EventEmitter();
  @Output() onUnSelectChange = new EventEmitter();
  @Output() triggerRefresh = new EventEmitter();
  selected: Array<NotificationWeatherEvent> = [];
  weatherEventsList: NotificationWeatherEvent[] = [];
  @Input() data: any[] = [];
  disableResult: boolean = false;
  previousSelected: NotificationWeatherEvent[] = [];
  prevSelected: NotificationWeatherEvent[] = [];
  isInitialLoad: boolean = true; // Track initial load state
  hasUserInteractedOnce: boolean = false; // Track if the user has interacted with the grid at least once
  isRefresh: number = 0


  @Input() set disableSelectChange(isDisabled: boolean) {
    this.disableResult = isDisabled;
  }
  @Input() set weatherEvents(_events: NotificationWeatherEvent[] | null) {
    this.isRefresh = 0;
    if (_events?.length) {
      this.weatherEventsList = _events.map(event => {
        event.state = event.state
        .split(',')
        .map(state => state.trim()) 
        .filter(state => state.length > 0)
        .join(', ');
        return event;
      }).sort((eventA: NotificationWeatherEvent, eventB: NotificationWeatherEvent) => {
        return eventB.isMapped - eventA.isMapped;
      });
      const selectedEvents = _events.filter((eventItem: NotificationWeatherEvent) => eventItem.isMapped === 1);
      if (selectedEvents.length) {
        this.selected = selectedEvents;
      }
    } else {
      this.weatherEventsList = [];
    }
  }



  constructor(private readonly confirmDialogService: ConfirmDialogService) { }
  ngOnInit() {   
    // Initially, we assume the load is fresh
    this.isInitialLoad = true;
  }

  // ngOnChanges function to handle weatherEvents population and skipping popups for preselected events
  ngOnChanges(changes: SimpleChanges) {   

    if (changes['weatherEvents'] && this.weatherEventsList.length) {

      // Update the `selected` array based on the new weatherEvents data
      const selectedEvents = this.weatherEventsList.filter((eventItem: NotificationWeatherEvent) => eventItem.isMapped === 1);

      // If `selected` is empty, update it with the newly selected events
      if (selectedEvents.length && this.selected.length === 0) {
        this.selected = selectedEvents;
      }

      //Handling mapped events uncheck for deselection confirmation dialog
      if (selectedEvents.length === 0) {
        this.prevSelected = selectedEvents;
      }
      else {
        this.prevSelected = this.selected;
      }

      // Make sure the initial load flag is set correctly
      this.isInitialLoad = false;
    }
  }

  async handleRowChange() {
    // Skip dialog for preselected items during initial load (if isMapped === 1)
    if (this.isInitialLoad) {
      this.isInitialLoad = false;
      this.previousSelected = [...this.selected];
      return;
    }
    // Check if this is the user's first interaction and no events are preselected
    if (!this.hasUserInteractedOnce) {
      this.hasUserInteractedOnce = true;

      // Show dialog only for the newly selected event (if it's not preselected)
      const newlySelectedRows = this.getNewlySelectedRows();
      newlySelectedRows.forEach((row) => {
        if (row.isMapped !== 1) {  // Check if the event is not preselected
          this.showConfirmationDialog(row);
        }
      });
    }
    else {
      // For subsequent selections, show the dialog for newly selected rows (if not preselected)
      const newlySelectedRows = this.getNewlySelectedRows();
      newlySelectedRows.forEach((row) => {
        if (row.isMapped !== 1) {  // Check if the event is not preselected
          this.showConfirmationDialog(row);
        }
      });
    }

    // Emit the updated selection
    this.onSelectChange.emit([...this.selected]);

    // Update `previousSelected` after handling the selection logic
    this.previousSelected = [...this.selected]; 

    if (this.prevSelected.length > this.selected.length) {
      this.isRefresh++
      let unselectedWeatherEvent: NotificationWeatherEvent[] = [];
      unselectedWeatherEvent = this.prevSelected.filter(o => !this.selected.some(i => i.weatherEventId === o.weatherEventId))

      if (this.selected.length === 0 && unselectedWeatherEvent[0].status.toLowerCase() === 'inactive') {       
        const confirmation = await this.confirmDialogService.confirm(`Be aware that this expired <b>${unselectedWeatherEvent[0].weatherEvent}</b> will no longer visible once unchecked. Do you wish to proceed?`, 'Ok', 'Cancel');

        if (confirmation) {             
          this.onUnSelectChange.emit([...this.selected]);
          return;
        }
        else {
          this.selected = [...this.prevSelected]
          if (this.isRefresh === 1) {
            this.triggerRefresh.emit(true);
          }

        }
      }

      else if (this.selected.length > 0 && unselectedWeatherEvent[0].status.toLowerCase() === 'inactive') {        
        const confirmation = await this.confirmDialogService.confirm(`Be aware that this expired <b>${unselectedWeatherEvent[0].weatherEvent}</b> will no longer be visible once unchecked. Do you wish to proceed?`, 'Ok', 'Cancel');

        if (confirmation) {
          this.onSelectChange.emit(this.selected)
          this.prevSelected = [...this.selected]          
        }
        else {
          if (this.isRefresh === 1) {
            this.triggerRefresh.emit(true);
          }
          this.selected = [...this.prevSelected]
          this.onSelectChange.emit(this.prevSelected)
        }
      }

      else if (this.selected.length == 0 && unselectedWeatherEvent[0].status.toLowerCase() === 'active') {        
        const confirmation = await this.confirmDialogService.confirm(`No more Weather Alerts mapped at Case Level if saved.`, 'Ok', 'Cancel');
        if (confirmation) {
          this.onUnSelectChange.emit([...this.selected]);
          return;
        }
        else {
          this.selected = [...this.prevSelected]
          if (this.isRefresh === 1) {
            this.triggerRefresh.emit(true);
          }
        }
      }

    }
    else {
      this.onSelectChange.emit([...this.selected]);
    }
    this.onSelectChange.emit([...this.selected]);
    this.prevSelected = Array.from(this.selected);
  }

  // Helper function to get newly selected rows
  private getNewlySelectedRows(): NotificationWeatherEvent[] {
    return this.selected.filter((event) => !this.previousSelected.includes(event));
  }   

  async showConfirmationDialog(weather: NotificationWeatherEvent) {
    const confirmation = await this.confirmDialogService.confirm(`You selected <b>${weather.weatherEvent}</b>, are you sure you want to continue?`, 'Ok', 'Cancel');
    if (confirmation) {
      // If confirmed, emit the updated selected items
      this.onSelectChange.emit(this.selected);
    } else {
      // If canceled, remove the selected event and update the previous selection
      this.selected = this.selected.filter((event) => event !== weather);
      this.previousSelected = [...this.selected];

      // Emit the updated selection after removal
      this.onSelectChange.emit(this.selected);
    }
  }
}
