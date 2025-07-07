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
        services.AddScoped<INotificationService, NotificationService>();
        services.AddSingleton<IBackgroundJobService, BackgroundJobService>();
        return services;
    }
}
