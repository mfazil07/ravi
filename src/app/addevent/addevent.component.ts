import { Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { WeatherEvent, WeatherEventRequest } from '../dtos/dtos';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { CommonService } from '../services/common.service';
import { formatDate } from '@angular/common';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-addevent',
  templateUrl: './addevent.component.html',
  styleUrl: './addevent.component.css',
})
export class AddeventComponent implements OnInit {
  @ViewChild('weatheraddform') weatheraddform!: NgForm;
  @Input() set formData(value: any) {
    if (value) {
      this.eventType = 'Edit '
      this.weatherAdd = {
        frmWeatherEvent: value.weatherEvent,
        frmCountry: value.country,
        frmLocation: value.location,
        frmStartDate: formatDate(new Date(value.startDate), 'MM/dd/YYYY', 'EN-US'),
        frmEndDate: formatDate(new Date(value.endDate), 'MM/dd/YYYY', 'EN-US'),
        frmDescription: value.description,
      }
    } else {
      this.eventType = 'New ';
      this.weatheraddform?.reset()
    }
  }
  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent) {
    // Custom logic when Escape key is pressed
    this.open = false;
  }
  states: Array<any> = [{ name: 'Alaska', value: 'al' }, { name: 'Alaska1', value: 'al1' }, { name: 'Alaska2', value: 'al2' }]
  weatherTypes: any;
  eventType: string = 'New ';
  countries = [{ name: 'United State of America', value: 'usa' }, { name: 'India', value: 'in' }]
  input: any;
  weatherEvent = {} as WeatherEvent;
  open: boolean = false;
  weatherAdd: any;
  request = {} as WeatherEventRequest;
  isOtherDescriptionRequired: boolean = false;
  prevSelectedStates = [{ name: 'Alaska', value: 'al' }, { name: 'Alaska1', value: 'al1' }];
  prevSelectedCountries = [{ name: 'United State of America', value: 'usa' }];
  isUSAExist = false;
  constructor(private commonService: CommonService, private alertService: AlertService) {

  }
  validateDate(value: any) {
    if (!value) {
      return { required: true };
    }
    if (isNaN(Date.parse(value))) {
      return { invalidDate: true };
    }
    return null; // Valid date
  }

  log(vvvv: any) {
    console.log(vvvv)
  }

  openModal(mode = 'add'): void {
    this.open = true;
    this.eventType = mode === 'add' ? 'Add' : 'Edit'
    //this.loadWeatherform();
  }
  checkStates(values: any) {
    if (!values || (values && values.length < this.prevSelectedStates.length)) {
      const s = JSON.parse(JSON.stringify(this.prevSelectedStates));
      this.weatherAdd.state = s;
    }
  }
  checkCountries(values: any) {
    if (!values || (values && values.length < this.prevSelectedCountries.length)) {
      const s = JSON.parse(JSON.stringify(this.prevSelectedCountries));
      this.weatherAdd.country = s;
    }
    this.isUSAExist = false;
    if (values && values.length) {
      if (values.find((it: any) => it.value === 'usa')) {
        this.isUSAExist = true;
      }
    }
    
  }
  setOtherReasonValidation(event: any) {
    const { value } = event.target;
    this.isOtherDescriptionRequired = value.toLowerCase() === 'others';
  }

  loadWeatherform() {
    this.weatherAdd = {
      frmVaCode: '',
      frmWeatherEvent: '',
      frmReasons: '',
      frmCountry: 'usa',
      state: [{ name: 'Alaska', value: 'al' }, { name: 'Alaska1', value: 'al1' }],
      frmLocation: '',
      frmStartDate: '',
      frmEndDate: '',
      frmDescription: '',
      frmOtherDescription: '',
    };
  }
  closeModal(): void {
    this.open = false;
  }
  getClass(selected: any) {
    const isexist = this.prevSelectedStates.find(it => it.name === selected);
    if (isexist) {
      const ariaLabel = `[aria-label="Delete selected option ${selected}"]`
      var element = document.querySelector(ariaLabel);
      if (element)
        (element as any).hidden = true;
      return 'disabled'
    }
    return "";
  }
  getCountryClass(selected: any) {
    const isexist = this.prevSelectedCountries.find(it => it.name === selected);
    if (isexist) {
      const ariaLabel = `[aria-label="Delete selected option ${selected}"]`
      var element = document.querySelector(ariaLabel);
      if (element)
        (element as any).hidden = true;
      return 'disabled'
    }
    return "";
  }
  onSubmit(_form: any): void {
    this.alertService.pushMessage({
      clrAlertType: 'danger',
      message: `This is a success alert! ${performance.now()}`,
      clrAlertAppLevel: false,
      clrAlertClosable: true,
    });
    if (this.weatherAdd.valid) {

      alert(this.weatherAdd.value)
      this.open = false;
      //this.commonService.addWeatherEvent();
    }
  }

  ngOnInit(): void {
    this.loadWeatherform();
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
  }

}
