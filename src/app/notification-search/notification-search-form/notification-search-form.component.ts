import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormControl, NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { KeyValueObject } from '../../dtos/dtos';
import { CommonService } from '../../services/common.service';
import { AlertService, IAlertType } from '../../services/alert.service';

@Component({
  selector: 'notification-search-form',
  templateUrl: './notification-search-form.component.html',
  styleUrl: './notification-search-form.component.css'
})
export class NotificationSearchFormComponent implements OnInit {
  @ViewChild('notificationSearchform') form!: NgForm;
  @Output() onFormUpdate = new EventEmitter()
  enableSave: boolean = false;
  enableMapEvent: boolean = false;
  enableMappedEvent: boolean = false;
  startDateErrorMsgs: string = '';
  endDateErrorMsgs: string = ''; 
  countries: KeyValueObject[] = [];
  states: KeyValueObject[] = [];
  isUSAExist = false;
  claimantResidentState:string ='';
  claimantResidentCountry:string ='';
  prevSelectedStates: KeyValueObject[] = [];
  prevSelectedCountries: KeyValueObject[] = [];
  countriesComboboxData: KeyValueObject[] =[] 

  @Input() set buttonStatus(val: boolean) {
    this.enableSave = val;
  }

  @Input() set claimantState(val:string | undefined) {    
    if (val) {
    this.claimantResidentState = val;    
    }
  }

  @Input() set claimantCountry(val:string | undefined) {
    
    if (val) {
    this.claimantResidentCountry = val;    
    }
  }

  @Input() set triggerRefresh(val: boolean) {
    if (val) {
      this.onFormUpdate.emit({ form: this.form.value, type: 'search' })
    }
  }
    
  @Input() set enableMapping(mapWE: boolean) {
    this.enableMapEvent = mapWE;
    if (!mapWE)
    {
        this.notificationSearch = { ...this.initialFormValue };
        this.notificationSearch.mappedEvents = false;
    }
  }
  showButton: boolean = true;
  @Input() set caseStatus(status: string | undefined) {
    if (status === 'CLOSED') {
      this.showButton = false;
    }
  }

  constructor(private readonly commonService: CommonService,
    private readonly alertService: AlertService,
  ) { }

  initialFormValue: any = {
    startDate: formatDate(new Date(), 'MM/dd/yyyy', 'EN-US'),
    endDate: formatDate(new Date(), 'MM/dd/yyyy', 'EN-US'),
    location: '',
    mappedEvents: false,
    frmSrchCountry: [],
    frmSrchState: [],
  }
  notificationSearch: any = JSON.parse(JSON.stringify(this.initialFormValue)); 

  ngOnInit(): void {
 //get countries
 this.commonService.getallCountries().subscribe({
  next: (data) => {
    this.countries = [...data]
    if(this.claimantResidentCountry.length > 0)
     {
       
        this.countriesComboboxData.push({
          key: this.claimantResidentCountry,
          value: this.countries?.find(x => x?.key == this.claimantResidentCountry)?.value ?? '',
        })         
        this.notificationSearch.frmSrchCountry = this.countriesComboboxData;
        if (this.prevSelectedCountries.length === 0) {

          this.prevSelectedCountries = this.countriesComboboxData?.map(x => Object.assign({}, x)).filter((y) => y !== undefined) ?? [];
        }
      }

      const indexUSA = this.countriesComboboxData?.findIndex(x => x.key.trim() === 'USA');
      if (indexUSA > -1) {
        this.isUSAExist = true;
      }
      else {
        this.isUSAExist = false;
      }
  },
  error: (error: HttpErrorResponse) => {
    this.handleError(error);
  }
});

//get states
this.commonService.getUsStates().subscribe({
  next: (data) => {
    this.states = [...data]
    if(this.claimantResidentState.length > 0 && this.claimantResidentCountry ==='USA')
      {
        this.notificationSearch.frmSrchState =[{ key: this.claimantResidentState, value: this.claimantResidentState }]
        this.prevSelectedStates = [{ key: this.claimantResidentState, value: this.claimantResidentState }]
      }
  },
  error: (error: HttpErrorResponse) => {
    this.handleError(error);
  }
});

    if (!this.showButton) {
      this.notificationSearch.mappedEvents = true;
    }

    if(this.claimantResidentState.length > 0)
    {
      this.notificationSearch.frmSrchState =[{ key: this.claimantResidentState, value: this.claimantResidentState }]
    }    
      this.countryChanged();
  }

   // Method to check if a state is already selected in the form
   getAvailableStates(): KeyValueObject[] {
    if (!this.notificationSearch.frmSrchState) return this.states;

    return this.states.filter(state => {
      return !this.notificationSearch.frmSrchState.some((selectedState: KeyValueObject) => selectedState.key === state.key);
    });
  }


  // Method to check if a country is already selected in the form
  getAvailableCountries(): KeyValueObject[] {
    if (!this.notificationSearch.frmSrchCountry) return this.countries;

    return this.countries.filter(country => {
      return !this.notificationSearch.frmSrchCountry.some((selectedCountry: KeyValueObject) => selectedCountry.key === country.key);
    });
  }

  countryChanged() {
    this.isUSAExist = false;
    if (this.notificationSearch.frmSrchCountry && this.notificationSearch.frmSrchCountry.length) {
      if (this.notificationSearch.frmSrchCountry.find((it: KeyValueObject) => it.key === 'USA')) {
        this.isUSAExist = true;
      }
    }
    if (!this.isUSAExist) {
      this.notificationSearch.frmSrchState = [];
    }   
  } 


