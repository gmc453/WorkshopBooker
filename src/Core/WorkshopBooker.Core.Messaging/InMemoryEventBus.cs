using System.Collections.Concurrent;
using WorkshopBooker.Core.Common;

namespace WorkshopBooker.Core.Messaging;

public class InMemoryEventBus : IEventBus
{
    private readonly ConcurrentDictionary<Type, List<Func<IEvent, Task>>> _handlers = new();

    public Task PublishAsync<T>(T @event) where T : IEvent
    {
        if (_handlers.TryGetValue(typeof(T), out var handlers))
        {
            var tasks = handlers.Select(h => h(@event));
            return Task.WhenAll(tasks);
        }
        return Task.CompletedTask;
    }

    public void Subscribe<T>(Func<T, Task> handler) where T : IEvent
    {
        var list = _handlers.GetOrAdd(typeof(T), _ => new List<Func<IEvent, Task>>());
        list.Add(e => handler((T)e));
    }
}
