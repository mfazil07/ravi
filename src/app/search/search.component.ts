import { Component, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { WeatherEvent, KeyValueObject } from '../dtos/dtos';
import { CommonService } from '../services/common.service';
import { AddeventComponent } from '../addevent/addevent.component';
import { FormGroup } from '@angular/forms';
import { Result } from '../models/commonmodels';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmDialogService } from '../services/confirm-dialog.service';
import { AlertService, IAlertType } from '../services/alert.service';
import { formatDate, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit {
  @ViewChild(AddeventComponent) addevent!: AddeventComponent;

  initialFormValue: any = {
    frmSrchCountry: [{ key: 'USA', value: 'UNITED STATES OF AMERICA' }],
    weatherTypenm: '',
    frmSrchStDt: formatDate(new Date(), 'MM/dd/yyyy', 'EN-US'),
    frmSrchEndDt: formatDate(new Date(), 'MM/dd/yyyy', 'EN-US'),
    frmSrchLocation: '',
    frmSrchState: '',
    frmActiveBox: true
  }
  weatherEvents: WeatherEvent[] = [];
  weathersearch: any = JSON.parse(JSON.stringify(this.initialFormValue));;

  apiResponse: any;
  countries: KeyValueObject[] = [];
  states: KeyValueObject[] = [];
  weatherTypes: KeyValueObject[] = [];
  weathersearchform!: FormGroup;
  weatherResult = {} as Result;
  filterEnabled: boolean = true;
  gridData: any = null;
  disabled: boolean = false;
  userName: string = '';
  userAccess: string[] = [];
  loading = true;
  placeHolderText = "ALL";
  startDateErrorMsgs = '';
  endDateErrorMsgs = '';
  enableSearch = true;
  isUSAExist = false;

  constructor(private readonly commonService: CommonService,
    private readonly confirmDialogService: ConfirmDialogService,
    private readonly alertService: AlertService,
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly location: Location) {

    this.filterEnabled = true;
  }

  ngOnInit() {

    this.route.queryParams.subscribe((params: any) => {

      let _username = params["userName"] ?? params["UserName"];
      if (params && _username !== null && _username !== undefined) {
        sessionStorage.setItem("userName", _username);
        this.userName = _username;
      }
      else if (!params || _username === null || _username === undefined) {
        this.userName = sessionStorage.getItem("userName") ?? "";
      }
      else {
        this.router.navigate(['notAuthorized']);
      }

      // token access from url
      if (params && params['token'] !== null && params['token'] !== undefined) {
        this.commonService.token = params['token'].toString();
        sessionStorage.setItem("token", params['token'].toString());
      }

      this.location.replaceState('');

      if (!params || params['token'] === null || params['token'] === undefined) {
        this.commonService.token = sessionStorage.getItem("token") ?? "";
        this.userName = sessionStorage.getItem("userName") ?? "";
      }
    });

    this.commonService.getUserAuthorization(this.userName).subscribe({
      next: (data) => {
        this.userAccess = data as string[];
        if (!(this.userAccess.includes('ADD') && this.userAccess.includes('MODIFY') && this.userAccess.includes('DELETE') && this.userAccess.includes('READ'))) {
          this.router.navigate(['notAuthorized']);
          this.loading = false;
        }
        this.loading = false;

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
      },
      error: (error: HttpErrorResponse) => {
        this.router.navigate(['notAuthorized']);
        this.loading = false;
      }
    });

    this.countryChanged();

    this.commonService.getAllWeatherTypes().subscribe({
      next: (data) => {
        this.weatherTypes = [...data]
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error);
      }
    });

    this.searchSubmit([{ key: 'USA', value: 'United States of America', }], '', formatDate(new Date(), 'MM/dd/yyyy', 'EN-US'), formatDate(new Date(), 'MM/dd/yyyy', 'EN-US'), '', true, []);
  }

  reset(_form: any): void {
    this.weathersearch = { ...this.initialFormValue };
    this.weathersearch.frmSrchCountry = [];
    this.weathersearch.frmSrchCountry = [{ key: 'USA', value: 'UNITED STATES OF AMERICA' }]
    this.countryChanged();
    this.startDateError = false;
    this.endDateError = false;
    this.enableSearch = true;
    _form.form.markAsPristine();
    _form.form.markAsUntouched();
    _form.form.updateValueAndValidity();
    this.searchSubmit([{ key: 'USA', value: 'United States of America', }], '', formatDate(new Date(), 'MM/dd/yyyy', 'EN-US'), formatDate(new Date(), 'MM/dd/yyyy', 'EN-US'), '', true, []);
  }

  startDateError = false;
  endDateError = false;

  // Check if start date is greater than end date
  checkDates() {
    this.startDateError = false;
    this.endDateError = false;
    this.startDateErrorMsgs = '';
    this.endDateErrorMsgs = '';
    this.enableSearch = true;

    if (this.weathersearch.frmSrchStDt === null || this.weathersearch.frmSrchStDt == '') {
      this.startDateError = true;
      this.startDateErrorMsgs = 'Start Date is required!';
    }
    if (this.weathersearch.frmSrchEndDt === null || this.weathersearch.frmSrchEndDt == '') {
      this.endDateError = true;
      this.endDateErrorMsgs = 'End Date is required!';
    }

    if (this.weathersearch.frmSrchStDt && this.weathersearch.frmSrchEndDt) {
      const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
      const isValidStartDate = dateRegex.test(this.weathersearch.frmSrchStDt);
      const isValidEndDate = dateRegex.test(this.weathersearch.frmSrchEndDt);

      const startDate = new Date(this.weathersearch.frmSrchStDt);
      const endDate = new Date(this.weathersearch.frmSrchEndDt);

      if (!isValidStartDate) {
        this.startDateError = true;
        this.startDateErrorMsgs = 'Invalid date!';
        this.enableSearch = false;
      }

      if (!isValidEndDate) {
        this.endDateError = true;
        this.endDateErrorMsgs = 'Invalid date!';
        this.enableSearch = false;
      }

      if (startDate > endDate && (isValidStartDate && isValidEndDate)) {
        this.startDateError = true;
        this.endDateError = false;
        this.startDateErrorMsgs = 'Start Date must be less than End Date!';
        this.enableSearch = false;
      }
    }
  }

  countryChanged() {
    this.isUSAExist = false;
    if (this.weathersearch.frmSrchCountry && this.weathersearch.frmSrchCountry.length) {
      if (this.weathersearch.frmSrchCountry.find((it: KeyValueObject) => it.key === 'USA')) {
        this.isUSAExist = true;
      }
    }
    if (!this.isUSAExist) {
      this.weathersearch.frmSrchState = [];
    }

    const frmctrl1 = (document.getElementById('clr-form-control-1') as HTMLInputElement);
    if (frmctrl1) {
      frmctrl1.value = "";
    }
  }

   // Method to check if a country is already selected in the form
   getAvailableCountries(): KeyValueObject[] {  
    if (!this.weathersearch.frmSrchCountry) return this.countries;
    return this.countries.filter(country => {
      return !this.weathersearch.frmSrchCountry.some((selectedCountry: KeyValueObject) => selectedCountry.key === country.key);
    });
  }

  clearSearch(this: any, event: any) {
    (document.getElementById('clr-form-control-14') as HTMLInputElement).value = "";
  } 

  onSubmit(_form: any): void {
    this.checkDates();
    if (this.startDateError || this.endDateError) {
      return; // Prevent form submission if dates are invalid
    }
    this.weatherResult.data = null;
    let countryCode: [KeyValueObject] = _form.value.frmSrchCountry ?? [];
    let reasonCode = _form.value.weatherTypenm;
    let startDate = _form.value.startDatepickrnm;
    let endDate = _form.value.endDatepickrnm;
    let location = _form.value.location;
    let states: [KeyValueObject] = _form.value.frmSrchState;
    let status = _form.value.activeBox;
    this.searchSubmit(countryCode, reasonCode, startDate, endDate, location, status, states);
  }

  searchSubmit(countryCode: KeyValueObject[] = [], reasonCode = '', startDate = formatDate(new Date(), 'MM/dd/yyyy', 'EN-US'), endDate = formatDate(new Date(), 'MM/dd/yyyy', 'EN-US'), location = '', status = true, states: KeyValueObject[] = []) {
    this.commonService.getallWeatherEvents(countryCode, reasonCode, startDate, endDate, location, status, states).subscribe({
      next: (result: WeatherEvent[]) => {
        this.weatherEvents = result;
        this.filterEnabled = true;
      },
      error: (error: HttpErrorResponse) => {
        this.weatherEvents = [];
        this.handleError(error);
      }
    });
  }

  openModal(mode: string): void {
    if (mode === 'add') this.gridData = null;
    this.addevent.openModal(mode);
  }

  checkIsActiveWeatherEvent(weatherEvent: any): boolean {
    return this.disabled = (weatherEvent && weatherEvent.isMapped);
  }

  /*Purpose: Deleting a weather event through API call
  Parameters: Weather Event ID and Usernameid*/
  async onDelete(_data: any) {
    if (this.checkIsActiveWeatherEvent(_data)) return;
    if (_data && Object.keys(_data)?.length) {
      const confirmed = await this.confirmDialogService.confirm('Are you sure you want to delete the weather alert?', 'Ok', 'Cancel');
      if (confirmed) {
        this.commonService.deleteWeatherAlert(_data.weatherAlertID).subscribe({
          next: (data) => {
            this.apiResponse = data;
            this.alertService.show({ message: 'Deleted successfully!', clrAlertType: IAlertType.SUCCESS })
            this.searchSubmit(this.weathersearch.frmSrchCountry,
              this.weathersearch.weatherTypenm,
              this.weathersearch.frmSrchStDt,
              this.weathersearch.frmSrchEndDt,
              this.weathersearch.frmSrchLocation,
              this.weathersearch.frmActiveBox,
              this.weathersearch.frmSrchState
            );
          },
          error: (error: HttpErrorResponse) => {
            this.handleError(error);
          }
        });
      }
    }
  }

  //for refreshing the grid
  refreshWeatherEvents() {
    this.searchSubmit(this.weathersearch.frmSrchCountry,
      this.weathersearch.weatherTypenm,
      this.weathersearch.frmSrchStDt,
      this.weathersearch.frmSrchEndDt,
      this.weathersearch.frmSrchLocation,
      this.weathersearch.frmActiveBox,
      this.weathersearch.frmSrchState
    );
  }

  editEntry(entry: any) {
    this.commonService.getWeatherEvent(entry.weatherAlertID)
      .subscribe({
        next: (response: any) => {
          this.gridData = response;
          this.gridData.isMapped = entry.isMapped;
          this.gridData.eventStatus = entry.eventStatus;
          this.openModal('edit')
        },
        error: (error: any) => {
          this.handleError(error);
        }
      })
  }

  handleFormClose(event: any) {
    this.gridData = event;
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

