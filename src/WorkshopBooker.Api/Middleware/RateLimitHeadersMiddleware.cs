using System.Threading.RateLimiting;

namespace WorkshopBooker.Api.Middleware;

public class RateLimitHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public RateLimitHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        await _next(context);

        // Dodaj rate limit headers do odpowiedzi
        if (context.Response.Headers.ContainsKey("X-RateLimit-Limit"))
        {
            var limit = context.Response.Headers["X-RateLimit-Limit"].ToString();
            var remaining = context.Response.Headers["X-RateLimit-Remaining"].ToString();
            var reset = context.Response.Headers["X-RateLimit-Reset"].ToString();

            // Dodaj dodatkowe informacje dla frontendu
            context.Response.Headers["X-RateLimit-Policy"] = GetPolicyFromEndpoint(context.Request.Path, context.Request.Method);
            context.Response.Headers["X-RateLimit-Reset-Seconds"] = reset;
            
            // Dodaj informację o typie operacji
            var operationType = GetOperationType(context.Request.Path, context.Request.Method);
            context.Response.Headers["X-RateLimit-Operation-Type"] = operationType;
        }
    }

    private static string GetPolicyFromEndpoint(string path, string method)
    {
        // Mapowanie endpointów na polityki rate limiting
        if (path.StartsWith("/api/analytics") || path.Contains("/analytics"))
        {
            return "AnalyticsPolicy";
        }
        
        if (method == "GET" && (path.StartsWith("/api/workshops") || path.StartsWith("/api/services") || path.StartsWith("/api/slots")))
        {
            return "ReadPolicy";
        }
        
        if (method == "POST" && path.StartsWith("/api/bookings"))
        {
            return "CriticalPolicy";
        }
        
        if (method == "PUT" || method == "DELETE" || method == "PATCH")
        {
            return "WritePolicy";
        }
        
        return "ReadPolicy"; // Domyślna polityka
    }

    private static string GetOperationType(string path, string method)
    {
        if (path.StartsWith("/api/analytics"))
        {
            return "analytics";
        }
        
        if (method == "GET")
        {
            return "read";
        }
        
        if (method == "POST" && path.StartsWith("/api/bookings"))
        {
            return "critical";
        }
        
        if (method == "POST" || method == "PUT" || method == "DELETE" || method == "PATCH")
        {
            return "write";
        }
        
        return "read";
    }
} 