import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QtcHeaderComponent } from './qtc-header.component';
import { CommonService } from '../services/common.service';
import { Router, NavigationEnd } from '@angular/router';
import { of, Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { ClarityModule } from '@clr/angular'; // Import ClarityModule to use Clarity components

class MockRouter {
  public events = new Subject<any>();
  navigate() {}
  serializeUrl() {
    return '/withAppointment';
  }
  createUrlTree() {
    return {};
  }
}

describe('QtcHeaderComponent', () => {
  let component: QtcHeaderComponent;
  let fixture: ComponentFixture<QtcHeaderComponent>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockRouter: MockRouter;

  beforeEach(async () => {
    // Create a mock for the CommonService
    mockCommonService = jasmine.createSpyObj('CommonService', [
      'userName$',
      'currentFlag',
      'currentAppointmentsFlag',
      'claimantIdSubject$',
      'caseIdSubject$',
      'getReferrerUrl',
    ]);

    // Configure the mock to return observables
    mockCommonService.userName$ = of('TestUser');
    mockCommonService.currentFlag = of(true);
    mockCommonService.currentAppointmentsFlag = of(false);
    mockCommonService.claimantIdSubject$ = of(123);
    mockCommonService.caseIdSubject$ = of(456);
    mockCommonService.getReferrerUrl.and.returnValue('http://example.com/');

    // Create a mock for the Router
    mockRouter = new MockRouter();

    // Set up the testing module
    await TestBed.configureTestingModule({
      declarations: [QtcHeaderComponent],
      imports: [ClarityModule], // Add ClarityModule to imports to use clr-dropdown
      providers: [
        { provide: CommonService, useValue: mockCommonService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QtcHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger change detection to update the view
  });

  it('should display the userName initially from the CommonService', () => {
    expect(component.userName).toBe('TESTUSER'); // The userName is converted to uppercase in ngOnInit
    const userNameElement = fixture.debugElement.query(By.css('.user-icon-text'));
    expect(userNameElement.nativeElement.textContent).toContain('TESTUSER');
  });

  it('should update notesRequired from the CommonService', () => {
    expect(component.notesRequired).toBeTrue();
  });

  it('should update appointmentsIconRequired from the CommonService', () => {
    expect(component.appointmentsIconRequired).toBeFalse();
  });

  it('should update claimantId and caseId from the CommonService', () => {
    expect(component.claimantId).toBe(123);
    expect(component.caseId).toBe(456);
  });

  it('should set externalUrl and sessionStorage on initialization', () => {
    expect(component.externalUrl).toBe('http://example.com/');
    expect(sessionStorage.getItem('notesDocumentReferrer')).toBe('http://example.com/');
  });

  it('should update claimantLevel on navigation events', () => {
    mockRouter.events.next(new NavigationEnd(0, '/withAppointment', '/withAppointment'));
    fixture.detectChanges();
    expect(component.claimantLevel).toBe(' - APPOINTMENT LEVEL');

    mockRouter.events.next(new NavigationEnd(0, '/search', '/search'));
    fixture.detectChanges();
    expect(component.claimantLevel).toBe(' - CASE LEVEL');

    mockRouter.events.next(new NavigationEnd(0, '/notAuthorized', '/notAuthorized'));
    fixture.detectChanges();
    expect(component.claimantLevel).toBe('');
  });

  it('should open notes window with correct URL', () => {
    spyOn(window, 'open');
    component.openNotesWindow();
    expect(window.open).toHaveBeenCalledWith(
      'http://example.com/notes/Q_NOTES_01.asp?claimant_Id=123&case_Id=456',
      'Notes',
      'toolbar=no, scrollbars=yes, resizable=yes, top=100, left=100, width=900, height=800'
    );
  });

  it('should open appointments window with correct URL', () => {
    spyOn(window, 'open');
    component.openAppointmentsWindow();
    expect(window.open).toHaveBeenCalledWith(
      `${window.location.origin}/withAppointment`,
      'AppointmentLevel',
      'toolbar=no, scrollbars=yes, resizable=yes, top=100, left=100, width=1200, height=800'
    );
  });
});
