import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { QtcHeaderComponent } from './qtc-header.component';
import { CommonService } from '../services/common.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { ClarityModule } from '@clr/angular';
import { Router, NavigationEnd } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('QtcHeaderComponent', () => {
  let component: QtcHeaderComponent;
  let fixture: ComponentFixture<QtcHeaderComponent>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create mock services
    mockCommonService = jasmine.createSpyObj('CommonService', [
      'userName$',
      'currentFlag',
      'currentAppointmentsFlag',
      'claimantIdSubject$',
      'caseIdSubject$',
      'getReferrerUrl'
    ]);
    
    mockRouter = jasmine.createSpyObj('Router', ['events', 'serializeUrl', 'createUrlTree', 'navigate']);

    await TestBed.configureTestingModule({
      declarations: [QtcHeaderComponent],
      imports: [ClarityModule, RouterTestingModule],
      providers: [
        { provide: CommonService, useValue: mockCommonService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QtcHeaderComponent);
    component = fixture.componentInstance;
    
    // Setup default mock values
    mockCommonService.userName$ = of('TestUser');
    mockCommonService.currentFlag = of(false);
    mockCommonService.currentAppointmentsFlag = of(true);
    mockCommonService.claimantIdSubject$ = of(12345);
    mockCommonService.caseIdSubject$ = of(67890);
    mockCommonService.getReferrerUrl.and.returnValue('https://test.example.com');
    
    // Mock router events
    const navigationEnd = new NavigationEnd(1, '/test', '/test');
    mockRouter.events = of(navigationEnd);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize userName from CommonService and convert to uppercase', () => {
    expect(component.userName).toBe('TESTUSER');
    const userNameElement = fixture.debugElement.query(By.css('.user-icon-text'));
    expect(userNameElement.nativeElement.textContent).toContain('TESTUSER');
  });

  it('should initialize flags from CommonService', () => {
    expect(component.notesRequired).toBeFalse();
    expect(component.appointmentsIconRequired).toBeTrue();
  });

  it('should initialize claimant and case IDs from CommonService', () => {
    expect(component.claimantId).toBe(12345);
    expect(component.caseId).toBe(67890);
  });

  it('should set externalUrl from sessionStorage or CommonService', () => {
    expect(component.externalUrl).toBe('https://test.example.com');
    expect(sessionStorage.getItem('notesDocumentReferrer')).toBe('https://test.example.com');
  });

  describe('route-based claimantLevel', () => {
    it('should set " - APPOINTMENT LEVEL" for /withAppointment route', fakeAsync(() => {
      mockRouter.events = of(new NavigationEnd(1, '/withAppointment', '/withAppointment'));
      fixture = TestBed.createComponent(QtcHeaderComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
      expect(component.claimantLevel).toBe(' - APPOINTMENT LEVEL');
    }));

    it('should set " - CASE LEVEL" for /search route', fakeAsync(() => {
      mockRouter.events = of(new NavigationEnd(1, '/search', '/search'));
      fixture = TestBed.createComponent(QtcHeaderComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
      expect(component.claimantLevel).toBe(' - CASE LEVEL');
    }));

    it('should set empty string for /notAuthorized route', fakeAsync(() => {
      mockRouter.events = of(new NavigationEnd(1, '/notAuthorized', '/notAuthorized'));
      fixture = TestBed.createComponent(QtcHeaderComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();
      expect(component.claimantLevel).toBe('');
    }));
  });

  describe('window opening methods', () => {
    beforeEach(() => {
      spyOn(window, 'open');
    });

    it('should open notes window with correct parameters', () => {
      component.openNotesWindow();
      expect(window.open).toHaveBeenCalledWith(
        'https://test.example.comnotes/Q_NOTES_01.asp?claimant_Id=12345&case_Id=67890',
        'Notes',
        'toolbar=no, scrollbars=yes, resizable=yes, top=100, left=100, width=900, height=800'
      );
    });

    it('should open appointments window with correct parameters', () => {
      component.openAppointmentsWindow();
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
        ['withAppointment'], 
        { queryParams: { claimantId: 12345, caseid: 67890 } }
      );
      expect(window.open).toHaveBeenCalled();
    });
  });

  afterEach(() => {
    sessionStorage.removeItem('notesDocumentReferrer');
  });
});