  checkCountries(values: any) {    
    if (!values || (values && values.length < this.prevSelectedCountries.length)) {
      const selectedcountries = JSON.parse(JSON.stringify(this.prevSelectedCountries));
      this.notificationSearch.frmSrchCountry = selectedcountries;
      values =selectedcountries
    }
    this.isUSAExist = false;
    if (values && values.length) {
      if (values.find((it: any) => it.key.trim() === 'USA')) {
        this.isUSAExist = true;
      }
    }
    if (!this.isUSAExist) {
      this.notificationSearch.frmSrchState = [];
    }
  }

  checkStates(values: any) {
     
    if (!values || (values && values.length < this.prevSelectedStates.length)) {
      const selectedStates = JSON.parse(JSON.stringify(this.prevSelectedStates));
      this.notificationSearch.frmSrchState = selectedStates;
    }

  }

  getCountryClass(selected: any) {
    const isExist = this.prevSelectedCountries.find(it => it.value.trim() === selected.trim());
      if (isExist) {
        const ariaLabel = `[aria-label="Delete selected option ${selected}"]`
        let element = document.querySelector(ariaLabel);
        if (element)
        {
          (element as any).hidden = true;
        }

        return 'disabled'
      }
      return null;  
  }


  getClass(selected: any) {
    const isExist = this.prevSelectedStates.find(it => it.key === selected);   
      if (isExist) {
        const ariaLabel = `[aria-label="Delete selected option ${selected}"]`
        let element = document.querySelector(ariaLabel);
        if (element)
          {
            (element as any).hidden = true;
          }
  
          return 'disabled'
      }  
     return null;
  }

  // Handle form submit
  onSubmit(_form: any) {
    this.onFormUpdate.emit({ form: _form.value, type: 'save' })
  }

  //  search form 
  onSearch(_form: any) {
    // Call the api to save the content
    if (_form.valid) {
      this.onFormUpdate.emit({ form: _form.value, type: 'search' })
    }
  }

  //  search form 
  onReset(_form: any) {    
    // Reset the form to default state     
    this.notificationSearch = { ...this.initialFormValue };
   
    this.notificationSearch.frmSrchState = [];
    this.notificationSearch.frmSrchState = [{ key: this.claimantResidentState, value: this.claimantResidentState }]
    const frmSrchCountryControl:FormControl = _form.form.get('frmSrchCountry') as FormControl;
    frmSrchCountryControl.setValue([...this.prevSelectedCountries]);

    
    const isExist = this.prevSelectedCountries.find(it => it.key.trim() === 'USA');
    if (isExist){
    const frmSrchStateControl:FormControl = _form.form.get('frmSrchState') as FormControl;
    frmSrchStateControl.setValue([{ key: this.claimantResidentState, value: this.claimantResidentState }]);
  }

    _form.form.markAsPristine();
    _form.form.markAsUntouched();
    _form.form.updateValueAndValidity();
    this.onFormUpdate.emit({ form: _form.value, type: 'reset' })
  }

  onmappedEventsBox(_form: any) {   
    if (this.notificationSearch.mappedEvents) {
      this.notificationSearch.startDate = '';
      this.notificationSearch.endDate = '';
      this.notificationSearch.location = '';
      this.notificationSearch.frmSrchCountry =[];
      this.notificationSearch.frmSrchState =[];
      this.onFormUpdate.emit({ form: _form.value, type: 'search' })
    }
    else {
      this.onReset(_form);
    }
  }

  // Trigger the close event, it can be redirect also

  closeForm() {
    window.close();
  }

  

  // ** Date validation logic
  validateDates(form: NgForm, controlName: string) {

    const startDateControl = form.controls['startDatepickrnm'];
    const endDateControl = form.controls['endDatepickrnm'];

    startDateControl.setErrors(null);
    endDateControl.setErrors(null);

    this.startDateErrorMsgs = '';
    this.endDateErrorMsgs = '';

    if (this.notificationSearch.startDate === null || this.notificationSearch.startDate == '') {
      startDateControl.setErrors({ invalidDate: true });
      this.startDateErrorMsgs = 'Start Date is required!';
    }
    if (this.notificationSearch.endDate === null || this.notificationSearch.endDate == '') {
      endDateControl.setErrors({ invalidDate: true });
      this.endDateErrorMsgs = 'End Date is required!';
    }

    if (this.notificationSearch.startDate && this.notificationSearch.endDate) {
      const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
      const isValidStartDate = dateRegex.test(this.notificationSearch.startDate);
      const isValidEndDate = dateRegex.test(this.notificationSearch.endDate);

      const startDate = new Date(this.notificationSearch.startDate).getTime();
      const endDate = new Date(this.notificationSearch.endDate).getTime();

      if (!isValidStartDate) {
        startDateControl.setErrors({ invalidDate: true });
        this.startDateErrorMsgs = 'Invalid date!';
      }

      if (!isValidEndDate) {
        endDateControl.setErrors({ invalidDate: true });
        this.endDateErrorMsgs = 'Invalid date!';
      }

      // Set custom error if the start date is after the end date

      if (startDate > endDate && (isValidStartDate && isValidEndDate)) {

        if (controlName === 'startDate') {
          endDateControl.setErrors({ invalidDate: true });
          this.endDateErrorMsgs = 'End Date must be greater than Start Date!';
        }

        if (controlName === 'endDate') {
          startDateControl.setErrors({ invalidDate: true });
          this.startDateErrorMsgs = 'Start Date must be less than End Date!';
        }
      }
    }
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
  
      this.alertService.show({ message: errMsg, clrAlertType: IAlertType.DANGER });
    }
}
