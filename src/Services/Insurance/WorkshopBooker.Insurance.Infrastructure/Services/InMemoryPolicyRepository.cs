using WorkshopBooker.Insurance.Domain.Entities;

namespace WorkshopBooker.Insurance.Infrastructure.Services;

public interface IPolicyRepository
{
    IEnumerable<InsurancePolicy> GetAll();
    void Add(InsurancePolicy policy);
}

public class InMemoryPolicyRepository : IPolicyRepository
{
    private readonly List<InsurancePolicy> _policies = new();

    public IEnumerable<InsurancePolicy> GetAll() => _policies;

    public void Add(InsurancePolicy policy)
    {
        _policies.Add(policy);
    }
}
