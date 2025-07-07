using System.ComponentModel.DataAnnotations;

namespace WorkshopBooker.Domain.Entities;

public enum SlotStatus
{
    Available,
    Booked
}

public class AvailableSlot
{
    public Guid Id { get; private set; }
    public DateTime StartTime { get; private set; }
    public DateTime EndTime { get; private set; }
    [Timestamp]
    public byte[] RowVersion { get; private set; } = Array.Empty<byte>();
    public SlotStatus Status { get; private set; }

    public Guid WorkshopId { get; private set; }
    public Workshop Workshop { get; private set; } = null!;

    private AvailableSlot() { }

    public AvailableSlot(Guid id, DateTime startTime, DateTime endTime, Guid workshopId)
    {
        Id = id;
        StartTime = startTime;
        EndTime = endTime;
        WorkshopId = workshopId;
        Status = SlotStatus.Available;
    }

    public void Book()
    {
        if (Status == SlotStatus.Booked)
        {
            throw new InvalidOperationException("This slot is already booked.");
        }
        Status = SlotStatus.Booked;
    }
}
