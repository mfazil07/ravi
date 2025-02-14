import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationSearchFormComponent } from './notification-search-form.component';
import { ClarityModule } from '@clr/angular';
import { FormsModule } from '@angular/forms';

describe('NotificationSearchFormComponent', () => {
  let component: NotificationSearchFormComponent;
  let fixture: ComponentFixture<NotificationSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationSearchFormComponent],
      imports: [ClarityModule, FormsModule],
      providers: []
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('enableSave set to false disables the submit button', () => {
    component.enableSave = false;
    fixture.detectChanges();
    const submitEl = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    expect(submitEl.disabled).toBeTruthy();
  });

  it('enableSave set to true enables the submit button', () => {
    component.enableSave = true;
    fixture.detectChanges();
    const submitEl = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    expect(submitEl.disabled).toBeFalsy();
  });
});
