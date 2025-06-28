using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Infrastructure.Persistence;
using WorkshopBooker.Application;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// ------------------- DODAJ TEN BLOK KODU -------------------
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));
// Po linii z AddDbContext
builder.Services.AddScoped<WorkshopBooker.Application.Common.Interfaces.IApplicationDbContext>(provider =>
    provider.GetRequiredService<WorkshopBooker.Infrastructure.Persistence.ApplicationDbContext>());
// Dla MediatR (po utworzeniu IApplicationMarker)
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(WorkshopBooker.Application.IApplicationMarker).Assembly));
// -----------------------------------------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJsClient", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Adres serwera deweloperskiego Next.js
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
builder.Services.AddControllers(); // Dodaj tê liniê
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowNextJsClient");

app.UseRouting(); // Dodaj tê liniê
app.UseAuthorization(); // Dodaj tê liniê

app.MapControllers(); // Dodaj tê liniê zamiast kodu weatherforecast

app.Run();