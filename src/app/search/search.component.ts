@foreach (var item in Model.CountryList)
{
    var selected = Model.Country != null && Model.Country.Contains(item.Key) ? "selected" : "";
    <option value="@item.Key" @selected>@item.Value</option>
}
