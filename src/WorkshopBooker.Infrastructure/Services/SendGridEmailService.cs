using SendGrid;
using SendGrid.Helpers.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WorkshopBooker.Application.Common.Interfaces;

namespace WorkshopBooker.Infrastructure.Services;

public class SendGridEmailService : IEmailService
{
    private readonly ISendGridClient _sendGridClient;
    private readonly ILogger<SendGridEmailService> _logger;
    private readonly string _fromEmail;
    private readonly string _fromName;

    public SendGridEmailService(IConfiguration configuration, ILogger<SendGridEmailService> logger)
    {
        var apiKey = configuration["SendGrid:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new InvalidOperationException("SendGrid API key is not configured");
        }

        _sendGridClient = new SendGridClient(apiKey);
        _logger = logger;
        _fromEmail = configuration["SendGrid:FromEmail"] ?? "noreply@workshopbooker.pl";
        _fromName = configuration["SendGrid:FromName"] ?? "WorkshopBooker";
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        try
        {
            var from = new EmailAddress(_fromEmail, _fromName);
            var toAddress = new EmailAddress(to);
            
            // SendGrid obsługuje HTML, więc możemy wysyłać HTML emails
            var msg = MailHelper.CreateSingleEmail(from, toAddress, subject, "", body);
            
            var response = await _sendGridClient.SendEmailAsync(msg);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Email sent successfully to {Email}: {Subject}", to, subject);
            }
            else
            {
                var errorBody = await response.Body.ReadAsStringAsync();
                _logger.LogError("Failed to send email to {Email}. Status: {Status}, Error: {Error}", 
                    to, response.StatusCode, errorBody);
                throw new Exception($"Failed to send email. Status: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending email to {Email}: {Subject}", to, subject);
            throw;
        }
    }

    public async Task SendEmailAsync(string to, string subject, string htmlBody, string textBody)
    {
        try
        {
            var from = new EmailAddress(_fromEmail, _fromName);
            var toAddress = new EmailAddress(to);
            
            var msg = MailHelper.CreateSingleEmail(from, toAddress, subject, textBody, htmlBody);
            
            var response = await _sendGridClient.SendEmailAsync(msg);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Email sent successfully to {Email}: {Subject}", to, subject);
            }
            else
            {
                var errorBody = await response.Body.ReadAsStringAsync();
                _logger.LogError("Failed to send email to {Email}. Status: {Status}, Error: {Error}", 
                    to, response.StatusCode, errorBody);
                throw new Exception($"Failed to send email. Status: {response.StatusCode}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending email to {Email}: {Subject}", to, subject);
            throw;
        }
    }
} 