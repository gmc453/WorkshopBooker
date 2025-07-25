namespace WorkshopBooker.Infrastructure.Security;

public class JwtSettings
{
    public string Secret { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; }
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
}
