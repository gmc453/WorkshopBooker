# Rate Limit Retry Logic Fix

## Problem
The rate limit retry logic in `useOptimisticMutation` and `useSmartQuery` hooks could cause infinite recursion when a 429 (rate limit) error occurred. The previous implementation would retry indefinitely without any safeguards.

## Solution
Implemented the following safeguards to prevent infinite recursion:

### 1. Maximum Retry Count
- Added `maxRetries` option (default: 3) to both hooks
- Retry counter tracks the number of attempts
- After reaching max retries, an error is thrown instead of retrying

### 2. Exponential Backoff
- Instead of using a fixed delay, implemented exponential backoff
- Delay calculation: `min(baseDelay * 2^retryCount, 30000)`
- Maximum delay capped at 30 seconds to prevent excessive waiting

### 3. Proper State Management
- Added `retryCountRef` to track retry attempts
- Retry count resets on successful requests
- Retry count resets on manual refetch
- Proper cleanup of timeouts on component unmount

## Usage

```typescript
// useOptimisticMutation
const { mutate } = useOptimisticMutation({
  mutationFn: yourMutationFunction,
  retryOnRateLimit: true,
  maxRetries: 3  // Optional, defaults to 3
});

// useSmartQuery
const { data } = useSmartQuery({
  queryFn: yourQueryFunction,
  retryOnRateLimit: true,
  maxRetries: 3  // Optional, defaults to 3
});
```

## Retry Behavior
When a 429 error occurs:
1. **First retry**: Wait for `retryAfterSeconds` from server response
2. **Second retry**: Wait for `retryAfterSeconds * 2`
3. **Third retry**: Wait for `retryAfterSeconds * 4`
4. **Fourth attempt**: Throw error "Rate limit exceeded. Max retries (3) reached."

## Benefits
- Prevents infinite recursion and stack overflow
- Reduces server load by limiting retry attempts
- Provides predictable behavior with exponential backoff
- Gives clear error messages when max retries are exceeded