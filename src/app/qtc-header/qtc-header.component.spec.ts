import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { QtcHeaderComponent } from './qtc-header.component';
import { CommonService } from '../services/common.service';
import { of, Subject } from 'rxjs';

describe('QtcHeaderComponent', () => {
  let component: QtcHeaderComponent;
  let fixture: ComponentFixture<QtcHeaderComponent>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let userNameSubject: Subject<string>;
  let flagSubject: Subject<boolean>;
  let appointmentsFlagSubject: Subject<boolean>;
  let claimantIdSubject: Subject<string>;
  let caseIdSubject: Subject<string>;

  beforeEach(async () => {
    // Create subjects for each observable
    userNameSubject = new Subject<string>();
    flagSubject = new Subject<boolean>();
    appointmentsFlagSubject = new Subject<boolean>();
    claimantIdSubject = new Subject<string>();
    caseIdSubject = new Subject<string>();

    // Create a mock for the CommonService with all required observables
    mockCommonService = jasmine.createSpyObj('CommonService', [
      'userName$',
      'currentFlag',
      'currentAppointmentsFlag',
      'claimantIdSubject$',
      'caseIdSubject$',
      'getReferrerUrl'
    ], {
      userName$: userNameSubject.asObservable(),
      currentFlag: flagSubject.asObservable(),
      currentAppointmentsFlag: appointmentsFlagSubject.asObservable(),
      claimantIdSubject$: claimantIdSubject.asObservable(),
      caseIdSubject$: caseIdSubject.asObservable()
    });

    // Mock getReferrerUrl to return a test URL
    mockCommonService.getReferrerUrl.and.returnValue('https://test-referrer.com');

    await TestBed.configureTestingModule({
      declarations: [ QtcHeaderComponent ],
      providers: [
        { provide: CommonService, useValue: mockCommonService }
      ]
    }).compileComponents();

    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QtcHeaderComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    // Complete all subjects
    userNameSubject.complete();
    flagSubject.complete();
    appointmentsFlagSubject.complete();
    claimantIdSubject.complete();
    caseIdSubject.complete();
    // Clear sessionStorage after each test
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('CommonService subscriptions', () => {
    it('should update userName in uppercase when userName$ emits', fakeAsync(() => {
      fixture.detectChanges(); // Trigger initial subscription
      
      userNameSubject.next('test user');
      tick();
      
      expect(component.userName).toBe('TEST USER');
    }));

    it('should update notesRequired when currentFlag emits', fakeAsync(() => {
      fixture.detectChanges();
      
      flagSubject.next(true);
      tick();
      
      expect(component.notesRequired).toBeTrue();
      
      flagSubject.next(false);
      tick();
      
      expect(component.notesRequired).toBeFalse();
    }));

    it('should update appointmentsIconRequired when currentAppointmentsFlag emits', fakeAsync(() => {
      fixture.detectChanges();
      
      appointmentsFlagSubject.next(true);
      tick();
      
      expect(component.appointmentsIconRequired).toBeTrue();
      
      appointmentsFlagSubject.next(false);
      tick();
      
      expect(component.appointmentsIconRequired).toBeFalse();
    }));

    it('should update claimantId when claimantIdSubject$ emits', fakeAsync(() => {
      fixture.detectChanges();
      
      claimantIdSubject.next('claimant123');
      tick();
      
      expect(component.claimantId).toBe('claimant123');
    }));

    it('should update caseId when caseIdSubject$ emits', fakeAsync(() => {
      fixture.detectChanges();
      
      caseIdSubject.next('case456');
      tick();
      
      expect(component.caseId).toBe('case456');
    }));
  });

  describe('sessionStorage handling', () => {
    it('should set notesDocumentReferrer in sessionStorage if not present', () => {
      expect(sessionStorage.getItem('notesDocumentReferrer')).toBeNull();
      
      fixture.detectChanges();
      
      expect(sessionStorage.getItem('notesDocumentReferrer')).toBe('https://test-referrer.com');
      expect(component.externalUrl).toBe('https://test-referrer.com');
      expect(mockCommonService.getReferrerUrl).toHaveBeenCalled();
    });

    it('should not call getReferrerUrl if notesDocumentReferrer exists in sessionStorage', () => {
      sessionStorage.setItem('notesDocumentReferrer', 'existing-value');
      
      fixture.detectChanges();
      
      expect(component.externalUrl).toBe('existing-value');
      expect(mockCommonService.getReferrerUrl).not.toHaveBeenCalled();
    });

    it('should handle empty referrer URL', () => {
      mockCommonService.getReferrerUrl.and.returnValue('');
      
      fixture.detectChanges();
      
      expect(sessionStorage.getItem('notesDocumentReferrer')).toBe('');
      expect(component.externalUrl).toBe('');
    });
  });

  describe('subscription cleanup', () => {
    it('should unsubscribe from all observables on destroy', () => {
      fixture.detectChanges(); // Set up subscriptions
      
      // Spy on subscription unsubscribe methods
      const subscriptions = [
        spyOn(component['userNameSubscription'], 'unsubscribe'),
        spyOn(component['notesFlagSubscription'], 'unsubscribe'),
        spyOn(component['appointmentsFlagSubscription'], 'unsubscribe'),
        spyOn(component['claimantIdSubscription'], 'unsubscribe'),
        spyOn(component['caseIdSubscription'], 'unsubscribe')
      ];
      
      component.ngOnDestroy();
      
      subscriptions.forEach(sub => {
        expect(sub).toHaveBeenCalled();
      });
    });
  });
});
