using System.Text.Json.Serialization;

namespace intelliGuideDashboard.Models
{
    public class Message 
    {
        [JsonPropertyName("message_id")]
        public required string MessageId { get; set; }
        [JsonPropertyName("conversation_id")]
        public required string ConversationId { get; set; }
        [JsonPropertyName("type")]
        public required string Type { get; set; }
        [JsonPropertyName("time")]
        public required DateTime Time { get; set; }
        [JsonPropertyName("body")]
        public required string Body { get; set; }
    }
}