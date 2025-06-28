// src/WorkshopBooker.Infrastructure/Persistence/ApplicationDbContext.cs

using Microsoft.EntityFrameworkCore;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public DbSet<Workshop> Workshops { get; set; }
    public DbSet<Service> Services { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<User> Users { get; set; }
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
    }
}
