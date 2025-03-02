import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { GridWithAppointmentComponent } from './grid-with-appointment.component';
import { ClaimantsWeatherAlertsService } from '../services/claimants-weather-alerts.service';
import { AlertService } from '../services/alert.service';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CaseDetails, CaseWithAppointment } from '../dtos/dtos';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('GridWithAppointmentComponent', () => {
  let component: GridWithAppointmentComponent;
  let fixture: ComponentFixture<GridWithAppointmentComponent>;
  let claimantsWeatherAlertsService: jasmine.SpyObj<ClaimantsWeatherAlertsService>;
  let alertService: jasmine.SpyObj<AlertService>;

  const activatedRouteMock = {
    queryParams: of({ claimantid: '1', caseId: '101' }),
  };

  beforeEach(async () => {
    const claimantsWeatherAlertsServiceSpy = jasmine.createSpyObj('ClaimantsWeatherAlertsService', [
      'getClaimantInfo',
      'GetCaseWithAppointments',
    ]);

    const alertServiceSpy = jasmine.createSpyObj('AlertService', ['show']);

    await TestBed.configureTestingModule({
      declarations: [GridWithAppointmentComponent],
      imports: [HttpClientModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ClaimantsWeatherAlertsService, useValue: claimantsWeatherAlertsServiceSpy },
        { provide: AlertService, useValue: alertServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GridWithAppointmentComponent);
    component = fixture.componentInstance;
    claimantsWeatherAlertsService = TestBed.inject(ClaimantsWeatherAlertsService) as jasmine.SpyObj<ClaimantsWeatherAlertsService>;
    alertService = TestBed.inject(AlertService) as jasmine.SpyObj<AlertService>;

    claimantsWeatherAlertsService.getClaimantInfo.and.returnValue(of([{
      claimantId: '1',
      caseId: '101',
      firstName: 'John',
      lastName: 'Doe'
    } as CaseDetails]));

    claimantsWeatherAlertsService.GetCaseWithAppointments.and.returnValue(of([{
      claimantId: '1',
      caseId: '101',
      appointmentId: '1001'
    }, {
      claimantId: '1',
      caseId: '101',
      appointmentId: '1002'
    }] as CaseWithAppointment[]));
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and fetch claimant info and appointments', () => {
    fixture.detectChanges();

    expect(claimantsWeatherAlertsService.getClaimantInfo).toHaveBeenCalledWith(1, 101);
    expect(claimantsWeatherAlertsService.GetCaseWithAppointments).toHaveBeenCalledWith(1, 101);
   // expect(component.caseDetails.claimant_name).toBe('Doe, John');
    expect(component.caseWithAppointments.length).toBe(2);
  });

  it('should handle errors correctly in handleError', () => {
    const errorResponses = [
      { status: 500, expectedMessage: 'Failed to fetch data from server : contact administrator' },
      { status: 503, expectedMessage: 'Failed to fetch data from server : contact administrator' },
      { status: 401, expectedMessage: 'Unauthorized : You are not authorized to perform this action.' },
      { status: 400, error: 'Bad Request', expectedMessage: 'Bad Request' },
    ];

    errorResponses.forEach(errorResponse => {
      const err = new HttpErrorResponse({ status: errorResponse.status, error: errorResponse.error });
      alertService.show.calls.reset(); // Reset the spy to avoid "already been spied upon" error

      component.handleError(err);

      expect(alertService.show).toHaveBeenCalled();
    });
  });

  it('should format SSN correctly', () => {
    const formattedSSN = component.formatSSN('123456789');
    expect(formattedSSN).toBe('XXX-XX-6789');
  });

  it('should close the current window', () => {
    spyOn(window, 'close');
    component.closeCurrentWindow();
    expect(window.close).toHaveBeenCalled();
  });
});
