import { Component, ViewChild } from '@angular/core';
import { Country, WeatherType } from '../dtos/dtos';
import { CommonService } from '../services/common.service';
import { AddeventComponent } from '../addevent/addevent.component';
import { Result } from '../models/commonmodels';
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  @ViewChild(AddeventComponent) addevent!: AddeventComponent;
  states: Array<any> = [{ name: 'Alaska', value: 'al' }, { name: 'Alaska1', value: 'al1' }, { name: 'Alaska2', value: 'al2' }];
  isUSAExist = false;
  countries: Country[] = [{ countryName: 'United States of America', countryCode: 'usa' }, { countryName: 'India', countryCode: 'in' }];
  initialFormValue: any = {
    country: this.countries.filter(it => it.countryCode === 'usa'),
    frmSrchCountry: [{ countryName: 'United States of America', countryCode: 'usa' }],
    frmSrchWeatherType: '',
    frmSrchStDt: '01/02/2015',
    frmSrchEndDt: '',
    frmSrchLocation: '',
  }
  weatherEvents = [{
    'startDate': 1728561703122,
    WeatherAlertID: '007',
    'endDate': 1733952000000,
    'weatherEvent': 'Winter Storm Nancy',
    'weatherType': 'Severe winter', 'description': 'Truecaller finally adds live caller ID on iPhones: How to enable the feature', 'location': 'West to East', 'country': 'USA'
  }]
  //weatherEvents: WeatherEvent[]=[];

  weatherTypes: WeatherType[] = [];
  weathersearch: any = JSON.parse(JSON.stringify(this.initialFormValue));
  weatherResult = {} as Result;
  filterEnabled: boolean = true;

  gridData: any = null;
  constructor(private commonService: CommonService) {
    this.filterEnabled = true;
  }
  getUniqueCountries() {
    this.weathersearch.country = Array.from(new Set
      (this.weathersearch.country.map((obj: Country) => obj.countryCode)));
  }
  countryChanged() {
    this.isUSAExist = false;
    if (this.weathersearch.country && this.weathersearch.country.length) {
      this.weathersearch.country.reverse();
      this.weathersearch.country = this.weathersearch.country.
        filter((obj: any, index: number, self: any) => index ===
          self.findIndex((o: Country) => o.countryCode === obj.countryCode)

        );
      this.weathersearch.country.reverse();
      if (this.weathersearch.country.find((it: Country) => it.countryCode === 'usa')) {
        this.isUSAExist = true;
      }
    }
    if (!this.isUSAExist) {
      this.weathersearch.state = [];
    }
    const frmctrl1 = (document.getElementById('clr-form-control-1') as HTMLInputElement);
    if (frmctrl1) {
      frmctrl1.value = "";
    }
  }
  clearSearch(this: any, event: any) {
    (document.getElementById('clr-form-control-14') as HTMLInputElement).value = "";
  }
  editEntry(entry: any) {
    this.commonService.getWeatherEventById(entry.WeatherAlertID) // check what key points to the ID in the event object
      .subscribe({
        next: (response: any) => {
          this.gridData = response; // check what you get in response and set it to this.gridData
          this.openModal('edit')
        },
        error: (error: any) => {
          // Show error message on the toaster
        }
      })

  }

  handleFormClose(event: any) {
    this.gridData = event;
  }

  reset(_form: any): void {
    this.weathersearch = { ...this.initialFormValue };
    _form.form.markAsPristine();
    _form.form.markAsUntouched();
    _form.form.updateValueAndValidity();
    this.weatherEvents = [];
    this.weatherResult = {} as Result;
  }

  ngOnInit() {
    this.commonService.getallCountries().subscribe((results: any) => {
      if (results.succeeded) {
        this.countries = results.data;
      }

    });
    this.commonService.getAllWeatherTypes().subscribe((result: any) => {
      if (result.succeeded) {
        this.weatherTypes = result.data;
      }

    });
    this.countryChanged()
  }
  onSubmit(_form: any): void {
    const formValue = _form.value; // use this value to pass to the  service and get data
    this.commonService.getallWeatherEvents().subscribe((result: Result) => {
      this.weatherResult = result;
      this.weatherEvents = result.data;
      this.filterEnabled = true;
    });
  }

  openModal(mode: string): void {
    if (mode === 'add') this.gridData = null;
    this.addevent.openModal(mode);
  }
}