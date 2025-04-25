import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QtcHeaderComponent } from './qtc-header.component';
import { CommonService } from '../services/common.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { ClarityModule } from '@clr/angular';  // Import ClarityModule to use Clarity components

describe('QtcHeaderComponent', () => {
  let component: QtcHeaderComponent;
  let fixture: ComponentFixture<QtcHeaderComponent>;
  let mockCommonService: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    // Create a mock for the CommonService
    mockCommonService = jasmine.createSpyObj('CommonService', ['userName$']);
    
    // Configure the mock to return an observable
    mockCommonService.userName$ = of('TestUser');

    // Set up the testing module
    await TestBed.configureTestingModule({
      declarations: [ QtcHeaderComponent ],
      imports: [ ClarityModule ],  // Add ClarityModule to imports to use clr-dropdown
      providers: [
        { provide: CommonService, useValue: mockCommonService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QtcHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();  // Trigger change detection to update the view
  });

  fit('should display the userName initially from the CommonService', () => {
    // Assert that the userName is correctly initialized
    expect(component.userName).toBe('TestUser');
    
     // Query the element with class "user-icon-text"
    const userNameElement = fixture.debugElement.query(By.css('.user-icon-text'));; // assuming userName is displayed in an <h1> tag
    expect(userNameElement.nativeElement.textContent).toContain('TestUser');  // Check if the text content matches
  });
});



