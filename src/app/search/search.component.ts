<option value="@item.Key" @(Model.Country != null && Model.Country.Contains(item.Key) ? "selected" : null)>
    @item.Value
</option>
