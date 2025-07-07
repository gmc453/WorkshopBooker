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
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("BookingPolicy", context =>
        RateLimitPartition.GetIpLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "unknown", key => new TokenBucketRateLimiterOptions
        {
            TokenLimit = 5,
            TokensPerPeriod = 5,
            ReplenishmentPeriod = TimeSpan.FromMinutes(1),
            AutoReplenishment = true
        }));
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

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();