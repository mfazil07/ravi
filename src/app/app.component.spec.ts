using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

public class SaveOtherAddressTests
{
    private readonly Mock<DbContext> _mockContext;
    private readonly Mock<ILogger<YourServiceClass>> _mockLogger;
    private readonly YourServiceClass _service;

    public SaveOtherAddressTests()
    {
        _mockContext = new Mock<DbContext>();
        _mockLogger = new Mock<ILogger<YourServiceClass>>();
        _service = new YourServiceClass(_mockContext.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task SaveOtherAddress_ShouldSaveNewAddress_WhenAddressDoesNotExist()
    {
        // Arrange
        var claimantOtherAddressDto = new AddClaimantOtherAddressDto
        {
            ClaimantOtherAddress_ID = null,
            ClaimantId = 1,
            StartDate = DateTime.Now,
            EndDate = DateTime.Now.AddYears(1),
            UserName = "testuser"
        };

        _mockContext.Setup(m => m.ClaimantOtherAddresses.AddAsync(It.IsAny<ClaimantOtherAddress>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _mockContext.Setup(m => m.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.SaveOtherAddress(CancellationToken.None, claimantOtherAddressDto);

        // Assert
        Assert.True(result > 0);
    }

    [Fact]
    public async Task SaveOtherAddress_ShouldUpdateExistingAddress_WhenAddressExists()
    {
        // Arrange
        var claimantOtherAddressDto = new AddClaimantOtherAddressDto
        {
            ClaimantOtherAddress_ID = 1,
            ClaimantId = 1,
            StartDate = DateTime.Now,
            EndDate = DateTime.Now.AddYears(1),
            UserName = "testuser"
        };

        var existingAddress = new ClaimantOtherAddress
        {
            Claimant_Other_Address_ID = 1,
            GlobalAddress = new GlobalAddress(),
            IsDeleted = 0
        };

        _mockContext.Setup(m => m.ClaimantOtherAddresses.Include(It.IsAny<Func<IQueryable<ClaimantOtherAddress>, IIncludableQueryable<ClaimantOtherAddress, object>>>()))
            .Returns(new List<ClaimantOtherAddress> { existingAddress }.AsQueryable());

        _mockContext.Setup(m => m.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.SaveOtherAddress(CancellationToken.None, claimantOtherAddressDto);

        // Assert
        Assert.Equal(1, result);
    }

    [Fact]
    public async Task SaveOtherAddress_ShouldReturnMinusOne_WhenExceptionIsThrown()
    {
        // Arrange
        var claimantOtherAddressDto = new AddClaimantOtherAddressDto
        {
            ClaimantOtherAddress_ID = null,
            ClaimantId = 1,
            StartDate = DateTime.Now,
            EndDate = DateTime.Now.AddYears(1),
            UserName = "testuser"
        };

        _mockContext.Setup(m => m.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception());

        // Act
        var result = await _service.SaveOtherAddress(CancellationToken.None, claimantOtherAddressDto);

        // Assert
        Assert.Equal(-1, result);
    }
}
