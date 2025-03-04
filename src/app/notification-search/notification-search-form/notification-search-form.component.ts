import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SearchForm } from '../../models/notification';
import { NgForm } from '@angular/forms';
import { Country } from '../../dtos/dtos';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonService } from '../../services/common.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'notification-search-form',
  templateUrl: './notification-search-form.component.html',
  styleUrls: ['./notification-search-form.component.css']
})
export class NotificationSearchFormComponent implements OnInit {

  countries: Country[] = [
    { countryName: 'United States of America', countryCode: 'usa' },
    { countryName: 'India', countryCode: 'in' }
  ];

  states: Array<any> = [
    { name: 'Alaska', value: 'al' },
    { name: 'Alaska1', value: 'al1' },
    { name: 'Alaska2', value: 'al2' }
  ];

  @ViewChild('notificationSearchform') form!: NgForm;
  @Output() onFormUpdate = new EventEmitter();
  @Input() set buttonStatus(val: boolean) {
    this.enableSave = val;
  }
  @Input() set triggerRefresh(val: boolean) {
    if (val) {
      this.onFormUpdate.emit({ form: this.form.value, type: 'search' });
    }
  }

  enableSave: boolean = false;
  notificationSearch: SearchForm = {
    startDate: '',
    endDate: '',
    location: '',
    country: '', // Add country to the form model
    state: ''    // Add state to the form model
  };

  selectedCountry: any; // Track selected country

  constructor(private readonly commonService: CommonService,
    private readonly alertService: AlertService
  ) {

  }

  ngOnInit(): void {
     //get countries
     this.commonService.getallCountries().subscribe({
      next: (data) => {
        this.countries = [...data]
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error);
      }
    });

    //get states
    this.commonService.getUsStates().subscribe({
      next: (data) => {
        this.states = [...data]
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error);
      }
    });
  }

  handleError(err: HttpErrorResponse) {
    let errMsg = "";

    switch (err.status) {
      case 500:
      case 503:
        errMsg = 'Weather event list not fetched : contact administrator';
        break;

      case 401:
        errMsg = 'Unauthorized : You are not authorized to perform this action.';
        break;

      default:
        errMsg = err.error;
    }

    // this.alertService.show({ message: errMsg, clrAlertType: IAlertType.DANGER });
  }

  // Handle form submit
  onSubmit(_form: any) {
    if (_form.valid) {
      this.onFormUpdate.emit({ form: _form.value, type: 'save' })
    }
  }

  // Save search form 
  onSearch(_form: any) {
    if (_form.valid) {
      this.onFormUpdate.emit({ form: _form.value, type: 'search' })
    }
  }
  save() {
    this.enableSave = false;
  }
  log(r: any) {
    console.log('Log in search form', r)
  }

  // Trigger the close event, it can be redirect also
  closeForm() {
    console.log("close event triggered")
  }

  validateDates(form: NgForm) {
    const startDateControl = form.controls['startDatepickrnm'];
    const endDateControl = form.controls['endDatepickrnm'];

    if (this.notificationSearch.startDate && this.notificationSearch.endDate) {
      const startDate = new Date(this.notificationSearch.startDate).getTime();
      const endDate = new Date(this.notificationSearch.endDate).getTime();
      // Set custom error if the start date is after the end date
      if (startDate > endDate) {
        endDateControl.setErrors({ invalidDate: true });
        startDateControl.setErrors({ invalidDate: true });
      } else {
        // Clear the error if validation passes
        endDateControl.setErrors(null);
      }
    }
  }

  // Track country selection
  onCountryChange(selectedCountry: any) {
    this.selectedCountry = selectedCountry;
    console.log("selected country", selectedCountry);
    this.notificationSearch.state = ''; // Reset state when country changes
  }

  get isCountrySelected():boolean {
    if(this.selectedCountry?.length) {
      let countrycodes = this.selectedCountry.map((c: any)=> {return c?.countryCode});
      return !!countrycodes.includes('usa');
    }
    return false;
  }

  ngAfterViewInit() {
    // Listen for changes in the entire form
    this.form.valueChanges?.subscribe((value) => {
      Object.keys(value).forEach((formItem: string) => {
        if (value[formItem] !== '') {
          // this.enableSave = true
        }
      });
    });
  }
}
