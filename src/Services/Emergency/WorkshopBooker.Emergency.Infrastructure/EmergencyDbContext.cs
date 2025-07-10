using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Emergency.Domain.Entities;

namespace WorkshopBooker.Emergency.Infrastructure;

public class EmergencyDbContext : DbContext
{
    public EmergencyDbContext(DbContextOptions<EmergencyDbContext> options) : base(options) { }

    public DbSet<EmergencyRequest> EmergencyRequests => Set<EmergencyRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<EmergencyRequest>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Description).IsRequired();
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            entity.Property(e => e.CreatedAt).IsRequired();
        });
    }
}
