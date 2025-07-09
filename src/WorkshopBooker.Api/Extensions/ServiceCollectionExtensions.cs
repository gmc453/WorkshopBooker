using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using WorkshopBooker.Infrastructure.Persistence;
using WorkshopBooker.Application;
using WorkshopBooker.Infrastructure;
using WorkshopBooker.Infrastructure.Security;
using FluentValidation;
using WorkshopBooker.Application.Common;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Api.Services;
using WorkshopBooker.Application.Bookings.Services;

namespace WorkshopBooker.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString));
            
        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>());
            
        return services;
    }

    public static IServiceCollection AddAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));
        
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["JwtSettings:Issuer"],
                    ValidAudience = configuration["JwtSettings:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(configuration["JwtSettings:Secret"]!))
                };
            });
            
        services.AddAuthorization();
        return services;
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddMediatR(cfg => 
            cfg.RegisterServicesFromAssembly(typeof(IApplicationMarker).Assembly));
            
        services.AddValidatorsFromAssembly(typeof(IApplicationMarker).Assembly);
        
        // Dodaj pipeline walidacji
        services.AddTransient(typeof(MediatR.IPipelineBehavior<,>), typeof(WorkshopBooker.Application.Common.Validation.ValidationBehavior<,>));
        
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserProvider, CurrentUserProvider>();
        services.AddScoped<BookingValidator>();

        return services;
    }

    public static IServiceCollection AddCorsPolicy(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("AllowDevelopmentClients", policy =>
            {
                policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
        });
        
        return services;
    }

    public static IServiceCollection AddSwaggerWithJwt(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo 
            { 
                Title = "WorkshopBooker API", 
                Version = "v1" 
            });

            c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Description = "JWT Authorization header using the Bearer scheme (Example: 'Bearer 12345abcdef')",
                Name = "Authorization",
                In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT"
            });

            c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
            {
                {
                    new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                    {
                        Reference = new Microsoft.OpenApi.Models.OpenApiReference
                        {
                            Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });
        
        return services;
    }
} 