<!-- Country Dropdown -->
<div class="clr-row">
    <div #addEventCountryComboBox class="clr-col-12 clr-col-md-8 combo-box req">
        <clr-combobox-container class="inline-error">
            <label class="clr-col-12 clr-col-md-6 clr-col-lg-4 clr-control-label">Country</label>
            <clr-combobox class="clr-col-12 clr-col-md-6" [(ngModel)]="weatherAdd.frmCountry"
                (ngModelChange)="checkCountries(weatherAdd.frmCountry)" clrMulti="true" name="frmCountry"
                #frmCountry="ngModel" [required]="true">
                <ng-container *clrOptionSelected="let selected">
                    <span [ngClass]="getCountryClass(selected?.value)">
                        {{ selected?.value }}</span>
                </ng-container>
                <clr-options>
                    <clr-option *clrOptionItems="let country of getAvailableCountries(); field: 'value'"
                        [clrValue]="country">
                        {{ country.value }}
                    </clr-option>
                </clr-options>
            </clr-combobox>
            <clr-control-error *ngIf="frmCountry?.invalid && frmCountry?.touched">
                <span *ngIf="frmCountry?.errors?.['required']"> This field is required!</span>
            </clr-control-error>
        </clr-combobox-container>
    </div>
</div>

<!-- Reason Dropdown -->
<div class="clr-row">
    <div class="clr-col-12 clr-col-md-8 req">
        <clr-select-container>
            <label for="reasons" class="clr-col-12 clr-col-md-6 clr-col-lg-4 clr-control-label">Reason</label>
            <select class="clr-col-12 clr-col-md-6" clrSelect id="reasons" name="frmReasons"
                #frmReasons="ngModel" [(ngModel)]="weatherAdd.frmReasons"
                (change)="setOtherReasonValidation($event)" required (ngModelChange)="onInputChange()">
                <option *ngFor="let item of weatherTypes" [value]="item.key">{{ item.value }}</option>
            </select>
            <clr-control-error *ngIf="frmReasons?.invalid && frmReasons?.touched">
                <span *ngIf="frmReasons?.errors?.['required']"> This field is required!</span>
            </clr-control-error>
        </clr-select-container>
    </div>
</div>
                    /* Make combobox and select inputs match VA Weather Code width */
::ng-deep .clr-combobox-input, 
::ng-deep .clr-select {
    width: 100% !important;
}

/* Remove the narrow-select class if it was limiting width */
.narrow-select {
    width: 100% !important;
}

/* Ensure the combobox container expands */
.clr-combobox {
    width: 100%;
}

/* Make sure the dropdown options are wide enough */
::ng-deep .clr-options {
    min-width: 100% !important;
    width: auto !important;
}
