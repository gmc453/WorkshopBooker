using Microsoft.Extensions.Logging;
using WorkshopBooker.Application.Common.Interfaces;

namespace WorkshopBooker.Infrastructure.Services;

public class BackgroundJobService : IBackgroundJobService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<BackgroundJobService> _logger;

    public BackgroundJobService(IServiceProvider serviceProvider, ILogger<BackgroundJobService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public Task EnqueueAsync(Func<IServiceProvider, Task> job)
    {
        _ = Task.Run(() => ExecuteSafely(job));
        return Task.CompletedTask;
    }

    public Task ScheduleAsync(Func<IServiceProvider, Task> job, DateTimeOffset runAt)
    {
        var delay = runAt - DateTimeOffset.UtcNow;
        if (delay < TimeSpan.Zero)
            delay = TimeSpan.Zero;

        _ = Task.Delay(delay).ContinueWith(_ => ExecuteSafely(job));
        return Task.CompletedTask;
    }

    private async Task ExecuteSafely(Func<IServiceProvider, Task> job)
    {
        try
        {
            await job(_serviceProvider);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Background job failed");
        }
    }
}
