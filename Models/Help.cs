using System.Text.Json.Serialization;

namespace intelliGuideDashboard.Models
{
    public class Help
    {
        [JsonPropertyName("help_id")]
        public required string Id { get; set; }
        [JsonPropertyName("bot_id")]
        public required string BotId { get; set; }
        [JsonPropertyName("message")]
        public string? Message { get; set; }
        [JsonPropertyName("time")]
        public DateTime Time { get; set; }
        [JsonPropertyName("opened")]
        public required string Opened { get; set; }
    }
}