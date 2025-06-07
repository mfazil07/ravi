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
