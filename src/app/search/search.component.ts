import { CommonService } from '../services/common.service';
import { ChangeDetectionStrategy, Component, ElementRef, Renderer2, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { WeatherEvent, WeatherEventRequest, KeyValueObject, CountrySaveRequest } from '../dtos/dtos';
import { NgForm, NgModel } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService, IAlertType } from '../services/alert.service';
import { formatDate } from '@angular/common';
import { SearchComponent } from '../search/search.component';
import { ConfirmDialogService } from '../services/confirm-dialog.service';


@Component({
  selector: 'app-addevent',
  templateUrl: './addevent.component.html',
  styleUrl: './addevent.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddeventComponent implements OnInit {

  @ViewChild('weatheraddform') weatheraddform!: NgForm;
  @ViewChild('addEventCountryComboBox', { static: false }) addEventCountryComboBoxRef!: ElementRef;
  @ViewChild('addEventStateComboBox', { static: false }) addEventStateComboBoxRef!: ElementRef;

  @Input() set formData(value: any) {

    this.prevSelectedStates = [];
    this.prevSelectedCountries = [];
    if (value) {
      let countriesValue: CountrySaveRequest[] = value?.countries;
      this.unsavedChanges = false;
      this.eventType = 'Edit '

      let statesComboboxData: KeyValueObject[] | undefined = countriesValue?.find(x => x?.country.trim() === 'USA')?.usStates.map((item: any) => ({
        key: item,
        value: item,
      }));


      let countriesComboboxData: KeyValueObject[] | undefined = countriesValue.map((item: any) => ({
        key: item.country.trim(),
        value: this.countries?.find(x => x?.key == item.country)?.value ?? '',
      })).filter((y) => y !== undefined) ?? [];

      this.weatherAdd = {
        frmVaCode: value.vA_WeatherEvent_Code,
        frmWeatherEvent: value.name,
        frmReasons: value.weather_Reason_Code,
        frmOtherDescription: value.reason,
        frmCountry: countriesComboboxData,
        frmState: statesComboboxData,
        frmLocation: value.location,
        frmStartDate: formatDate(new Date(value.startDate), 'yyyy-MM-dd', 'EN-US'),
        frmEndDate: formatDate(new Date(value.endDate), 'yyyy-MM-dd', 'EN-US'),
        frmDescription: value.description,
        frmWeatherAlertId: value.weather_Event_Id,
        isMapped: value.isMapped !== undefined ? value.isMapped : 0,
        eventStatus: value.eventStatus,
      }
      this.initialValues = JSON.parse(JSON.stringify(this.weatherAdd));

      if (this.prevSelectedStates.length === 0 && this.weatherAdd.isMapped) {
        this.prevSelectedStates = statesComboboxData?.map(x => Object.assign({}, x)).filter((y) => y !== undefined) ?? [];
      }

      if (this.prevSelectedCountries.length === 0 && this.weatherAdd.isMapped) {

        this.prevSelectedCountries = countriesComboboxData?.map(x => Object.assign({}, x)).filter((y) => y !== undefined) ?? [];
      }

      const indexUSA = countriesComboboxData?.findIndex(x => x.key.trim() === 'USA');
      if (indexUSA > -1) {
        this.isUSAExist = true;
      }
      else {
        this.isUSAExist = false;
      }

      if (this.weatherAdd.isMapped) {
        this.disableFields();
      }
      else {
        this.enableFields();
      }
      this.minEndDate = this.todayDate;
      this.minStartDate = this.todayDate;
      this.maxStartDate = '';

      if (this.eventType === 'Edit ' && this.weatherAdd.isMapped) {
        this.weatheraddform.form.get('frmStartDate')?.enable();
        let resultStartDate = new Date(value.startDate);
        let resultEndDate = new Date(value.endDate);

        if (this.weatherAdd.eventStatus === 'Past') {
          this.weatheraddform.form.get('frmStartDate')?.disable();
          resultStartDate.setDate(resultEndDate.getDate());
          this.minEndDate = formatDate(resultEndDate, 'yyyy-MM-dd', 'EN-US');
        }
        else if (this.weatherAdd.eventStatus === 'Upcoming' || this.weatherAdd.eventStatus === 'Ongoing') {
          resultStartDate.setDate(resultStartDate.getDate());
          this.maxStartDate = formatDate(resultStartDate, 'yyyy-MM-dd', 'EN-US');
          resultEndDate.setDate(resultEndDate.getDate());
          this.minEndDate = formatDate(resultEndDate, 'yyyy-MM-dd', 'EN-US');
          this.minStartDate = '';
        }
      }

    } else {
      this.eventType = 'New ';
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent) {
    // Custom logic when Escape key is pressed
    this.open = false;
  }

  apiResponse: any;
  weatherEventRequest: any = { frmCountry: "", frmReasons: "" };
  states: KeyValueObject[] = [];
  weatherTypes: KeyValueObject[] = [];
  eventType: string = 'New ';
  countries: KeyValueObject[] = [];
  input: any;
  weatherEvent = {} as WeatherEvent;
  open: boolean = false;
  weatherAdd: any;
  request = {} as WeatherEventRequest;
  isOtherDescriptionRequired: boolean = false;
  isStateDisabled: boolean = false;
  isOtherDisabled: boolean = false;
  todayDate: string = '';
  minEndDate: string = '';
  minStartDate: string = '';
  maxStartDate: string = '';
  prevSelectedStates: KeyValueObject[] = [];
  prevSelectedCountries: KeyValueObject[] = [];
  unsavedChanges: boolean = false;
  initialValues: any = {};
  isUSAExist = false;

  constructor(private readonly commonService: CommonService,
    private readonly confirmDialogService: ConfirmDialogService,
    private readonly alertService: AlertService,
    private readonly searchcomponent: SearchComponent,
    private readonly renderer: Renderer2) {
  }

  ngOnInit(): void {

    this.loadWeatherform();
    this.commonService.getallCountries().subscribe({
      next: (data) => {
        this.countries = [...data]
      },
    });

    this.commonService.getUsStates().subscribe({
      next: (data) => {
        this.states = [...data]
      },
    });

    this.commonService.getAllWeatherTypes().subscribe({
      next: (data) => {
        this.weatherTypes = [...data]
      },
    });

    const today = new Date();
    this.todayDate = today.toLocaleDateString('en-CA');
    this.minStartDate = this.todayDate;
  }

  //method for setting the expiry label
  eventExpire() {
    const endDate = new Date(this.weatherAdd.frmEndDate);
    endDate.setDate(endDate.getDate() + 31);
    const month = endDate.getMonth() + 1; // Months are 0-indexed
    const day = endDate.getDate();
    const year = endDate.getFullYear();

    // Format the date as MM/dd/yyyy with slashes
    return `${month < 10 ? '0' + month : month}/${day < 10 ? '0' + day : day}/${year}`;
  }

  //method for disabling fields if mapped
  disableFields(): void {
    this.weatheraddform.form.get('frmVaCode')?.disable();
    this.weatheraddform.form.get('frmReasons')?.disable();
    this.weatheraddform.form.get('frmOtherDescription')?.disable();
    //this.weatheraddform.form.get('frmCountry')?.disable();
    this.isOtherDisabled = true;
  }

  //method for enabling back the disabled fields
  enableFields(): void {
    this.isOtherDisabled = false;
    this.isStateDisabled = false;
    this.weatheraddform.form.enable();
  }

  // Method to check if a state is already selected in the form
  getAvailableStates(): KeyValueObject[] {
    if (!this.weatherAdd.frmState) return this.states;

    return this.states.filter(state => {
      return !this.weatherAdd.frmState.some((selectedState: KeyValueObject) => selectedState.key === state.key);
    });
  }


  // Method to check if a state is already selected in the form
  getAvailableCountries(): KeyValueObject[] {
    if (!this.weatherAdd.frmCountry) return this.countries;

    return this.countries.filter(country => {
      return !this.weatherAdd.frmCountry.some((selectedCountry: KeyValueObject) => selectedCountry.key === country.key);
    });
  }

  //method for checking the date's entered
  onDateChange(Datefield: NgModel) {

    const controlfrmStartDate = this.weatheraddform.controls['frmStartDate'];
    const controlfrmEndDate = this.weatheraddform.controls['frmEndDate'];

    if (!Datefield?.value) return;
    const selectedDate = Datefield.value;
    const currentDate = formatDate(new Date(), 'yyyy-MM-dd', 'EN-US');

    // Helper function to clear the field and set error
    const setDateError = (error: string) => {
      Datefield.control.markAsTouched();
      Datefield.control.setErrors({ [error]: true });
    };

    if ((this.eventType == 'Add' || this.eventType == 'New ' || (this.eventType == 'Edit ' && !this.weatherAdd.isMapped)) && this.weatherAdd.frmStartDate) {
      // Validate if selected date is in the past

      if (selectedDate < currentDate && Datefield.name === 'frmStartDate') {
        setDateError('invalidDate');
        return;
      }
      this.maxStartDate = '';
      //this.minEndDate = '';
      //this.minStartDate = '';
      this.minStartDate = this.todayDate;
      this.minEndDate = this.weatherAdd.frmStartDate;
    }


    if (this.weatherAdd.isMapped && this.eventType == 'Edit ') {
      if (this.weatherAdd.eventStatus === 'Upcoming' || this.weatherAdd.eventStatus === 'Ongoing') {

        if (this.weatherAdd.frmStartDate && Datefield.name === 'frmStartDate' && selectedDate > this.maxStartDate) {
          setDateError('invalidMaxEndDate');
          return;
        }
      }
      if (this.weatherAdd.frmEndDate && Datefield.name === 'frmEndDate' && selectedDate < this.minEndDate) {
        setDateError('invalidMinEndDate');
        return;
      }
    }

    controlfrmEndDate.setErrors({ ['invalidEndDate']: false });
    controlfrmStartDate.setErrors({ ['invalidStartDate']: false });

    // Validate if End Date is after Start Date
    if (this.weatherAdd.frmStartDate && Datefield.name === 'frmEndDate' && selectedDate < this.weatherAdd.frmStartDate) {
      setDateError('invalidEndDate');
      return;
    }
    else if ((this.weatherAdd.frmEndDate === null||this.weatherAdd.frmEndDate === undefined||this.weatherAdd.frmEndDate === "" ) && this.weatherAdd.frmStartDate && Datefield.name === 'frmStartDate') {
      controlfrmEndDate.setErrors({ required: true });
      return;
    }

    // Validate if Start Date is before End Date
    if (this.weatherAdd.frmEndDate && Datefield.name === 'frmStartDate' && selectedDate > this.weatherAdd.frmEndDate) {
      setDateError('invalidStartDate');
      return;
    }

    // No errors, clear any previous errors
    Datefield.control.setErrors(null);
    controlfrmEndDate.setErrors(null);
    controlfrmStartDate.setErrors(null);
  }

  setOtherReasonValidation(event: any) {
    const { value } = event.target;
    this.isOtherDescriptionRequired = value === 'WEATHER008';
  }

  openModal(mode = 'add'): void {
    this.open = true;
    this.eventType = mode === 'add' ? 'Add' : 'Edit'
    this.weatherAdd.frmWeatherAlertId = mode === 'add' ? 0 : this.weatherAdd.frmWeatherAlertId

    if (mode === 'add') {
      this.maxStartDate = '';
      this.minEndDate = '';
      this.minStartDate = this.todayDate;
      this.prevSelectedStates = [];
      this.prevSelectedCountries = [];
      this.enableFields();
      this.weatheraddform.resetForm();
    }
  }

  checkCountries(values: any) {
    this.onInputChange();
    if (!values || (values && values.length < this.prevSelectedCountries.length)) {
      const selectedcountries = JSON.parse(JSON.stringify(this.prevSelectedCountries));
      this.weatherAdd.frmCountry = selectedcountries;
      values = selectedcountries
    }
    this.isUSAExist = false;
    if (values && values.length) {
      if (values.find((it: any) => it.key.trim() === 'USA')) {
        this.isUSAExist = true;
      }
    }
    if (!this.isUSAExist) {
      this.weatherAdd.frmState = [];
    }
  }

  checkStates(values: any) {
    this.onInputChange(); // function calling to check
    if (!values || (values && values.length < this.prevSelectedStates.length)) {
      const selectedStates = JSON.parse(JSON.stringify(this.prevSelectedStates));
      this.weatherAdd.frmState = selectedStates;
    }

  }

  loadWeatherform() {
    this.weatherAdd = {
      frmVaCode: '',
      frmWeatherEvent: '',
      frmReasons: '',
      frmCountry: '',
      frmLocation: '',
      frmStartDate: '',
      frmEndDate: '',
      frmDescription: '',
      frmOtherDescription: '',
      frmState: '',
    };
  }

  closeModal(): void {
    this.open = false;
    this.weatherAdd.frmWeatherAlertId = 0;
  }

  resetForm(form: any): void {
    form.reset();
    this.open = false;
  }

  // This function will be called when any change happens
  onInputChange() {
    this.unsavedChanges = JSON.stringify(this.weatherAdd) !== JSON.stringify(this.initialValues);
  }

  // Show confirmation dialog if unsaved changes
  async openConfirmationDialog(form: any) {
    if (this.unsavedChanges && this.eventType === 'Edit ') {
      const confirmation = await this.confirmDialogService.confirm('You are about to close the "Edit Weather Event" entry window. Are you sure you want to continue? ', 'Yes', 'No');
      if (confirmation) {
        form.reset();
        this.open = false;
        this.unsavedChanges = false;
      }
    } else {
      form.reset();
      this.closeModal();
    }
  }

  onSubmit(weatheraddform: any): void {
    weatheraddform.control.markAllAsTouched();  // Manually trigger validation

    //enabling the disabled field to sent date on submit(else it will not send disabled fields)
    if (this.weatheraddform.form.get('frmVaCode')?.disabled) {
      this.weatheraddform.form.get('frmVaCode')?.enable();
    }
    if (this.weatheraddform.form.get('frmCountry')?.disabled) {
      this.weatheraddform.form.get('frmCountry')?.enable();
    }
    if (this.isStateDisabled) {
      this.weatheraddform.form.get('frmState')?.enable();
    }
    if (this.weatheraddform.form.get('frmReasons')?.disabled) {
      this.weatheraddform.form.get('frmReasons')?.enable();
    }
    if (this.weatheraddform.form.get('frmOtherDescription')?.disabled) {
      this.weatheraddform.form.get('frmOtherDescription')?.enable();
    }
    if (this.weatheraddform.form.get('frmStartDate')?.disabled) {
      this.weatheraddform.form.get('frmStartDate')?.enable();
    }
    if (this.weatheraddform.form.get('frmEndDate')?.disabled) {
      this.weatheraddform.form.get('frmEndDate')?.enable();
    }

    if (weatheraddform.valid) {
      this.open = false;
      let myStateArray: string[] = [];
      let myCountriesStateArray: CountrySaveRequest[] = []
      this.request.WeatherAlertID = this.weatherAdd.frmWeatherAlertId;
      this.request.vaCode = weatheraddform.value.frmVaCode;
      this.request.weatherAlertName = weatheraddform.value.frmWeatherEvent;
      this.request.weatherType = weatheraddform.value.frmReasons;
      this.request.otherReason = weatheraddform.value.frmOtherDescription;
      this.request.country = weatheraddform.value.frmCountry;
      this.request.states = weatheraddform.value.frmState;

      for (let country of this.request.country) {
        if (country.key.toLowerCase() === 'usa') {
          for (let state of this.request.states) {
            myStateArray.push(state?.key);
          }
        }
        else {
          myStateArray = []
        }
        myCountriesStateArray.push({ country: country.key, usStates: myStateArray });
        myStateArray = []
      }

      this.request.statesArray = myStateArray;
      this.request.countriesArray = myCountriesStateArray
      this.request.location = weatheraddform.value.frmLocation;
      this.request.startDate = weatheraddform.value.frmStartDate;
      this.request.endDate = weatheraddform.value.frmEndDate;
      this.request.description = weatheraddform.value.frmDescription;
      this.commonService.addWeatherEvent(this.request).subscribe({
        next: (data) => {
          this.apiResponse = data;
          let successMessage = this.eventType === 'Edit ' ? 'Updated successfully!' : 'Added successfully!';
          this.alertService.show({ message: successMessage, clrAlertType: IAlertType.SUCCESS });
          this.searchcomponent.refreshWeatherEvents();
          this.weatherAdd.resetForm();
          this.resetForm(weatheraddform);
        },
        error: (error: HttpErrorResponse) => {
          weatheraddform.reset();
          this.handleSaveError(error);
        },
      });
    }
  }

  handleSaveError(err: HttpErrorResponse): void {
    if (err.status === 500 || err.status === 503) {
      this.alertService.show({
        message: 'Failed to Add weather alert',
        clrAlertType: IAlertType.DANGER,
      });
    } else if (err.status === 401) {
      this.alertService.show({
        message: 'Unauthorized: You are not authorized to perform this action.',
        clrAlertType: IAlertType.DANGER,
      });
    }
    else if (err.status === 400) {
      let errMsg = err.error;
      if (!errMsg || errMsg == '') {
        errMsg = 'Failed to Add weather alert';
      }
      this.alertService.show({
        message: errMsg,
        clrAlertType: IAlertType.DANGER,
      });
    }
    else {
      // Handle any other unexpected errors
      this.alertService.show({
        message: 'An unexpected error occurred. Please try again later.',
        clrAlertType: IAlertType.DANGER,
      });
    }
  }

  getCountryClass(selected: any) {
    const isExist = this.prevSelectedCountries.find(it => it.value.trim() === selected.trim());
    setTimeout(() => {
      if (isExist) {
        const ariaLabel = `[aria-label="Delete selected option ${selected}"]`
        let element = this.addEventCountryComboBoxRef.nativeElement.querySelector(ariaLabel);
        if (element)
          this.renderer.setAttribute(element, 'hidden', 'true');
      }
      return null;
    }, 5);
    if (isExist) {
      return 'disabled'
    }
    return null;
  }


  getClass(selected: any) {
    const isExist = this.prevSelectedStates.find(it => it.key === selected);
    setTimeout(() => {
      if (isExist) {
        const ariaLabel = `[aria-label="Delete selected option ${selected}"]`
        let element = this.addEventStateComboBoxRef.nativeElement.querySelector(ariaLabel);
        if (element)
          this.renderer.setAttribute(element, 'hidden', 'true');
      }
      return null;
    }, 5);
    if (isExist) {
      return 'disabled'
    }
    return null;
  }


  handleError(err: HttpErrorResponse): void {

    let errMessage = "";

    switch (err.status) {
      case 500:
      case 503:
        errMessage = 'Weather event list not fetched: contact administrator';
        break;

      case 401:
        errMessage = 'Unauthorized: You are not authorized to perform this action.';
        break;

      default:
        errMessage = (!err.error || err.error == '') ? 'Failed to Add weather alert' : err.error;
    }

    this.alertService.show({
      message: errMessage,
      clrAlertType: IAlertType.DANGER,
    });
  }
}
