using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkshopBooker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateServiceModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CarBrand",
                table: "Bookings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CarModel",
                table: "Bookings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerEmail",
                table: "Bookings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerName",
                table: "Bookings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerPhone",
                table: "Bookings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Bookings",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CarBrand",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CarModel",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CustomerEmail",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CustomerName",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CustomerPhone",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Bookings");
        }
    }
}
