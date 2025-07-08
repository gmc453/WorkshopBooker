using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkshopBooker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkshopStatusStartTimeIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_AvailableSlots_WorkshopId_Status_StartTime",
                table: "AvailableSlots",
                columns: new[] { "WorkshopId", "Status", "StartTime" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AvailableSlots_WorkshopId_Status_StartTime",
                table: "AvailableSlots");
        }
    }
}
