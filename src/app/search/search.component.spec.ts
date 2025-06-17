[DataTestMethod]
[DataRow(1001, 1)]
[DataRow(1002, 1)]
public async Task Test_MappedInfoAsync_HappyPath(long claimantId, long caseId)
{
    // Arrange
    var expectedEntity = new WeatherAlertMappedInfo
    {
        // Populate with required test values
        // e.g. AppointmentId = 123, IsMapped = true, etc.
    };

    _WeatherAlertData
        .Setup(d => d.MappedInfoAsync(claimantId, caseId))
        .ReturnsAsync(expectedEntity);

    // Act
    var result = await _weatherAlertManager.MappedInfoAsync(claimantId, caseId);

    // Assert
    Assert.IsNotNull(result);
    Assert.AreEqual(HttpStatusCode.OK, result.StatusCode);
    Assert.IsNotNull(result.Entity);
    Assert.AreEqual(expectedEntity, result.Entity); // Reference match; use property assertions if needed
}
