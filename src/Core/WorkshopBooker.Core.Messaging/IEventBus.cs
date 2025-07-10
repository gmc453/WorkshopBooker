using WorkshopBooker.Core.Common;

namespace WorkshopBooker.Core.Messaging;

public interface IEventBus
{
    Task PublishAsync<T>(T @event) where T : IEvent;
    void Subscribe<T>(Func<T, Task> handler) where T : IEvent;
}
