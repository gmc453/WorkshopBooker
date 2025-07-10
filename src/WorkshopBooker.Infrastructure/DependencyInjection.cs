using Microsoft.Extensions.DependencyInjection;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Infrastructure.Security;
using WorkshopBooker.Infrastructure.Services;

namespace WorkshopBooker.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        
        // Notification services
        services.AddScoped<IEmailService, SendGridEmailService>();
        services.AddScoped<ISmsService, TwilioSmsService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddHttpClient<ILocationService, LocationService>();
        
        // ✅ POPRAWKA: Rejestracja jako singleton z proper disposal
        services.AddSingleton<IBackgroundJobService, BackgroundJobService>();
        
        // Business logic services
        services.AddScoped<IConflictResolutionService, ConflictResolutionService>();
        services.AddScoped<IWorkingHoursValidator, WorkingHoursValidator>();
        
        return services;
    }
}
