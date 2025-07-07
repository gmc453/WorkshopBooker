using System;
using System.Threading.Tasks;

namespace WorkshopBooker.Application.Common.Interfaces;

public interface IBackgroundJobService
{
    Task EnqueueAsync(Func<IServiceProvider, Task> job);
    Task ScheduleAsync(Func<IServiceProvider, Task> job, DateTimeOffset runAt);
}
