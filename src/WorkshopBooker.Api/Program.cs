using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using WorkshopBooker.Infrastructure.Persistence;
using WorkshopBooker.Application;
using WorkshopBooker.Infrastructure;
using WorkshopBooker.Infrastructure.Security;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// ------------------- DODAJ TEN BLOK KODU -------------------
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));
// Po linii z AddDbContext
builder.Services.AddScoped<WorkshopBooker.Application.Common.Interfaces.IApplicationDbContext>(provider =>
    provider.GetRequiredService<WorkshopBooker.Infrastructure.Persistence.ApplicationDbContext>());
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
builder.Services.AddInfrastructure();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<WorkshopBooker.Application.Common.Interfaces.ICurrentUserProvider, WorkshopBooker.Api.Services.CurrentUserProvider>();
// Dla MediatR (po utworzeniu IApplicationMarker)
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(WorkshopBooker.Application.IApplicationMarker).Assembly));
// -----------------------------------------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowDevelopmentClients", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
builder.Services.AddControllers(); // Dodaj tê liniê
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Wypisujemy wartości konfiguracji JWT dla debugowania
        Console.WriteLine($"JwtSettings:Issuer: {builder.Configuration["JwtSettings:Issuer"]}");
        Console.WriteLine($"JwtSettings:Audience: {builder.Configuration["JwtSettings:Audience"]}");
        Console.WriteLine($"JwtSettings:Secret length: {builder.Configuration["JwtSettings:Secret"]?.Length}");
        
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Secret"]!)),
            // Dodajemy opcję, która wymaga schematu "Bearer" w nagłówku Authorization
            AuthenticationType = JwtBearerDefaults.AuthenticationScheme
        };

        // Dodajemy logowanie zdarzeń JWT
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                Console.WriteLine($"Token: {context.Request.Headers["Authorization"]}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine("Token został pomyślnie zwalidowany");
                return Task.CompletedTask;
            },
            OnMessageReceived = context =>
            {
                var token = context.Request.Headers["Authorization"].ToString();
                if (!string.IsNullOrEmpty(token))
                {
                    // Sprawdzamy, czy token ma prefiks "Bearer "
                    if (token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                    {
                        context.Token = token.Substring("Bearer ".Length).Trim();
                        Console.WriteLine($"Token otrzymany z prefiksem Bearer: {context.Token?.Substring(0, Math.Min(10, context.Token?.Length ?? 0))}...");
                    }
                    else
                    {
                        // Jeśli token nie ma prefiksu, używamy go bezpośrednio
                        context.Token = token;
                        Console.WriteLine($"Token otrzymany bez prefiksu Bearer: {context.Token?.Substring(0, Math.Min(10, context.Token?.Length ?? 0))}...");
                    }
                }
                else
                {
                    Console.WriteLine("Brak tokenu w nagłówku Authorization");
                }
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                Console.WriteLine($"Challenge został wywołany: {context.AuthenticateFailure?.Message}");
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "WorkshopBooker API", Version = "v1" });

    // Konfiguracja JWT dla Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme (Example: 'Bearer 12345abcdef')",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowDevelopmentClients");

app.UseRouting(); // Dodaj tê liniê

// Middleware do debugowania nagłówków
app.Use(async (context, next) =>
{
    Console.WriteLine("Przetwarzanie żądania...");
    if (context.Request.Headers.TryGetValue("Authorization", out var authHeader))
    {
        Console.WriteLine($"Middleware: Nagłówek Authorization: {authHeader}");
        
        // Sprawdzamy, czy nagłówek ma prefiks "Bearer "
        if (!authHeader.ToString().StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            // Jeśli nie ma prefiksu, dodajemy go
            context.Request.Headers["Authorization"] = $"Bearer {authHeader.ToString().Trim()}";
            Console.WriteLine($"Middleware: Dodano prefiks Bearer: {context.Request.Headers["Authorization"]}");
        }
    }
    else
    {
        Console.WriteLine("Middleware: Brak nagłówka Authorization!");
    }
    await next.Invoke();
});

app.UseAuthentication();
app.UseAuthorization(); // Dodaj tê liniê

app.MapControllers(); // Dodaj tê liniê zamiast kodu weatherforecast

app.Run();