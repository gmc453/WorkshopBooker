using WorkshopBooker.Api.Extensions;
using WorkshopBooker.Api.Middleware;
using WorkshopBooker.Infrastructure;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddPersistence(builder.Configuration);
builder.Services.AddAuthentication(builder.Configuration);
builder.Services.AddApplicationServices();
builder.Services.AddCorsPolicy();
builder.Services.AddSwaggerWithJwt();
builder.Services.AddInfrastructure();

// Professional Rate Limiting Configuration
builder.Services.AddRateLimiter(options =>
{
    // Helper function to get rate limit key (user-based instead of IP-based)
    static string GetRateLimitKey(HttpContext context)
    {
        // Try to get user ID from JWT token first
        var userId = context.User?.FindFirst("sub")?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            return $"user:{userId}";
        }
        
        // Fallback to IP address for anonymous users
        return $"ip:{context.Connection.RemoteIpAddress?.ToString() ?? "unknown"}";
    }

    // 📖 READ Operations - Wysokie limity dla normalnego przeglądania
    options.AddPolicy("ReadPolicy", context =>
        RateLimitPartition.GetSlidingWindowLimiter(GetRateLimitKey(context), key => new SlidingWindowRateLimiterOptions
        {
            PermitLimit = 100,
            Window = TimeSpan.FromMinutes(1),
            SegmentsPerWindow = 6,
            AutoReplenishment = true
        }));

    // ✏️ WRITE Operations - Umiarkowane limity dla modyfikacji danych
    options.AddPolicy("WritePolicy", context =>
        RateLimitPartition.GetSlidingWindowLimiter(GetRateLimitKey(context), key => new SlidingWindowRateLimiterOptions
        {
            PermitLimit = 20,
            Window = TimeSpan.FromMinutes(1),
            SegmentsPerWindow = 6,
            AutoReplenishment = true
        }));

    // 🔒 CRITICAL Operations - Niskie limity dla najważniejszych operacji
    options.AddPolicy("CriticalPolicy", context =>
        RateLimitPartition.GetSlidingWindowLimiter(GetRateLimitKey(context), key => new SlidingWindowRateLimiterOptions
        {
            PermitLimit = 10,
            Window = TimeSpan.FromMinutes(1),
            SegmentsPerWindow = 6,
            AutoReplenishment = true
        }));

    // 📈 ANALYTICS Operations - Bardzo wysokie limity dla dashboard
    options.AddPolicy("AnalyticsPolicy", context =>
        RateLimitPartition.GetSlidingWindowLimiter(GetRateLimitKey(context), key => new SlidingWindowRateLimiterOptions
        {
            PermitLimit = 200,
            Window = TimeSpan.FromMinutes(1),
            SegmentsPerWindow = 6,
            AutoReplenishment = true
        }));

    // User-friendly error response
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        
        var response = new
        {
            error = "Rate limit exceeded",
            message = "Zbyt wiele żądań. Spróbuj ponownie za chwilę.",
            retryAfterSeconds = 60,
            type = "rate_limit_exceeded",
            policy = "unknown"
        };
        
        await context.HttpContext.Response.WriteAsJsonAsync(response, cancellationToken);
    };
});

builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowDevelopmentClients");
app.UseRouting();
app.UseRateLimiter();

// Dodaj global exception handler
app.UseMiddleware<GlobalExceptionHandler>();

// Dodaj rate limit headers middleware
app.UseMiddleware<RateLimitHeadersMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();