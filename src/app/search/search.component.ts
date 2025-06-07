<select class="form-control mb-2 qtc-weather-alert-multi-select" 
        id="@idDDCountry" 
        name="SelectedCountries" 
        multiple="multiple">
    @foreach (var item in Model.CountryList)
    {
        @if (Model.SelectedCountries.Contains(item.Key))
        {
            <option value="@item.Key" selected>@item.Value</option>
        }
        else
        {
            <option value="@item.Key">@item.Value</option>
        }
    }
</select>



        ///
<select class="form-control qtc-weather-alert-multi-select" 
        id="@idDDCountry" 
        name="SelectedCountries" 
        multiple>
    @foreach (var item in Model.CountryList)
    {
        <option value="@item.Key" 
                @(Model.SelectedCountries.Contains(item.Key) ? "selected" : "")>
            @item.Value
        </option>
    }
</select>

        ///


$(document).ready(function() {
    // Get default values from the rendered select element
    var defaultValues = $('#@idDDCountry').val() || [];
    
    // Initialize multiselect
    $('#@idDDCountry').multiselect({
        buttonClass: 'btn btn-default',
        templates: {
            button: '<button type="button" class="multiselect dropdown-toggle form-control-drop-down form-control" data-bs-toggle="dropdown"></button>'
        },
        includeSelectAllOption: true,
        enableFiltering: true,
        // Update button text immediately
        onChange: function() {
            $('#@idDDCountry').multiselect('updateButtonText');
        }
    });
    
    // Set default selections after initialization
    if (defaultValues.length > 0) {
        setTimeout(function() {
            $('#@idDDCountry').multiselect('select', defaultValues);
            $('#@idDDCountry').multiselect('updateButtonText');
        }, 100);




//@foreach (var item in Model.CountryList)
{
    <option value="@item.Key"
        @if (Model.Country != null && Model.Country.Contains(item.Key)) { <text>selected="selected"</text>; }>
        @item.Value
    </option>
}
    }
});
