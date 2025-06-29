using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkshopBooker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAvailableSlots : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AvailableSlots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    WorkshopId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AvailableSlots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AvailableSlots_Workshops_WorkshopId",
                        column: x => x.WorkshopId,
                        principalTable: "Workshops",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AvailableSlots_WorkshopId",
                table: "AvailableSlots",
                column: "WorkshopId");

            migrationBuilder.DropColumn(
                name: "BookingDateTime",
                table: "Bookings");

            migrationBuilder.AddColumn<Guid>(
                name: "SlotId",
                table: "Bookings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_SlotId",
                table: "Bookings",
                column: "SlotId");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_AvailableSlots_SlotId",
                table: "Bookings",
                column: "SlotId",
                principalTable: "AvailableSlots",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_AvailableSlots_SlotId",
                table: "Bookings");

            migrationBuilder.DropTable(
                name: "AvailableSlots");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_SlotId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "SlotId",
                table: "Bookings");

            migrationBuilder.AddColumn<DateTime>(
                name: "BookingDateTime",
                table: "Bookings",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(0));
        }
    }
}
