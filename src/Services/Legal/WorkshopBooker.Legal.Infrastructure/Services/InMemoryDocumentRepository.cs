using WorkshopBooker.Legal.Domain.Entities;

namespace WorkshopBooker.Legal.Infrastructure.Services;

public interface IDocumentRepository
{
    void Add(Document document);
    IEnumerable<Document> GetForCase(Guid caseId);
}

public class InMemoryDocumentRepository : IDocumentRepository
{
    private readonly List<Document> _documents = new();

    public void Add(Document document)
    {
        _documents.Add(document);
    }

    public IEnumerable<Document> GetForCase(Guid caseId) =>
        _documents.Where(d => d.CaseId == caseId);
}
