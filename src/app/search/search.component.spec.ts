import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationSearchResultComponent } from './notification-search-result.component';
import { ClrDatagridModule } from '@clr/angular';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { NotificationWeatherEvent } from '../../models/notification';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA, SimpleChange, SimpleChanges } from '@angular/core';

describe('NotificationSearchResultComponent', () => {
  let component: NotificationSearchResultComponent;
  let fixture: ComponentFixture<NotificationSearchResultComponent>;
  let confirmDialogService: ConfirmDialogService;
    
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationSearchResultComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [ClrDatagridModule],
      providers: [
        {
          provide: ConfirmDialogService,
          useValue: {
            confirm: jasmine.createSpy('confirm').and.returnValue(of(true)),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationSearchResultComponent);
    component = fixture.componentInstance;
    confirmDialogService = TestBed.inject(ConfirmDialogService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle initial load and set previousSelected', async () => {
    component.isInitialLoad = true;
    component.selected = [{ weatherEventId: 1, isMapped: 1 } as NotificationWeatherEvent];
    await component.handleRowChange();
    expect(component.isInitialLoad).toBe(false);
    expect(component.previousSelected).toEqual([{ weatherEventId: 1, isMapped: 1 } as NotificationWeatherEvent]);
  
  });

  it('should handle unselected inactive event when selected length is 0', async () => {
    const unselectedInactiveEvent = {
      weatherEventId: 1,
      weatherEvent: 'Expired Storm',
      status: 'inactive',
    } as NotificationWeatherEvent;
  
    // Set up component state
    component.prevSelected = [unselectedInactiveEvent];
    component.selected = [];
    component.isRefresh = 0;
  
    component.isInitialLoad = false;
    component.hasUserInteractedOnce = true;
  
    (confirmDialogService.confirm as jasmine.Spy).and.returnValue(Promise.resolve(true));
  
    spyOn(component.onUnSelectChange, 'emit');
  
    await component.handleRowChange();
  
    expect(confirmDialogService.confirm).toHaveBeenCalledWith(
      `Please select at least one Weather Alert to continue. Be aware that this expired <b>${unselectedInactiveEvent.weatherEvent}</b> will no longer visible once unchecked. Do you wish to proceed?`,
      'Ok',
      'Cancel'
    );
  
    expect(component.onUnSelectChange.emit).toHaveBeenCalledWith([]);
    expect(component.isRefresh).toBe(1);
  });

  it('should handle unselected inactive event when selected length > 0', async () => {
    const unselectedInactiveEvent = {
      weatherEventId: 1,
      weatherEvent: 'Expired Storm',
      status: 'inactive',
    } as NotificationWeatherEvent;
  
    const selectedEvent = {
      weatherEventId: 2,
      weatherEvent: 'Active Storm',
      status: 'active',
    } as NotificationWeatherEvent;
  
    component.prevSelected = [unselectedInactiveEvent, selectedEvent];
    component.selected = [selectedEvent];
    component.isRefresh = 0;
  
    component.isInitialLoad = false;
    component.hasUserInteractedOnce = true;
  
    (confirmDialogService.confirm as jasmine.Spy).and.returnValue(Promise.resolve(true));
  
    spyOn(component.onSelectChange, 'emit');
    spyOn(component.triggerRefresh, 'emit');
  
    await component.handleRowChange();
  
    expect(confirmDialogService.confirm).toHaveBeenCalledWith(
      `This expired <b>${unselectedInactiveEvent.weatherEvent}</b> will no longer be visible once unchecked. Do you wish to proceed?`,
      'Ok',
      'Cancel'
    );
  
    expect(component.onSelectChange.emit).toHaveBeenCalledWith([selectedEvent]);
    expect(component.prevSelected).toEqual([selectedEvent]);
    expect(component.triggerRefresh.emit).not.toHaveBeenCalled();
  });

  it('should revert selection and trigger refresh if confirmation is false and isRefresh === 1', async () => {
    const unselectedInactiveEvent = {
      weatherEventId: 1,
      weatherEvent: 'Expired Storm',
      status: 'inactive',
    } as NotificationWeatherEvent;
  
    const selectedEvent = {
      weatherEventId: 2,
      weatherEvent: 'Active Storm',
      status: 'active',
    } as NotificationWeatherEvent;
  
    component.prevSelected = [unselectedInactiveEvent, selectedEvent];
    component.selected = [selectedEvent]; // Simulate unselecting the inactive event
    component.isRefresh = 1; // Set isRefresh to 1 to trigger refresh
  
    component.isInitialLoad = false;
    component.hasUserInteractedOnce = true;
  
    (confirmDialogService.confirm as jasmine.Spy).and.returnValue(Promise.resolve(false));
  
    spyOn(component.onSelectChange, 'emit');
    spyOn(component.triggerRefresh, 'emit');
  
    await component.handleRowChange();
  
    expect(component.selected).toEqual([unselectedInactiveEvent, selectedEvent]);
  
    expect(component.onSelectChange.emit).toHaveBeenCalledWith([unselectedInactiveEvent, selectedEvent]);
  });

  it('should show confirmation dialog for newly selected rows on first user interaction', async () => {
    component.isInitialLoad = false;
    component.hasUserInteractedOnce = false;
    component.selected = [{ weatherEventId: 1, isMapped: 0 } as NotificationWeatherEvent];
    component.previousSelected = [];
    spyOn(component, 'showConfirmationDialog');

    await component.handleRowChange();

    expect(component.hasUserInteractedOnce).toBe(true);
    expect(component.showConfirmationDialog).toHaveBeenCalledWith({ weatherEventId: 1, isMapped: 0 } as NotificationWeatherEvent);
  });

  it('should show confirmation dialog for newly selected rows on subsequent interactions', async () => {
    component.isInitialLoad = false;
    component.hasUserInteractedOnce = true;
    component.selected = [{ weatherEventId: 1, isMapped: 0 } as NotificationWeatherEvent];
    component.previousSelected = [];   
    spyOn(component, 'showConfirmationDialog');

    await component.handleRowChange();

    expect(component.showConfirmationDialog).toHaveBeenCalledWith({ weatherEventId: 1, isMapped: 0 } as NotificationWeatherEvent);
  });

  it('should emit updated selection and update previousSelected', async () => {
    component.selected = [{ weatherEventId: 1, isMapped: 1 } as NotificationWeatherEvent];
    component.previousSelected = [{ weatherEventId: 2, isMapped: 1 } as NotificationWeatherEvent];
    spyOn(component.onSelectChange, 'emit');

    await component.handleRowChange();
    expect(component.previousSelected).toEqual([{ weatherEventId: 1, isMapped: 1 } as NotificationWeatherEvent]);
  });


  it('should handle unselected active weather events with confirmation', async () => {
    component.prevSelected = [{ weatherEventId: 1, status: 'active', weatherEvent: 'Event 1' } as NotificationWeatherEvent];
    component.selected = [];  
    spyOn(component.onUnSelectChange, 'emit');

    (confirmDialogService.confirm as jasmine.Spy).and.returnValue(Promise.resolve(true));
    await component.handleRowChange();
  });

  it('should handle unselected active weather events with confirmation', async () => {
    component.prevSelected = [{ weatherEventId: 1, status: 'active', weatherEvent: 'Event 1' } as NotificationWeatherEvent];
    component.selected = [];
    (confirmDialogService.confirm as jasmine.Spy).and.returnValue(Promise.resolve(true));

    await component.handleRowChange();    
  });

  it('should revert selection if confirmation is cancelled', async () => {
    component.prevSelected = [{ weatherEventId: 1, status: 'inactive', weatherEvent: 'Event 1' } as NotificationWeatherEvent];
    component.selected = [];
    (confirmDialogService.confirm as jasmine.Spy).and.returnValue(Promise.resolve(false));

    await component.handleRowChange();

    expect(component.selected.length).toEqual(0);
  });

  it('should get newly selected rows correctly', () => {
    const previousSelected: NotificationWeatherEvent[] = [
      { weatherEventId: 1 } as NotificationWeatherEvent,
      { weatherEventId: 2 } as NotificationWeatherEvent,
    ];
  
    const selected: NotificationWeatherEvent[] = [
      { weatherEventId: 1 } as NotificationWeatherEvent,
      { weatherEventId: 2 } as NotificationWeatherEvent,
      { weatherEventId: 3 } as NotificationWeatherEvent,
    ];
  
    component.previousSelected = previousSelected;
    component.selected = selected;
  
    const newlySelectedRows = (component as any).getNewlySelectedRows();
    expect(newlySelectedRows.length).toEqual(3);
  });

  it('should set disableResult when disableSelectChange is called', () => {
    component.disableSelectChange = true;
    expect(component.disableResult).toBe(true);
  });

  it('should sort weatherEvents and set selected events when weatherEvents is called', () => {
    
    const mockEvents: NotificationWeatherEvent[] = [
      { isMapped: 1, state:'CA, OR' } as NotificationWeatherEvent,
      { isMapped: 0, state:'FL, AL' } as NotificationWeatherEvent,
      { isMapped: 1, state:'MS, LA' } as NotificationWeatherEvent,
    ];
   
    component.weatherEvents = mockEvents;  
    expect(component.weatherEventsList).toEqual([
      { isMapped: 1, state:'CA, OR' } as NotificationWeatherEvent,
      { isMapped: 1, state:'MS, LA' } as NotificationWeatherEvent,
      { isMapped: 0, state:'FL, AL' } as NotificationWeatherEvent,
    ]);
    expect(component.selected).toEqual([
      { isMapped: 1, state:'CA, OR' } as NotificationWeatherEvent,
      { isMapped: 1, state:'MS, LA' } as NotificationWeatherEvent,
    ]);
  });

  it('should set weatherEventsList to empty array when weatherEvents is null', () => {
    component.weatherEvents = null;
    expect(component.weatherEventsList).toEqual([]);
  });

  it('should set weatherEventsList to empty array when weatherEvents is an empty array', () => {
    component.weatherEvents = [];
    expect(component.weatherEventsList).toEqual([]);
  });

  it('should handle changes in weatherEvents with existing selected events', () => {
    const existingSelectedEvents: NotificationWeatherEvent[] = [
      { weatherEventId: 1, isMapped: 1 } as NotificationWeatherEvent,
      { weatherEventId: 2, isMapped: 0 } as NotificationWeatherEvent,
    ];

    const newWeatherEvents: NotificationWeatherEvent[] = [
      { weatherEventId: 1, isMapped: 1 } as NotificationWeatherEvent,
      { weatherEventId: 3, isMapped: 1 } as NotificationWeatherEvent,
    ];

    component.selected = existingSelectedEvents;
    component.prevSelected = existingSelectedEvents;
    component.weatherEventsList = newWeatherEvents;

    const changes: SimpleChanges = {
      weatherEvents: new SimpleChange(null, newWeatherEvents, false),
    };

    component.ngOnChanges(changes);

   
    expect(component.isInitialLoad).toBeFalse();
  });

  it('should emit updated selection based on confirmation', async () => {
    const weatherEvent = { weatherEventId: 1, weatherEvent: 'Storm' } as NotificationWeatherEvent;
    component.selected = [weatherEvent];
  
    (confirmDialogService.confirm as jasmine.Spy).and.returnValue(Promise.resolve(true));
    spyOn(component.onSelectChange, 'emit');
  
    await component.showConfirmationDialog(weatherEvent);
  
    expect(component.onSelectChange.emit).toHaveBeenCalled();
  });

  it('should emit selected items if confirmation is true', async () => {
    const weatherEvent = { weatherEventId: 1, weatherEvent: 'Storm' } as NotificationWeatherEvent;
    component.selected = [weatherEvent];
    (confirmDialogService.confirm as jasmine.Spy).and.returnValue(Promise.resolve(false));
    spyOn(component.onSelectChange, 'emit');

    await component.showConfirmationDialog(weatherEvent);
    expect(component.onSelectChange.emit).toHaveBeenCalled();
  });  
});
