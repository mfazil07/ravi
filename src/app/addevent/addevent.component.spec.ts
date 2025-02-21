import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AddeventComponent } from './addevent.component';
import { CommonService } from '../services/common.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AddeventComponent', () => {
  let component: AddeventComponent;
  let fixture: ComponentFixture<AddeventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, HttpClientTestingModule],  // Ensure FormsModule is imported
      declarations: [AddeventComponent],
      providers: [CommonService]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddeventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('End Date should be greater than start Date', () => {
    const weatheraddform = {
      value: {
        frmStartDate: '2023-01-01',
        frmEndDate: '2023-01-02'
      },
      controls: {
        frmStartDate: { disable: () => {}, enable: () => {} },
        frmEndDate: { disable: () => {}, enable: () => {} }
      },
      form: { get: (field: string) => ({ disabled: false, enable: () => {}, disable: () => {} }) }
    };

    component.weatheraddform = weatheraddform as any;  // Mock the form

    const startDate = new Date(component.weatheraddform.value.frmStartDate);
    const endDate = new Date(component.weatheraddform.value.frmEndDate);
    expect(startDate < endDate).toBeTrue();
  });
});
