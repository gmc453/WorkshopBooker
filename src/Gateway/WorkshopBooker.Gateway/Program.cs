using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

// ✅ DODANO: Ocelot configuration
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);
builder.Services.AddOcelot();

// ✅ DODANO: Health checks
builder.Services.AddHealthChecks();

// ✅ DODANO: CORS dla frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// ✅ DODANO: Middleware order
app.UseCors();
app.MapHealthChecks("/health");

// ✅ DODANO: Ocelot middleware
await app.UseOcelot();

app.Run();
