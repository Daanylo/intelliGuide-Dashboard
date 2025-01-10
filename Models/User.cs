using System.Text.Json.Serialization;

namespace intelliGuideDashboard.Models;
    public class User
    {
        [JsonPropertyName("user_id")]
        public required string UserId { get; set; }
        [JsonPropertyName("username")]
        public required string Username { get; set; }
        [JsonPropertyName("name")]
        public string? Name { get; set; }
        [JsonPropertyName("place")]
        public string? Place { get; set; }
        [JsonPropertyName("image")]
        public string? Image { get; set; }
    }