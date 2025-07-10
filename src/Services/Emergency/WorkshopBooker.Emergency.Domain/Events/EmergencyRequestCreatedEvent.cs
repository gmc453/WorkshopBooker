using WorkshopBooker.Core.Common;

namespace WorkshopBooker.Emergency.Domain.Events;

public class EmergencyRequestCreatedEvent : IEvent
{
    public Guid RequestId { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Priority { get; set; } = string.Empty;
} 