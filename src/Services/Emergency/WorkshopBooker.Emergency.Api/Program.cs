using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Emergency.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<EmergencyDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("EmergencyConnection") ??
                      builder.Configuration["ConnectionString"]));

builder.Services.AddHealthChecks();

builder.WebHost.UseUrls("http://0.0.0.0:5001");

var app = builder.Build();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();

public partial class Program { }
