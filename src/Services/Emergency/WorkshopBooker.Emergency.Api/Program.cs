using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Emergency.Infrastructure;
using WorkshopBooker.Core.Messaging;
using WorkshopBooker.Core.Common;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ✅ DODANO: Core services integration
builder.Services.AddScoped<IEventBus, InMemoryEventBus>();

// Database
builder.Services.AddDbContext<EmergencyDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("EmergencyConnection")));

// Health checks
builder.Services.AddHealthChecks();

builder.WebHost.UseUrls("http://0.0.0.0:5001");

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// ✅ DODANO: Health check endpoint
app.MapHealthChecks("/health");

app.Run();

public partial class Program { }
