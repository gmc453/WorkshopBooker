using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WorkshopBooker.Application.Common.Interfaces;

namespace WorkshopBooker.Infrastructure.Services;

public class TwilioSmsService : ISmsService
{
    private readonly ILogger<TwilioSmsService> _logger;
    private readonly string _accountSid;
    private readonly string _authToken;
    private readonly string _fromPhoneNumber;

    public TwilioSmsService(IConfiguration configuration, ILogger<TwilioSmsService> logger)
    {
        _logger = logger;
        _accountSid = configuration["Twilio:AccountSid"] ?? string.Empty;
        _authToken = configuration["Twilio:AuthToken"] ?? string.Empty;
        _fromPhoneNumber = configuration["Twilio:FromPhoneNumber"] ?? string.Empty;

        if (string.IsNullOrEmpty(_accountSid) || string.IsNullOrEmpty(_authToken) || string.IsNullOrEmpty(_fromPhoneNumber))
        {
            throw new InvalidOperationException("Twilio configuration is incomplete. Please check AccountSid, AuthToken, and FromPhoneNumber.");
        }

        TwilioClient.Init(_accountSid, _authToken);
    }

    public async Task SendSmsAsync(string phoneNumber, string message)
    {
        try
        {
            // Formatuj numer telefonu (usuń spacje, dodaj +48 jeśli brakuje)
            var formattedPhoneNumber = FormatPhoneNumber(phoneNumber);

            var messageResource = await MessageResource.CreateAsync(
                body: message,
                from: new PhoneNumber(_fromPhoneNumber),
                to: new PhoneNumber(formattedPhoneNumber)
            );

            _logger.LogInformation("SMS sent successfully to {PhoneNumber}. SID: {Sid}", 
                formattedPhoneNumber, messageResource.Sid);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending SMS to {PhoneNumber}: {Message}", phoneNumber, message);
            throw;
        }
    }

    private string FormatPhoneNumber(string phoneNumber)
    {
        // Usuń wszystkie spacje, myślniki i nawiasy
        var cleaned = phoneNumber.Replace(" ", "").Replace("-", "").Replace("(", "").Replace(")", "");
        
        // Jeśli numer nie zaczyna się od +, dodaj +48 (kod Polski)
        if (!cleaned.StartsWith("+"))
        {
            if (cleaned.StartsWith("48"))
            {
                cleaned = "+" + cleaned;
            }
            else if (cleaned.StartsWith("0"))
            {
                cleaned = "+48" + cleaned.Substring(1);
            }
            else
            {
                cleaned = "+48" + cleaned;
            }
        }
        
        return cleaned;
    }
} 