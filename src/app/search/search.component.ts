<select class="form-control mb-2 qtc-weather-alert-multi-select" 
        id="@idDDCountry" 
        name="SelectedCountries" 
        multiple="multiple">
    @foreach (var item in Model.CountryList)
    {
        <option value="@item.Key" 
                @(Model.SelectedCountries.Contains(item.Key) ? "selected" : "")>
            @item.Value
        </option>
    }
</select>
