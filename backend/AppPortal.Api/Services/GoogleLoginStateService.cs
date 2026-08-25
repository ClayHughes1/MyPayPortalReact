namespace AppPortal.Api.Services;

public class GoogleLoginStateService
{
    private readonly Dictionary<string, GoogleLoginState> _states = new();
    private readonly object _lock = new();

    public string Create(string token, int userId)
    {
        var code = Guid.NewGuid().ToString("N");
        Console.WriteLine($"Token:{token}\n UserId: {userId}\n Codel: {code}");

        lock (_lock)
        {
            _states[code] = new GoogleLoginState
            {
                Token = token,
                UserId = userId,
                ExpiresAt = DateTime.UtcNow.AddMinutes(1)
            };
        }

        return code;
    }

    public GoogleLoginState? Consume(string code)
    {
        lock (_lock)
        {
            if (!_states.TryGetValue(code, out var state))
                return null;

            _states.Remove(code);

            if (state.ExpiresAt < DateTime.UtcNow)
                return null;

            return state;
        }
    }
}

public class GoogleLoginState
{
    public string Token { get; set; } = string.Empty;
    public int UserId { get; set; }
    public DateTime ExpiresAt { get; set; }
}