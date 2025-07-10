using WorkshopBooker.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;
using WorkshopBooker.Insurance.Domain.Entities;
using WorkshopBooker.Insurance.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IPolicyRepository, InMemoryPolicyRepository>();
builder.Services.AddSingleton<IPaymentGateway, DummyPaymentGateway>();

var app = builder.Build();

app.MapGet("/api/policies", (IPolicyRepository repo) => repo.GetAll());
app.MapPost("/api/policies", async ([FromBody] InsurancePolicy policy, IPolicyRepository repo, IPaymentGateway payments) =>
{
    var paymentId = await payments.CreatePaymentAsync(policy.Id, policy.Premium, "PLN");
    repo.Add(policy);
    return Results.Created($"/api/policies/{policy.Id}", new { policy.Id, paymentId });
});

app.Run();

public partial class Program { }
