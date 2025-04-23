<!-- Start Date and End Date Fields in One Row and Aligned -->
<div class="clr-row">
    <!-- Start Date Field -->
    <div class="clr-col-6">
        <div class="clr-row">
            <label for="startDate" class="clr-col-4 align-right"><b>Start Date</b></label>
            <input
                [min]="minStartDate"
                [max]="maxStartDate"
                class="clr-input clr-col-8"
                type="date"
                autocomplete="off"
                pattern=".*\S.*"
                required
                id="startDate"
                name="frmStartDate"
                #frmStartDate="ngModel"
                [(ngModel)]="weatherAdd.frmStartDate"
                (change)="onDateChange(frmStartDate)"
                (ngModelChange)="onInputChange()"
            />
        </div>
        <clr-control-error *ngIf="frmStartDate?.invalid && frmStartDate?.touched">
            <span *ngIf="frmStartDate?.errors?.['required'] || frmStartDate?.errors?.['pattern']">
                This field is required!
            </span>
            <span *ngIf="frmStartDate?.errors?.['invalidDate']">Select today or future date</span>
            <span *ngIf="frmStartDate?.errors?.['invalidStartDate']">Select a date less than or equal to End Date</span>
            <span *ngIf="frmStartDate?.errors?.['invalidMaxEndDate']">
                Select a date less than or equal to {{ maxStartDate | date:'MM/dd/yyyy' }}
            </span>
        </clr-control-error>
    </div>

    <!-- End Date Field -->
    <div class="clr-col-6">
        <div class="clr-row">
            <label for="endDate" class="clr-col-4 align-right"><b>End Date</b></label>
            <input
                [min]="minEndDate"
                class="clr-input clr-col-8"
                type="date"
                autocomplete="off"
                pattern=".*\S.*"
                required
                id="enddate"
                name="frmEndDate"
                #frmEndDate="ngModel"
                [(ngModel)]="weatherAdd.frmEndDate"
                [class.disabled]="!weatherAdd.frmStartDate"
                (change)="onDateChange(frmEndDate)"
                (ngModelChange)="onInputChange()"
            />
        </div>
        <clr-control-error *ngIf="frmEndDate?.invalid && frmEndDate?.touched">
            <span *ngIf="frmEndDate?.errors?.['required'] || frmEndDate?.errors?.['pattern']">
                This field is required!
            </span>
            <span *ngIf="frmEndDate?.errors?.['invalidDate']">Select today or future date</span>
            <span *ngIf="frmEndDate?.errors?.['invalidEndDate']">Select a date greater than or equal to Start Date</span>
            <span *ngIf="frmEndDate?.errors?.['invalidMinEndDate']">
                Select a date greater than or equal to {{ minEndDate | date:'MM/dd/yyyy' }}
            </span>
        </clr-control-error>
    </div>
</div>
