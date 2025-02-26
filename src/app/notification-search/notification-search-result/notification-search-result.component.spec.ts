import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridWithAppointmentComponent } from './grid-with-appointment.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AlertService, IAlertType } from '../services/alert.service';
import { ClaimantsWeatherAlertsService } from '../services/claimants-weather-alerts.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('GridWithAppointmentComponent', () => {
  let component: GridWithAppointmentComponent;
  let fixture: ComponentFixture<GridWithAppointmentComponent>;
  let claimantsWeatherAlertsService: ClaimantsWeatherAlertsService;
  let alertService: AlertService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GridWithAppointmentComponent],
      imports: [HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        ClaimantsWeatherAlertsService,
        AlertService,
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              claimantId: '1',
              caseId: '1'
            })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GridWithAppointmentComponent);
    component = fixture.componentInstance;
    claimantsWeatherAlertsService = TestBed.inject(ClaimantsWeatherAlertsService);
    alertService = TestBed.inject(AlertService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize claimantId and caseId from queryParams and sessionStorage', () => {
    expect(component.claimantId).toEqual(1);
    expect(component.caseId).toEqual(1);
    expect(sessionStorage.getItem('claimantid')).toEqual('1');
    expect(sessionStorage.getItem('caseId')).toEqual('1');
  });



  it('should handle error response when getClaimantInfo fails', () => {
    spyOn(claimantsWeatherAlertsService, 'getClaimantInfo').and.returnValue(throwError({ status: 500 }));
    spyOn(component, 'handleError');

    component.ngOnInit();

    expect(component.handleError).toHaveBeenCalled();
  });

  it('should handle error response when GetCaseWithAppointments fails', () => {
    spyOn(claimantsWeatherAlertsService, 'GetCaseWithAppointments').and.returnValue(throwError({ status: 500 }));
    spyOn(component, 'handleError');

    component.ngOnInit();

    expect(component.handleError).toHaveBeenCalled();
  });

  it('should format SSN correctly', () => {
    const formattedSSN = component.formatSSN('123456789');
    expect(formattedSSN).toEqual('XXX-XX-6789');
  });

  it('should close the window', () => {
    spyOn(window, 'close');
    component.closeCurrentWindow();
    expect(window.close).toHaveBeenCalled();
  });

  it('should show alert on handleError', () => {
    spyOn(alertService, 'show');

    const errorResponse = { status: 500, error: 'Server error' } as HttpErrorResponse;
    component.handleError(errorResponse);

    expect(alertService.show).toHaveBeenCalledWith({
      message: 'Failed to fetch data from server : contact administrator',
      clrAlertType: IAlertType.DANGER
    });
  });
});
