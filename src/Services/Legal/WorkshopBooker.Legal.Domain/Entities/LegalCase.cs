namespace WorkshopBooker.Legal.Domain.Entities;

public enum CaseStatus
{
    Open,
    InProgress,
    Closed
}

public class LegalCase
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public CaseStatus Status { get; set; } = CaseStatus.Open;
}
