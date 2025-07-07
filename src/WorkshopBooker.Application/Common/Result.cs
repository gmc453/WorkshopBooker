namespace WorkshopBooker.Application.Common;

public sealed class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }
    public List<string> ValidationErrors { get; }

    private Result(bool isSuccess, T? value, string? error = null, List<string>? validationErrors = null)
    {
        IsSuccess = isSuccess;
        Value = value;
        Error = error;
        ValidationErrors = validationErrors ?? new List<string>();
    }

    public static Result<T> Success(T value) => new(true, value);
    public static Result<T> Failure(string error) => new(false, default, error);
    public static Result<T> ValidationFailure(List<string> errors) => new(false, default, "Validation failed", errors);

    public Result<TNew> Map<TNew>(Func<T, TNew> mapper)
    {
        return IsSuccess && Value != null 
            ? Result<TNew>.Success(mapper(Value)) 
            : Result<TNew>.Failure(Error ?? "Unknown error");
    }
}

public sealed class Result
{
    public bool IsSuccess { get; }
    public string? Error { get; }
    public List<string> ValidationErrors { get; }

    private Result(bool isSuccess, string? error = null, List<string>? validationErrors = null)
    {
        IsSuccess = isSuccess;
        Error = error;
        ValidationErrors = validationErrors ?? new List<string>();
    }

    public static Result Success() => new(true);
    public static Result Failure(string error) => new(false, error);
    public static Result ValidationFailure(List<string> errors) => new(false, "Validation failed", errors);
} 