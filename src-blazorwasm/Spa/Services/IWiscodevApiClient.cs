namespace Spa.Services;

public interface IWiscodevApiClient
{
    Task<string> GetHealthAsync(CancellationToken ct = default);
    Task<string> GetGlobalEndWarAsync(CancellationToken ct = default);
    Task<string> ExtendCorporatePtoAsync(int bonusDays, CancellationToken ct = default);
    Task<string> GetHrEmployedAsync(CancellationToken ct = default);
}
