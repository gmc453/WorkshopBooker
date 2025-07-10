namespace WorkshopBooker.Insurance.Domain.Entities;

public enum PolicyStatus
{
    Active,
    Cancelled,
    Expired
}

public class InsurancePolicy
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string PolicyNumber { get; set; } = string.Empty;
    public decimal Premium { get; set; }
    public PolicyStatus Status { get; set; } = PolicyStatus.Active;
}
