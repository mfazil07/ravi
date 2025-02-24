import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationSearchResultComponent } from './notification-search-result.component';
import { ClrComboboxModule, ClrDatagridModule, ClrDatalistModule, ClrDataModule, ClrDatepickerModule, ClrInputModule, ClrModalModule } from '@clr/angular';
import { By } from '@angular/platform-browser';
describe('NotificationSearchResultComponent', () => {
  let component: NotificationSearchResultComponent;
  let fixture: ComponentFixture<NotificationSearchResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationSearchResultComponent],
      imports: [
        ClrComboboxModule,
        ClrDatalistModule,
        ClrDatepickerModule,
        ClrInputModule,
        ClrDatagridModule,
        ClrDataModule,
        ClrModalModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(NotificationSearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should handle pagination correctly', () => {
    component.weatherEventsList = new Array(25).fill({
      weatherEvent: 'Storm',
      weatherType: 'Tropical',
      description: 'Severe tropical storm',
      location: 'Kerala',
      country: 'India',
      state: 'KL',
      eventStartDate: new Date('2025-02-24'),
      eventEndDate: new Date('2025-02-25'),
      status: 'ongoing'
    });
    fixture.detectChanges();

    const pageSizeSelect = fixture.debugElement.query(By.css('clr-dg-page-size'));
    pageSizeSelect.triggerEventHandler('change', { target: { value: '10' } });
    fixture.detectChanges();

    const paginationText = fixture.debugElement.query(By.css('clr-dg-pagination')).nativeElement.innerText;
    expect(paginationText.includes('1 - 10 of 25 elements')).toBe(true);
  });
  it('should render weather events correctly', () => {
    component.weatherEventsList = [
      {
        weatherEvent: 'Storm',
        weatherType: 'Tropical',
        description: 'Severe tropical storm',
        location: 'Kerala',
        country: 'India',
        state: 'KL',
        eventStartDate: '2025-02-24',
        eventEndDate: '2025-02-25',
        status: 'ongoing'
      }
    ];
    fixture.detectChanges();

    const cells = fixture.debugElement.queryAll(By.css('clr-dg-cell'));
    expect(cells.length).toBe(9);
    expect(cells[0].nativeElement.innerText.trim()).toBe('Storm');
    expect(cells[1].nativeElement.innerText.trim()).toBe('Tropical');
    expect(cells[2].nativeElement.innerText.trim()).toBe('Severe tropical storm');
    expect(cells[3].nativeElement.innerText.trim()).toBe('Kerala');
    expect(cells[4].nativeElement.innerText.trim()).toBe('India');
    expect(cells[5].nativeElement.innerText.trim()).toBe('KL');
    expect(cells[6].nativeElement.innerText.trim()).toBe('Feb 24, 2025');
    expect(cells[7].nativeElement.innerText.trim()).toBe('Feb 25, 2025');
    expect(cells[8].nativeElement.innerText.trim()).toBe('Ongoing');
  });

  it('should render grid columns correctly', () => {
    const columnHeaders = [
      'Event Start Date', 'Event End Date', 'Weather Event', 'Weather Type', 'Description', 'Location', 'Country',
      'State', 'Status'
    ];
    const headerElements = fixture.debugElement.queryAll(By.css('clr-dg-column'));
    expect(headerElements.length).toBe(columnHeaders.length);
  });
 
});
