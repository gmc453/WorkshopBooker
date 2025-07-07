// src/WorkshopBooker.Application/Common/Interfaces/IApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Workshop> Workshops { get; }
    DbSet<Service> Services { get; }
    DbSet<Booking> Bookings { get; }
    DbSet<AvailableSlot> AvailableSlots { get; }
    DbSet<User> Users { get; }
    DbSet<Review> Reviews { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
