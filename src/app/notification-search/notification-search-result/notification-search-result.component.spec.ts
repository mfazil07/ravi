import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationSearchResultComponent } from './notification-search-result.component';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { ClrDatagridSortOrder } from '@clr/angular';
import { NotificationWeatherEvent } from '../../models/notification';
import { of } from 'rxjs';

class MockConfirmDialogService {
  confirm(message: string, okText: string = 'Ok', cancelText: string = 'Cancel'): Promise<boolean> {
    return Promise.resolve(true);
  }
}

describe('NotificationSearchResultComponent', () => {
  let component: NotificationSearchResultComponent;
  let fixture: ComponentFixture<NotificationSearchResultComponent>;
  let confirmDialogService: ConfirmDialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationSearchResultComponent],
      providers: [
        { provide: ConfirmDialogService, useClass: MockConfirmDialogService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationSearchResultComponent);
    component = fixture.componentInstance;
    confirmDialogService = TestBed.inject(ConfirmDialogService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.descSort).toBe(ClrDatagridSortOrder.DESC);
    expect(component.selected).toEqual([]);
    expect(component.weatherEventsList).toEqual([]);
    expect(component.disableResult).toBeFalse();
    expect(component.previousSelected).toEqual([]);
    expect(component.prevSelected).toEqual([]);
    expect(component.isInitialLoad).toBeTrue();
    expect(component.hasUserInteractedOnce).toBeFalse();
    expect(component.isRefresh).toBe(0);
  });

  it('should handle disableSelectChange input', () => {
    component.disableSelectChange = true;
    expect(component.disableResult).toBeTrue();
  });

  it('should handle weatherEvents input', () => {
    const weatherEvents: NotificationWeatherEvent[] = [
      { weatherEventId: 1, weatherEvent: 'Event 1', isMapped: 1, status: 'active' },
      { weatherEventId: 2, weatherEvent: 'Event 2', isMapped: 0, status: 'inactive' },
    ];
    component.weatherEvents = weatherEvents;
    expect(component.weatherEventsList.length).toBe(2);
    expect(component.selected.length).toBe(1);
  });

  it('should handle weatherEvents input with no events', () => {
    component.weatherEvents = null;
    expect(component.weatherEventsList.length).toBe(0);
  });

  it('should handle row change on initial load', async () => {
    component.isInitialLoad = true;
    component.selected = [{ weatherEventId: 1, weatherEvent: 'Event 1', isMapped: 1, status: 'active' }];
    await component.handleRowChange();
    expect(component.isInitialLoad).toBeFalse();
    expect(component.previousSelected.length).toBe(1);
  });

  it('should handle row change with user interaction', async () => {
    component.hasUserInteractedOnce = true;
    spyOn(component, 'showConfirmationDialog').and.callThrough();
    component.selected = [{ weatherEventId: 1, weatherEvent: 'Event 1', isMapped: 0, status: 'active' }];
    await component.handleRowChange();
    expect(component.showConfirmationDialog).toHaveBeenCalled();
  });

  it('should emit onSelectChange on row change', async () => {
    spyOn(component.onSelectChange, 'emit');
    component.selected = [{ weatherEventId: 1, weatherEvent: 'Event 1', isMapped: 0, status: 'active' }];
    await component.handleRowChange();
    expect(component.onSelectChange.emit).toHaveBeenCalledWith(component.selected);
  });

  it('should handle confirmation dialog', async () => {
    spyOn(confirmDialogService, 'confirm').and.returnValue(Promise.resolve(true));
    spyOn(component.onSelectChange, 'emit');
    const weatherEvent = { weatherEventId: 1, weatherEvent: 'Event 1', isMapped: 0, status: 'active' };
    await component.showConfirmationDialog(weatherEvent);
    expect(confirmDialogService.confirm).toHaveBeenCalled();
    expect(component.onSelectChange.emit).toHaveBeenCalledWith(component.selected);
  });

  it('should handle confirmation dialog cancel', async () => {
    spyOn(confirmDialogService, 'confirm').and.returnValue(Promise.resolve(false));
    spyOn(component.onSelectChange, 'emit');
    const weatherEvent = { weatherEventId: 1, weatherEvent: 'Event 1', isMapped: 0, status: 'active' };
    component.selected = [weatherEvent];
    await component.showConfirmationDialog(weatherEvent);
    expect(confirmDialogService.confirm).toHaveBeenCalled();
    expect(component.selected.length).toBe(0);
    expect(component.onSelectChange.emit).toHaveBeenCalledWith(component.selected);
  });

  it('should handle ngOnChanges with weatherEvents change', () => {
    component.weatherEventsList = [
      { weatherEventId: 1, weatherEvent: 'Event 1', isMapped: 1, status: 'active' },
      { weatherEventId: 2, weatherEvent: 'Event 2', isMapped: 0, status: 'inactive' },
    ];
    component.selected = [];
    const changes = { weatherEvents: { currentValue: component.weatherEventsList, previousValue: [], firstChange: true, isFirstChange: () => true } };
    component.ngOnChanges(changes);
    expect(component.selected.length).toBe(1);
  });

  it('should handle ngOnChanges without weatherEvents change', () => {
    const changes = { data: { currentValue: [], previousValue: [], firstChange: true, isFirstChange: () => true } };
    component.ngOnChanges(changes);
    expect(component.selected.length).toBe(0);
  });

  it('should get newly selected rows', () => {
    component.previousSelected = [{ weatherEventId: 1, weatherEvent: 'Event 1', isMapped: 1, status: 'active' }];
    component.selected = [
      { weatherEventId: 1, weatherEvent: 'Event 1', isMapped: 1, status: 'active' },
      { weatherEventId: 2, weatherEvent: 'Event 2', isMapped: 0, status: 'inactive' },
    ];
    const newlySelectedRows = component.getNewlySelectedRows();
    expect(newlySelectedRows.length).toBe(1);
  });
});
