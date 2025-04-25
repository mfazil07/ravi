import { ComponentFixture, TestBed } from '@angular/core/testing';
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
  let router: Router;

  beforeEach(async () => {
    // Create a mock for the CommonService
    mockCommonService = jasmine.createSpyObj('CommonService', ['userName$']);
    
    // Configure the mock to return an observable
    mockCommonService.userName$ = of('TestUser');

    // Set up the testing module
    await TestBed.configureTestingModule({
      declarations: [ QtcHeaderComponent ],
      imports: [ 
        ClarityModule,
        RouterTestingModule.withRoutes([]) // Add RouterTestingModule
      ],
      providers: [
        { provide: CommonService, useValue: mockCommonService }
      ]
    })
    .compileComponents();

    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QtcHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display the userName initially from the CommonService', () => {
    expect(component.userName).toBe('TestUser');
    
    const userNameElement = fixture.debugElement.query(By.css('.user-icon-text'));
    expect(userNameElement.nativeElement.textContent).toContain('TestUser');
  });

  describe('router events subscription', () => {
    it('should set claimantLevel to " - APPOINTMENT LEVEL" when navigating to /withAppointment', () => {
      // Simulate NavigationEnd event
      const navEnd = new NavigationEnd(
        1,
        '/withAppointment',
        '/withAppointment'
      );
      (router.events as any).next(navEnd);
      
      expect(component.claimantLevel).toBe(' - APPOINTMENT LEVEL');
    });

    it('should set claimantLevel to " - CASE LEVEL" when navigating to /search', () => {
      // Simulate NavigationEnd event
      const navEnd = new NavigationEnd(
        1,
        '/search',
        '/search'
      );
      (router.events as any).next(navEnd);
      
      expect(component.claimantLevel).toBe(' - CASE LEVEL');
    });

    it('should set claimantLevel to empty string when navigating to /notAuthorized', () => {
      // Simulate NavigationEnd event
      const navEnd = new NavigationEnd(
        1,
        '/notAuthorized',
        '/notAuthorized'
      );
      (router.events as any).next(navEnd);
      
      expect(component.claimantLevel).toBe('');
    });

    it('should not change claimantLevel for other navigation events', () => {
      // Set initial value
      component.claimantLevel = 'Initial Value';
      
      // Simulate a different route
      const navEnd = new NavigationEnd(
        1,
        '/otherRoute',
        '/otherRoute'
      );
      (router.events as any).next(navEnd);
      
      expect(component.claimantLevel).toBe('Initial Value');
    });

    it('should handle urlAfterRedirects when provided', () => {
      // Simulate NavigationEnd event with urlAfterRedirects
      const navEnd = new NavigationEnd(
        1,
        '/original',
        '/withAppointment'
      );
      (router.events as any).next(navEnd);
      
      expect(component.claimantLevel).toBe(' - APPOINTMENT LEVEL');
    });
  });
});
