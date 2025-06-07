<select class="form-control mb-2 qtc-weather-alert-multi-select" id="@idDDCountry" name="Country" placeholder="- Select Country -" multiple="multiple">
    @foreach (var item in Model.CountryList)
    {
        var selected = (Model.Country != null && Model.Country.Contains(item.Key)) ? "selected" : "";
        <option value="@item.Key" @selected>
            @item.Value
        </option>
    }
</select>

<select class="form-control mb-2 qtc-weather-alert-multi-select" id="@idDDState" name="States" placeholder="- Select State -" multiple="multiple">
    @foreach (var item in Model.StatesList)
    {
        var selected = (Model.State != null && Model.State.Contains(item.Key)) ? "selected" : "";
        <option value="@item.Key" @selected>
            @item.Value
        </option>
    }
</select>

@foreach (var item in Model.CountryList)
{
    <option value="@item.Key" @(Model.Country != null && Model.Country.Contains(item.Key) ? "selected" : "")>
        @item.Value
    </option>
}

//2
@foreach (var item in Model.CountryList)
{
    <option value="@item.Key"
        @if (Model.Country != null && Model.Country.Contains(item.Key)) { <text>selected="selected"</text>; }>
    @item.Value
    </option>
}


$(document).ready(function () {
    var initialCountries = @Html.Raw(Newtonsoft.Json.JsonConvert.SerializeObject(Model.Country ?? new List<string>()));
    var initialStates = @Html.Raw(Newtonsoft.Json.JsonConvert.SerializeObject(Model.State ?? new List<string>()));

    $("#ddlRescheduleApptCountry").val(initialCountries).trigger('change');
    $("#ddlRescheduleApptState").val(initialStates).trigger('change');

    if (initialCountries && initialCountries.includes("USA")) {
        $("#ddlRescheduleApptState").closest(".form-group").show();
    } else {
        $("#ddlRescheduleApptState").closest(".form-group").hide();
    }

    triggerWeatherEventsCheck();

    // ... your other JS code ...
});
