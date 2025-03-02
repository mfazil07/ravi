import { TestBed } from '@angular/core/testing';
import { AlertService, IAlertType, IAlertConfig } from './alert.service';

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show alert with given config', () => {
    const config: IAlertConfig = {
      clrAlertType: IAlertType.SUCCESS,
      message: "Test message",
      clrAlertAppLevel: true,
      clrAlertClosable: false
    };
    service.show(config);
    expect(service.shouldShowAlert).toBeTrue();
    expect(service.alertConfig.message).toBe("Test message");
  });


  it('should hide alert', () => {
    service.hide();
    expect(service.shouldShowAlert).toBeFalse();
  });

  it('should toggle alert visibility', () => {
    service.toggle();
    expect(service.shouldShowAlert).toBeTrue();
    service.toggle();
    expect(service.shouldShowAlert).toBeFalse();
  });

  it('should close alert and emit close event', () => {
    spyOn(service.close, 'next');
    service.onClose('test');
    expect(service.close.next).toHaveBeenCalled();
    expect(service.shouldShowAlert).toBeFalse();
  });

  it('should return close event observable', () => {
    expect(service.onClose$()).toBe(service.close);
  });
});
