namespace WorkshopBooker.Core.Common;

public class ServiceResult<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public string? Error { get; init; }
    public List<string> Warnings { get; init; }

    private ServiceResult(bool success, T? data, string? error, List<string> warnings)
    {
        Success = success;
        Data = data;
        Error = error;
        Warnings = warnings;
    }

    public static ServiceResult<T> Ok(T data) => new(true, data, null, new());
    public static ServiceResult<T> Fail(string error) => new(false, default, error, new());
    public static ServiceResult<T> Warn(T data, List<string> warnings) => new(true, data, null, warnings);
}
