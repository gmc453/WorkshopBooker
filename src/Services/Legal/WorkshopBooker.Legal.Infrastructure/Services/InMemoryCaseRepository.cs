using WorkshopBooker.Legal.Domain.Entities;

namespace WorkshopBooker.Legal.Infrastructure.Services;

public interface ICaseRepository
{
    IEnumerable<LegalCase> GetAll();
    void Add(LegalCase legalCase);
}

public class InMemoryCaseRepository : ICaseRepository
{
    private readonly List<LegalCase> _cases = new();

    public IEnumerable<LegalCase> GetAll() => _cases;

    public void Add(LegalCase legalCase)
    {
        _cases.Add(legalCase);
    }
}
