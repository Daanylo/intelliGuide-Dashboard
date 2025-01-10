using System.Text.Json.Serialization;

namespace intelliGuideDashboard.Models
{
    public class Context {
        [JsonPropertyName("context_id")]
        public string? ContextId { get; set; }
        [JsonPropertyName("bot_id")]
        public string? BotId { get; set; }
        [JsonPropertyName("title")]
        public string? Title { get; set; }
        [JsonPropertyName("body")]
        public string? Body { get; set; }
        [JsonPropertyName("status")]
        public string? Status { get; set; }
    }
}