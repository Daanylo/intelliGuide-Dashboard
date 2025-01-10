using System.Text.Json.Serialization;

namespace intelliGuideDashboard.Models
{
    public class ReviewCountModel
    {
        [JsonPropertyName("review")]
        public int? Review { get; set; }
        [JsonPropertyName("count")]
        public int Count { get; set; }
    }
}