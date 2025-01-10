using System.Text.Json.Serialization;

namespace intelliGuideDashboard.Models
{
    public class Conversation 
    {
        [JsonPropertyName("conversation_id")]
        public required string ConversationId { get; set; }
        [JsonPropertyName("bot_id")]
        public required string BotId { get; set; }
        [JsonPropertyName("time")]
        public required DateTime Time { get; set; }
        [JsonPropertyName("review")]
        public int? Review { get; set; }
        [JsonPropertyName("comment")]
        public string? Comment { get; set; }
    }
}