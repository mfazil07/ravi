import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { QtcHeaderComponent } from './qtc-header.component';
import { CommonService } from '../services/common.service';
import { of, Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { ClarityModule } from '@clr/angular';
import { Router, NavigationEnd, NavigationStart, Event } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('QtcHeaderComponent', () => {
  let component: QtcHeaderComponent;
  let fixture: ComponentFixture<QtcHeaderComponent>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let router: Router;
  let mockEvents: Subject<Event>;

  beforeEach(async () => {
    // Create a mock for the CommonService
    mockCommonService = jasmine.createSpyObj('CommonService', ['userName$']);
    mockCommonService.userName$ = of('TestUser');

    // Create a subject to mock router events
    mockEvents = new Subject<Event>();

    await TestBed.configureTestingModule({
      declarations: [ QtcHeaderComponent ],
      imports: [ 
        ClarityModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: CommonService, useValue: mockCommonService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    // Replace the router events with our mock
    spyOnProperty(router, 'events').and.returnValue(mockEvents.asObservable());
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QtcHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockEvents.complete();
  });

  it('should display the userName initially from the CommonService', () => {
    expect(component.userName).toBe('TestUser');
    const userNameElement = fixture.debugElement.query(By.css('.user-icon-text'));
    expect(userNameElement.nativeElement.textContent).toContain('TestUser');
  });

  describe('router events subscription', () => {
    it('should set claimantLevel based on NavigationEnd events', fakeAsync(() => {
      // Test /withAppointment route
      mockEvents.next(new NavigationEnd(1, '/withAppointment', '/withAppointment'));
      tick();
      expect(component.claimantLevel).toBe(' - APPOINTMENT LEVEL');

      // Test /search route
      mockEvents.next(new NavigationEnd(2, '/search', '/search'));
      tick();
      expect(component.claimantLevel).toBe(' - CASE LEVEL');

      // Test /notAuthorized route
      mockEvents.next(new NavigationEnd(3, '/notAuthorized', '/notAuthorized'));
      tick();
      expect(component.claimantLevel).toBe('');

      // Test urlAfterRedirects
      mockEvents.next(new NavigationEnd(4, '/original', '/withAppointment'));
      tick();
      expect(component.claimantLevel).toBe(' - APPOINTMENT LEVEL');
    }));

    it('should ignore non-NavigationEnd events', fakeAsync(() => {
      component.claimantLevel = 'Initial Value';
      mockEvents.next(new NavigationStart(1, '/some-url'));
      tick();
      expect(component.claimantLevel).toBe('Initial Value');
    }));

    it('should handle undefined urlAfterRedirects', fakeAsync(() => {
      const navEnd = new NavigationEnd(1, '/withAppointment', undefined);
      mockEvents.next(navEnd);
      tick();
      expect(component.claimantLevel).toBe(' - APPOINTMENT LEVEL');
    }));

    it('should not change claimantLevel for unrelated routes', fakeAsync(() => {
      component.claimantLevel = 'Initial Value';
      mockEvents.next(new NavigationEnd(1, '/other-route', '/other-route'));
      tick();
      expect(component.claimantLevel).toBe('Initial Value');
    }));
  });
});
