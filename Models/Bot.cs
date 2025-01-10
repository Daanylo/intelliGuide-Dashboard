using System.Text.Json.Serialization;

namespace intelliGuideDashboard.Models;

public class Bot {
    [JsonPropertyName("bot_id")]
    public required string BotId { get; set; }
    [JsonPropertyName("user_id")]
    public string? UserId { get; set; }
    [JsonPropertyName("event_id")]
    public string? EventId { get; set; }
    [JsonPropertyName("name")]
    public string? Name { get; set; }
    [JsonPropertyName("avatar")]
    public string? Avatar { get; set; }
    [JsonPropertyName("style")]
    public string? Style { get; set; }
    [JsonPropertyName("voice")]
    public string? Voice { get; set; }
    [JsonPropertyName("greeting")]
    public string? Greeting { get; set; }
    [JsonPropertyName("location")]
    public string? Location { get; set; }
    [JsonPropertyName("status")]
    public string? Status { get; set; }
}