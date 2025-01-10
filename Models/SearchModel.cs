using System.Text.Json.Serialization;

namespace intelliGuideDashboard.Models
{
    public class SearchModel()
    {
        [JsonPropertyName("conversation_id")]
        public string? ConversationId { get; set; }
        [JsonPropertyName("review")]
        public int[]? Review { get; set; }
        [JsonPropertyName("date_from")]
        public DateTime? DateFrom { get; set; }
        [JsonPropertyName("date_to")]
        public DateTime? DateTo { get; set; }
        [JsonPropertyName("text")]
        public string? Text { get; set; }
    }
}