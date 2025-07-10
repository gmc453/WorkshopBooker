using System.Security.Claims;

namespace WorkshopBooker.Core.Authentication;

public interface ICurrentUserProvider
{
    ClaimsPrincipal? GetCurrentUser();
}
