using System.Net.Http.Json;

namespace Spa.Services;

public class WiscodevApiClient(HttpClient httpClient) : IWiscodevApiClient
{
    private readonly HttpClient _http = httpClient;

    public async Task<string> GetHealthAsync(CancellationToken ct = default)
        => await GetStringAsync("/health", ct);

    public async Task<string> GetGlobalEndWarAsync(CancellationToken ct = default)
        => await GetStringAsync("/politics/global/endwar", ct);

    public async Task<string> ExtendCorporatePotAsync(int bonusDays, CancellationToken ct = default)
        => await GetStringAsync($"/corporate/pot/extend/{bonusDays}", ct);

    public async Task<string> GetHrEmployedAsync(CancellationToken ct = default)
        => await GetStringAsync("/hr/employed", ct);

    private async Task<string> GetStringAsync(string relativeUrl, CancellationToken ct)
    {
        using var response = await _http.GetAsync(relativeUrl, ct);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            throw new HttpRequestException($"API call to '{relativeUrl}' failed: {(int)response.StatusCode} {response.ReasonPhrase} - {body}");
        }
        return await response.Content.ReadAsStringAsync(ct);
    }
}
