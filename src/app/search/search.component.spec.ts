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

  // ... (keep all existing test cases) ...

  describe('handleRowChange', () => {
    // ... (keep all existing handleRowChange test cases) ...

    it('should trigger refresh and revert selection when confirmation is false and isRefresh is 1', async () => {
      const unselectedInactiveEvent = {
        weatherEventId: 1,
        weatherEvent: 'Expired Storm',
        status: 'inactive',
      } as NotificationWeatherEvent;

      component.prevSelected = [unselectedInactiveEvent];
      component.selected = [];
      component.isRefresh = 1;
      component.isInitialLoad = false;
      component.hasUserInteractedOnce = true;

      (confirmDialogService.confirm as jasmine.Spy).and.returnValue(Promise.resolve(false));
      spyOn(component.triggerRefresh, 'emit');
      spyOn(component.onSelectChange, 'emit');

      await component.handleRowChange();

      expect(component.selected).toEqual([unselectedInactiveEvent]);
      expect(component.triggerRefresh.emit).toHaveBeenCalledWith(true);
      expect(component.onSelectChange.emit).toHaveBeenCalledWith([unselectedInactiveEvent]);
    });

    it('should handle unselected active event when selected length is 0', async () => {
      const unselectedActiveEvent = {
        weatherEventId: 1,
        weatherEvent: 'Active Storm',
        status: 'active',
      } as NotificationWeatherEvent;

      component.prevSelected = [unselectedActiveEvent];
      component.selected = [];
      component.isRefresh = 0;
      component.isInitialLoad = false;
      component.hasUserInteractedOnce = true;

      (confirmDialogService.confirm as jasmine.Spy).and.returnValue(Promise.resolve(true));
      spyOn(component.onUnSelectChange, 'emit');

      await component.handleRowChange();

      expect(confirmDialogService.confirm).toHaveBeenCalledWith(
        'No more Weather Alerts mapped at Case Level if saved.',
        'Ok',
        'Cancel'
      );
      expect(component.onUnSelectChange.emit).toHaveBeenCalledWith([]);
    });

    it('should revert selection when unselecting active event and confirmation is false', async () => {
      const unselectedActiveEvent = {
        weatherEventId: 1,
        weatherEvent: 'Active Storm',
        status: 'active',
      } as NotificationWeatherEvent;

      component.prevSelected = [unselectedActiveEvent];
      component.selected = [];
      component.isRefresh = 1;
      component.isInitialLoad = false;
      component.hasUserInteractedOnce = true;

      (confirmDialogService.confirm as jasmine.Spy).and.returnValue(Promise.resolve(false));
      spyOn(component.triggerRefresh, 'emit');
      spyOn(component.onSelectChange, 'emit');

      await component.handleRowChange();

      expect(component.selected).toEqual([unselectedActiveEvent]);
      expect(component.triggerRefresh.emit).toHaveBeenCalledWith(true);
      expect(component.onSelectChange.emit).toHaveBeenCalledWith([unselectedActiveEvent]);
    });

    it('should emit selected items when no special conditions are met', async () => {
      const selectedEvent = {
        weatherEventId: 1,
        weatherEvent: 'Active Storm',
        status: 'active',
        isMapped: 1
      } as NotificationWeatherEvent;

      component.prevSelected = [selectedEvent];
      component.selected = [selectedEvent];
      component.isInitialLoad = false;
      component.hasUserInteractedOnce = true;

      spyOn(component.onSelectChange, 'emit');

      await component.handleRowChange();

      expect(component.onSelectChange.emit).toHaveBeenCalledWith([selectedEvent]);
      expect(confirmDialogService.confirm).not.toHaveBeenCalled();
    });
  });
});
