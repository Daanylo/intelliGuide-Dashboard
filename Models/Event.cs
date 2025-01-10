using System.Text.Json.Serialization;

namespace intelliGuideDashboard.Models
{
    public class Event
    {
        [JsonPropertyName("event_id")]
        public required string Id { get; set; }
        [JsonPropertyName("user_id")]
        public string? UserId { get; set; }
        [JsonPropertyName("name")]
        public string? Name { get; set; }
        [JsonPropertyName("description")]
        public string? Description { get; set; }
        [JsonPropertyName("address")]
        public string? Address { get; set; }
        [JsonPropertyName("place")]
        public string? Place { get; set; }
        [JsonPropertyName("time")]
        public DateTime? Date { get; set; }
    }
}