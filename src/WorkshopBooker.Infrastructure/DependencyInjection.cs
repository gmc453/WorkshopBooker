using Microsoft.Extensions.DependencyInjection;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Infrastructure.Security;

namespace WorkshopBooker.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        return services;
    }
}
