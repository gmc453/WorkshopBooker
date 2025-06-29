using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using WorkshopBooker.Infrastructure.Persistence;
using WorkshopBooker.Application;
using WorkshopBooker.Infrastructure;
using WorkshopBooker.Infrastructure.Security;

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
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Secret"]!))
        };
    });
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
app.UseCors("AllowDevelopmentClients");

app.UseRouting(); // Dodaj tê liniê
app.UseAuthentication();
app.UseAuthorization(); // Dodaj tê liniê

app.MapControllers(); // Dodaj tê liniê zamiast kodu weatherforecast

app.Run();