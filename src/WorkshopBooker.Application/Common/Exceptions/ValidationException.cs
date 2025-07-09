using System;
using System.Collections.Generic;

namespace WorkshopBooker.Application.Common.Exceptions;

public class ValidationException : Exception
{
    public List<string> ValidationErrors { get; }

    public ValidationException(string message, List<string> validationErrors)
        : base(message)
    {
        ValidationErrors = validationErrors;
    }
} 