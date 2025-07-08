using Microsoft.Extensions.Logging;
using WorkshopBooker.Application.Common.Interfaces;
using System.Collections.Concurrent;

namespace WorkshopBooker.Infrastructure.Services;

public class BackgroundJobService : IBackgroundJobService, IDisposable
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<BackgroundJobService> _logger;
    private readonly ConcurrentQueue<Task> _runningTasks = new();
    private bool _disposed = false;

    public BackgroundJobService(IServiceProvider serviceProvider, ILogger<BackgroundJobService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task EnqueueAsync(Func<IServiceProvider, Task> job)
    {
        var task = Task.Run(() => ExecuteSafely(job));
        _runningTasks.Enqueue(task);
        
        _ = task.ContinueWith(t => CleanupCompletedTasks(), TaskContinuationOptions.ExecuteSynchronously);
        
        await Task.CompletedTask;
    }

    public async Task ScheduleAsync(Func<IServiceProvider, Task> job, DateTimeOffset runAt)
    {
        var delay = runAt - DateTimeOffset.UtcNow;
        if (delay < TimeSpan.Zero)
            delay = TimeSpan.Zero;

        var task = Task.Delay(delay).ContinueWith(_ => ExecuteSafely(job), TaskContinuationOptions.ExecuteSynchronously);
        _runningTasks.Enqueue(task);
        
        _ = task.ContinueWith(t => CleanupCompletedTasks(), TaskContinuationOptions.ExecuteSynchronously);
        
        await Task.CompletedTask;
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

    private void CleanupCompletedTasks()
    {
        try
        {
            var remainingTasks = new ConcurrentQueue<Task>();
            while (_runningTasks.TryDequeue(out var task))
            {
                if (!task.IsCompleted)
                {
                    remainingTasks.Enqueue(task);
                }
            }
            
            while (remainingTasks.TryDequeue(out var task))
            {
                _runningTasks.Enqueue(task);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error during task cleanup");
        }
    }

    public void Dispose()
    {
        if (!_disposed)
        {
            try
            {
                var runningTasks = _runningTasks.Where(t => !t.IsCompleted).ToArray();
                if (runningTasks.Length > 0)
                {
                    Task.WaitAll(runningTasks, TimeSpan.FromSeconds(30));
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error during disposal of background job service");
            }
            finally
            {
                _disposed = true;
            }
        }
    }
}
