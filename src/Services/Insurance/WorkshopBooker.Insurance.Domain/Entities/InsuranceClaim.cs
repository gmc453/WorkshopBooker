namespace WorkshopBooker.Insurance.Domain.Entities;

public enum ClaimStatus
{
    Submitted,
    Approved,
    Rejected,
    Paid
}

public class InsuranceClaim
{
    public Guid Id { get; set; }
    public Guid PolicyId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public ClaimStatus Status { get; set; } = ClaimStatus.Submitted;
}
