using WorkshopBooker.Domain.Entities;

namespace WorkshopBooker.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
