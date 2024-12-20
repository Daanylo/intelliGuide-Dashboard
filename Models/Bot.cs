namespace intelliGuideDashboard.Models;

public class Bot {
    public required string bot_id { get; set; }
    public string? user_id { get; set; }
    public string? event_id { get; set; }
    public string? name { get; set; }
    public string? avatar { get; set; }
    public string? style { get; set; }
    public string? location { get; set; }
}