using WorkshopBooker.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;
using WorkshopBooker.Legal.Domain.Entities;
using WorkshopBooker.Legal.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<ICaseRepository, InMemoryCaseRepository>();
builder.Services.AddSingleton<IDocumentRepository, InMemoryDocumentRepository>();
builder.Services.AddSingleton<IPaymentGateway, DummyPaymentGateway>();
builder.Services.AddScoped<ConsultationPaymentService>();

var app = builder.Build();

app.MapGet("/api/cases", (ICaseRepository repo) => repo.GetAll());
app.MapPost("/api/cases", ([FromBody] LegalCase legalCase, ICaseRepository repo) =>
{
    repo.Add(legalCase);
    return Results.Created($"/api/cases/{legalCase.Id}", legalCase);
});

app.MapPost("/api/cases/{caseId}/documents", async (Guid caseId, IFormFile file, IDocumentRepository docs) =>
{
    using var ms = new MemoryStream();
    await file.CopyToAsync(ms);
    var doc = new Document
    {
        Id = Guid.NewGuid(),
        CaseId = caseId,
        FileName = file.FileName,
        ContentType = file.ContentType,
        Content = ms.ToArray()
    };
    docs.Add(doc);
    return Results.Created($"/api/cases/{caseId}/documents/{doc.Id}", doc.Id);
});

app.Run();

public partial class Program { }
