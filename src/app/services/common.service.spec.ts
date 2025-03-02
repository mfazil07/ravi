import { TestBed } from '@angular/core/testing';
import { ConfirmDialogService } from './confirm-dialog.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Subject } from 'rxjs';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;
  let componentMock: ConfirmDialogComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmDialogService);

    // Create a mock instance of ConfirmDialogComponent
    componentMock = {
      message: '',
      confirmButtonLabel: '',
      cancelButtonLabel: '',
      show: jasmine.createSpy('show'),
      confirm: new Subject<boolean>()
    } as any as ConfirmDialogComponent;

    // Set the mock component in the service
    service.setComponent(componentMock);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set the component', () => {
    service.setComponent(componentMock);
    expect(service['confirmDialogComponent']).toBe(componentMock);
  });

  it('should throw an error if confirmDialogComponent is not initialized', () => {
    service.setComponent(undefined as any);
    expect(() => service.confirm('Test message')).toThrowError('ConfirmDialogComponent is not initialized');
  });

  it('should open the dialog and resolve with true on confirm', async () => {
    const promise = service.confirm('Test message', 'Yes', 'No');
    expect(componentMock.show).toHaveBeenCalled();
    expect(componentMock.message).toBe('Test message');
    expect(componentMock.confirmButtonLabel).toBe('Yes');
    expect(componentMock.cancelButtonLabel).toBe('No');

    componentMock.confirm.next(true); // Simulate confirmation
    const result = await promise;
    expect(result).toBeTrue();
  });
});
