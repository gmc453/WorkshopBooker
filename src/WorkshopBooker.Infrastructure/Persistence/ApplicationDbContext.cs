// src/WorkshopBooker.Infrastructure/Persistence/ApplicationDbContext.cs

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Domain.Entities;
using System.Text.Json;

namespace WorkshopBooker.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public DbSet<Workshop> Workshops { get; set; }
    public DbSet<Service> Services { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<AvailableSlot> AvailableSlots { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<RentalReservation> RentalReservations { get; set; }
    
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // ValueConverter dla List<string>
        var listConverter = new ValueConverter<List<string>, string>(
            v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
            v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>());
        
        // Konfiguracja User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.HashedPassword).IsRequired();
            entity.Property(e => e.Role).IsRequired().HasMaxLength(20);
            entity.Property(e => e.CreatedAt).IsRequired();
        });

        // Konfiguracja Workshop
        modelBuilder.Entity<Workshop>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.IsActive).IsRequired();
        });

        // Konfiguracja Service
        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Price).IsRequired().HasColumnType("decimal(18,2)");
            entity.Property(e => e.RequiredEquipment).HasConversion(listConverter);
            entity.Property(e => e.IsActive).IsRequired();
        });

        // Konfiguracja AvailableSlot
        modelBuilder.Entity<AvailableSlot>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.StartTime).IsRequired();
            entity.Property(e => e.EndTime).IsRequired();
            entity.Property(e => e.RowVersion).IsRowVersion();
        });

        // Konfiguracja Booking
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
        });

        // Konfiguracja Review
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Rating).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.IsVerified).IsRequired();
            
            // Relacje
            entity.HasOne(e => e.Booking)
                .WithMany()
                .HasForeignKey(e => e.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.Workshop)
                .WithMany()
                .HasForeignKey(e => e.WorkshopId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Konfiguracja Vehicle
        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Make).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Model).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LicensePlate).IsRequired().HasMaxLength(20);
        });

        // Konfiguracja RentalReservation
        modelBuilder.Entity<RentalReservation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.StartDate).IsRequired();
            entity.Property(e => e.EndDate).IsRequired();

            entity.HasOne(e => e.Vehicle)
                .WithMany()
                .HasForeignKey(e => e.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Indeksy dla lepszej wydajności
        modelBuilder.Entity<Workshop>()
            .HasIndex(e => e.Name);
        
        modelBuilder.Entity<Service>()
            .HasIndex(e => e.WorkshopId);

        modelBuilder.Entity<Service>()
            .HasIndex(e => e.IsActive);
        
        modelBuilder.Entity<AvailableSlot>()
            .HasIndex(e => new { e.WorkshopId, e.StartTime });

        modelBuilder.Entity<AvailableSlot>()
            .HasIndex(e => e.Status);
        
        modelBuilder.Entity<AvailableSlot>()
            .HasIndex(e => new { e.WorkshopId, e.Status, e.StartTime });
        
        modelBuilder.Entity<Booking>()
            .HasIndex(e => new { e.UserId, e.Status });

        modelBuilder.Entity<Booking>()
            .HasIndex(e => e.CreatedAt);
            
        modelBuilder.Entity<Review>()
            .HasIndex(e => new { e.WorkshopId, e.CreatedAt });
            
        modelBuilder.Entity<Review>()
            .HasIndex(e => e.BookingId)
            .IsUnique();

        modelBuilder.Entity<Vehicle>()
            .HasIndex(e => e.Status);

        modelBuilder.Entity<RentalReservation>()
            .HasIndex(e => new { e.VehicleId, e.StartDate });
    }
}
