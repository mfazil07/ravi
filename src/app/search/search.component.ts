@foreach (var item in Model.CountryList)
{
    <text>
        <option value="@item.Key"@(Model.Country != null && Model.Country.Contains(item.Key) ? " selected" : "")>@item.Value</option>
    </text>
}

@foreach (var item in Model.CountryList)
{
    var isSelected = Model.Country != null && Model.Country.Contains(item.Key) ? " selected" : "";
    @Html.Raw($"<option value=\"{item.Key}\"{isSelected}>{item.Value}</option>")
}
