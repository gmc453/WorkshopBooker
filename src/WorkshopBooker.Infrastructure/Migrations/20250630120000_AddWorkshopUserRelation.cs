using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkshopBooker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkshopUserRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "Workshops",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Workshops_UserId",
                table: "Workshops",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Workshops_Users_UserId",
                table: "Workshops",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Workshops_Users_UserId",
                table: "Workshops");

            migrationBuilder.DropIndex(
                name: "IX_Workshops_UserId",
                table: "Workshops");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Workshops");
        }
    }
} 