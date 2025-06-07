@foreach (var item in Model.CountryList)
{
    <option value="@item.Key" selected="@(Model.Country != null && Model.Country.Contains(item.Key))">
        @item.Value
    </option>
}


//////

@foreach (var item in Model.CountryList)
{
    <option value="@item.Key" @(Model.Country != null && Model.Country.Contains(item.Key) ? "selected" : "")>
        @item.Value
    </option>
}

<select asp-for="Country" asp-items="Model.CountryList"></select>
