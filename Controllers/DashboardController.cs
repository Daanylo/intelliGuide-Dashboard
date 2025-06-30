using intelliGuideDashboard.Models;
using Microsoft.AspNetCore.Mvc;
using intelliGuideDashboard.Filters;
using System.Text.Json;
using System.Text;
using System.Text.Json.Serialization;

namespace intelliGuideDashboard.Controllers
{
    [ServiceFilter(typeof(SessionCheckFilter))]
    public class DashboardController(ILogger<DashboardController> logger, HttpClient httpClient, IConfiguration configuration) : Controller
    {
        private readonly ILogger<DashboardController> logger = logger;
        private readonly HttpClient httpClient = httpClient;
        private readonly IConfiguration configuration = configuration;

        public IActionResult Status()
        {
            return View();
        }

        public IActionResult Context()
        {
            return View();
        }

        public IActionResult Settings()
        {
            return View();
        }

        public IActionResult Events()
        {
            return View();
        }

        public IActionResult Search()
        {
            return View();
        }

        public IActionResult Notifications()
        {
            return View();
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return Ok(new { Message = "Logout successful" });
        }

        public async Task<IActionResult> GetUser()
        {
            var userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Message = "Unauthorized" });
            }

            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var request = new HttpRequestMessage(HttpMethod.Get, $"{apiAddress}/api/user/{userId}");
            request.Headers.Add("x-api-key", apiKey);

            var response = await httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                return BadRequest(new { Message = "GetUser failed", Error = error });
            } else {
                var result = await response.Content.ReadAsStringAsync();
                var user = JsonSerializer.Deserialize<User>(result);
                return Ok(new { Message = "GetUser successful", Data = user });
            }
        }

        public async Task<IActionResult> GetBots()
        {
            var UserId = HttpContext.Session.GetString("UserId");
            logger.LogInformation("UserId: {UserId}", UserId);
            if (string.IsNullOrEmpty(UserId))
            {
                return Unauthorized(new { Message = "Unauthorized" });
            }
            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var request = new HttpRequestMessage(HttpMethod.Get, $"{apiAddress}/api/bots/{UserId}");
            request.Headers.Add("x-api-key", apiKey);
            
            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                var bots = JsonSerializer.Deserialize<List<Bot>>(result);
                return Ok(new { Message = "GetBots successful", Data = bots });
            } else {
                var error = await response.Content.ReadAsStringAsync();
                return BadRequest(new { Message = "GetBots failed", Error = error });
            }
        }

        [HttpPost]
        public IActionResult SetActiveBot([FromBody] JsonElement data)
        {
            if (!data.TryGetProperty("botId", out JsonElement botIdElement))
            {
                return BadRequest(new { Message = "botId not provided." });
            }

            string? botId = botIdElement.GetString();

            if (string.IsNullOrEmpty(botId))
            {
                return BadRequest(new { Message = "Invalid botId." });
            }

            logger.LogInformation("Active bot set to: {botId}", botId);
            HttpContext.Session.SetString("BotId", botId);
            return Ok(new { Message = $"Set current bot to {botId} successful" });
        }

        public async Task<IActionResult> GetActiveBot()
        {
            var botId = HttpContext.Session.GetString("BotId");
            logger.LogInformation("BotId: {botId}", botId);
            if (string.IsNullOrEmpty(botId))
            {
                return Ok(new { Message = "Active bot not found" });
            }
            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var request = new HttpRequestMessage(HttpMethod.Get, $"{apiAddress}/api/bot/{botId}");
            request.Headers.Add("x-api-key", apiKey);
            
            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                var bot = JsonSerializer.Deserialize<Bot>(result);
                return Ok(new { Message = "Bot request successful", Data = bot });
            } else {
                var error = await response.Content.ReadAsStringAsync();
                return BadRequest(new { Message = "Bot request failed", Error = error });
            }
        }

        public async Task<IActionResult> GetBotProperty([FromBody] JsonElement data)
        {
            if (!data.TryGetProperty("property", out JsonElement propertyElement))
            {
                return BadRequest(new { Message = "property not provided." });
            }

            string? property = propertyElement.GetString();

            if (string.IsNullOrEmpty(property))
            {
                return BadRequest(new { Message = "Invalid property." });
            }

            var botId = HttpContext.Session.GetString("BotId");

            if (data.TryGetProperty("botId", out JsonElement botIdElement))
            {
                if (!string.IsNullOrEmpty(botIdElement.GetString()))
                {
                    botId = botIdElement.GetString();
                }
            }
            if (string.IsNullOrEmpty(botId))
            {
                return NotFound(new { Message = "Active bot not found" });
            }

            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var request = new HttpRequestMessage(HttpMethod.Get, $"{apiAddress}/api/bot/{botId}/{property}");
            request.Headers.Add("x-api-key", apiKey);
            
            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                return Ok(new { Message = "Bot property request successful", Data = result });
            } else {
                var error = await response.Content.ReadAsStringAsync();
                return BadRequest(new { Message = "Bot property request failed", Error = error });
            }
        }

        public async Task<IActionResult> GetActivity()
        {
            var botId = HttpContext.Session.GetString("BotId");
            if (string.IsNullOrEmpty(botId))
            {
            return NotFound(new { Message = "Active bot not found" });
            }
            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var request = new HttpRequestMessage(HttpMethod.Get, $"{apiAddress}/api/activity/{botId}");
            request.Headers.Add("x-api-key", apiKey);

            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
            var result = await response.Content.ReadAsStringAsync();
            try
            {
                var activity = JsonSerializer.Deserialize<object>(result);
                return Ok(new { Message = "Activity request successful", Data = activity });
            }
            catch
            {
                return Ok(new { Message = "Activity request successful", Raw = result });
            }
            }
            else
            {
            var error = await response.Content.ReadAsStringAsync();
            return BadRequest(new { Message = "Activity request failed", Error = error });
            }
        }

        public async Task<IActionResult> GetReviews()
        {
            var botId = HttpContext.Session.GetString("BotId");
            if (string.IsNullOrEmpty(botId))
            {
                return NotFound(new { Message = "Active bot not found" });
            }
            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var request = new HttpRequestMessage(HttpMethod.Get, $"{apiAddress}/api/reviews/{botId}");
            request.Headers.Add("x-api-key", apiKey);

            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();

                var reviews = JsonSerializer.Deserialize<List<ReviewCountModel>>(result);
                return Ok(new { Message = "Reviews request successful", Data = reviews });
            } else {
                var error = await response.Content.ReadAsStringAsync();
                return BadRequest(new { Message = "Reviews request failed", Error = error });
            }
        }

        public async Task<IActionResult> GetConversationCount()
        {
            var botId = HttpContext.Session.GetString("BotId");
            if (string.IsNullOrEmpty(botId))
            {
            return NotFound(new { Message = "Active bot not found" });
            }
            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var request = new HttpRequestMessage(HttpMethod.Get, $"{apiAddress}/api/conversation/count/{botId}");
            request.Headers.Add("x-api-key", apiKey);

            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
            var result = await response.Content.ReadAsStringAsync();
            var count = JsonSerializer.Deserialize<JsonElement>(result).GetProperty("count").GetInt32();
            return Ok(count);
            }
            else
            {
            var error = await response.Content.ReadAsStringAsync();
            return BadRequest(new { Message = "Conversation count request failed", Error = error });
            }
        }

        public async Task<IActionResult> GetConversations()
        {
            var botId = HttpContext.Session.GetString("BotId");
            if (string.IsNullOrEmpty(botId))
            {
                return NotFound(new { Message = "Active bot not found" });
            }
            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var request = new HttpRequestMessage(HttpMethod.Get, $"{apiAddress}/api/conversations/{botId}/10");
            request.Headers.Add("x-api-key", apiKey );

            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                var conversations = JsonSerializer.Deserialize<List<Conversation>>(result);
                if (conversations == null)
                {
                    return NotFound(new { Message = "Conversations not found" });
                }
                conversations = [.. conversations.OrderByDescending(c => c.Time)];
                return Ok(new { Message = "Conversations request successful", Data = conversations });
            } else {
                var error = await response.Content.ReadAsStringAsync();
                return BadRequest(new { Message = "Conversations request failed", Error = error });
            }
        }

        public async Task<IActionResult> SearchConversations([FromBody] JsonElement data)
        {
            var searchModel = JsonSerializer.Deserialize<SearchModel>(data.GetRawText());
            logger.LogInformation("SearchModel as JSON: {json}", JsonSerializer.Serialize(searchModel));
            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var request = new HttpRequestMessage(HttpMethod.Post, $"{apiAddress}/api/conversation/search");
            request.Headers.Add("x-api-key", apiKey);
            request.Content = new StringContent(JsonSerializer.Serialize(searchModel), Encoding.UTF8, "application/json");

            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                if (string.IsNullOrEmpty(result))
                {
                    return NotFound(new { Message = "Conversation not found" });
                }
                var conversation = JsonSerializer.Deserialize<List<Conversation>>(result);
                return Ok(new { Message = "Conversation request successful", Data = conversation });
            } else {
                var error = await response.Content.ReadAsStringAsync();
                return BadRequest(new { Message = "Conversation request failed", Error = error });
            }
        }

        public async Task<IActionResult> GetNotifications()
        {
            var userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Message = "Unauthorized" });
            }
            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var request = new HttpRequestMessage(HttpMethod.Get, $"{apiAddress}/api/help/{userId}");
            request.Headers.Add("x-api-key", apiKey);

            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                var notifications = JsonSerializer.Deserialize<List<Help>>(result);
                if (notifications == null)
                {
                    return NotFound(new { Message = "Notifications not found" });
                }
                return Ok(new { Message = "Notifications request successful", Data = notifications });
            } else {
                var error = await response.Content.ReadAsStringAsync();
                return BadRequest(new { Message = "Notifications request failed", Error = error });
            }
        }

        public async Task<IActionResult> DeleteConversation([FromBody] JsonElement data)
        {
            var conversationId = data.GetProperty("conversationId").GetString();
            if (string.IsNullOrEmpty(conversationId))
            {
                return NotFound(new { Message = "Conversation not found" });
            }

            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var request = new HttpRequestMessage(HttpMethod.Delete, $"{apiAddress}/api/conversation/{conversationId}");
            request.Headers.Add("x-api-key", apiKey);

            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                return Ok(new { Message = "Conversation delete successful" });
            }
            else
            {
                var error = await response.Content.ReadAsStringAsync();
                return BadRequest(new { Message = "Conversation delete failed", Error = error });
            }
        }

        public async Task<IActionResult> GetMessages([FromBody] JsonElement data)
        {
            if (!data.TryGetProperty("conversationId", out JsonElement conversationIdElement))
            {
                return BadRequest(new { Message = "conversationId not provided." });
            }

            string? conversationId = conversationIdElement.GetString();

            if (string.IsNullOrEmpty(conversationId))
            {
                return BadRequest(new { Message = "Invalid conversationId." });
            }

            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var request = new HttpRequestMessage(HttpMethod.Get, $"{apiAddress}/api/messages/{conversationId}");
            request.Headers.Add("x-api-key", apiKey);

            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                var messages = JsonSerializer.Deserialize<List<Message>>(result);
                if (messages == null)
                {
                    return NotFound(new { Message = "Messages not found" });
                }
                var sortedMessages = messages
                    .OrderBy(m => m.Time)
                    .ThenBy(m => m.Type == "question" ? 0 : 1) 
                    .ToArray();
                return Ok(new { Message = "Messages request successful", Data = sortedMessages });
            } else {
                var error = await response.Content.ReadAsStringAsync();
                return BadRequest(new { Message = "Messages request failed", Error = error });
            }
        }

        public async Task<IActionResult> GetUnansweredQuestions()
        {
            var botId = HttpContext.Session.GetString("BotId");
            if (string.IsNullOrEmpty(botId))
            {
                return NotFound(new { Message = "Active bot not found" });
            }
            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var request = new HttpRequestMessage(HttpMethod.Get, $"{apiAddress}/api/unanswered/{botId}");
            request.Headers.Add("x-api-key", apiKey);

            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                var questions = JsonSerializer.Deserialize<List<Message>>(result);
                if (questions == null)
                {
                    return NotFound(new { Message = "Unanswered questions not found" });
                }
                var sortedQuestions = questions
                    .OrderByDescending(q => q.Time)
                    .ToArray();
                return Ok(new { Message = "Unanswered questions request successful", Data = sortedQuestions });
            } else {
                var error = await response.Content.ReadAsStringAsync();
                return BadRequest(new { Message = "Unanswered questions request failed", Error = error });
            }
        }

        public async Task<IActionResult> GetContexts()
        {
            var botId = HttpContext.Session.GetString("BotId");
            if (string.IsNullOrEmpty(botId))
            {
                return NotFound(new { Message = "Active bot not found" });
            }
            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var request = new HttpRequestMessage(HttpMethod.Get, $"{apiAddress}/api/contexts/{botId}");
            request.Headers.Add("x-api-key", apiKey);

            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                var contexts = JsonSerializer.Deserialize<List<Context>>(result);
                if (contexts == null)
                {
                    return NotFound(new { Message = "Contexts not found" });
                }
                return Ok(new { Message = "Contexts request successful", Data = contexts });
            } else {
                var error = await response.Content.ReadAsStringAsync();
                return BadRequest(new { Message = "Contexts request failed", Error = error });
            }
        }

        public async Task<IActionResult> GetContext([FromBody] JsonElement data)
        {
            if (!data.TryGetProperty("contextId", out JsonElement contextIdElement))
            {
                return BadRequest(new { Message = "contextId not provided." });
            }

            string? contextId = contextIdElement.GetString();

            if (string.IsNullOrEmpty(contextId))
            {
                return BadRequest(new { Message = "Invalid contextId." });
            }

            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var request = new HttpRequestMessage(HttpMethod.Get, $"{apiAddress}/api/context/{contextId}");
            request.Headers.Add("x-api-key", apiKey);

            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                try {
                    var context = JsonSerializer.Deserialize<Context>(result);
                    if (context == null)
                    {
                        return NotFound(new { Message = "Context not found" });
                    }
                    return Ok(new { Message = "Context request successful", Data = context });
                } catch (JsonException e) {
                    logger.LogInformation("Content received: {content}", result);
                    return BadRequest(new { Message = "Context request failed", Error = e.Message });
                }
            } else {
                var error = await response.Content.ReadAsStringAsync();
                return BadRequest(new { Message = "Context request failed", Error = error });
            }
        }

        public async Task<IActionResult> SaveContext([FromBody] JsonElement data)
        {
            if (!data.TryGetProperty("body", out JsonElement bodyElement) ||
            !data.TryGetProperty("title", out JsonElement titleElement) ||
            !data.TryGetProperty("activate", out JsonElement activateElement))
            {
                logger.LogInformation("Data received: {data}", data);
                return BadRequest(new { Message = "Context, title, or activate not provided." });
            }

            string? body = bodyElement.GetString();
            string? title = titleElement.GetString();
            string status = activateElement.GetBoolean() ? "active" : "inactive";

            if (string.IsNullOrEmpty(body) || string.IsNullOrEmpty(title))
            {
                return BadRequest(new { Message = "Invalid context or title." });
            }

            var botId = HttpContext.Session.GetString("BotId");
            if (string.IsNullOrEmpty(botId))
            {
                return NotFound(new { Message = "Active bot not found" });
            }

            data.TryGetProperty("context_id", out JsonElement contextIdElement);
            string contextId = contextIdElement.GetString() ?? HttpContext.Session.GetString("EditingContext") ?? Guid.NewGuid().ToString();

            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var contextData = new Context
            {
            ContextId = contextId,
            BotId = botId,
            Body = body,
            Title = title,
            Status = status
            };

            var request = new HttpRequestMessage(HttpMethod.Post, $"{apiAddress}/api/context")
            {
            Headers = { { "x-api-key", apiKey } },
            Content = new StringContent(JsonSerializer.Serialize(contextData), Encoding.UTF8, "application/json")
            };

            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
            return Ok(new { Message = "Context save successful" });
            }
            else
            {
            var error = await response.Content.ReadAsStringAsync();
            return BadRequest(new { Message = "Context save failed", Error = error });
            }
        }

        public IActionResult SetEditingContext([FromBody] JsonElement data)
        {
            if (!data.TryGetProperty("contextId", out JsonElement contextIdElement))
            {
                return BadRequest(new { Message = "contextId not provided." });
            }

            string? contextId = contextIdElement.GetString();

            if (string.IsNullOrEmpty(contextId))
            {
                HttpContext.Session.Remove("EditingContext");
                return Ok(new { Message = "Editing context set to null." });
            }

            HttpContext.Session.SetString("EditingContext", contextId);
            return Ok(new { Message = "Editing context set successful" });
        }

        public IActionResult GetEditingContext()
        {
            string? contextId = HttpContext.Session.GetString("EditingContext");

            if (string.IsNullOrEmpty(contextId))
            {
                return Ok(new { Message = "Editing context not found" });
            }

            return Ok(new { Message = "Editing context found", Data = contextId });
        }

        public async Task<IActionResult> DeleteContext([FromBody] JsonElement data) {
            var contextId = data.GetProperty("contextId").GetString();
            if (string.IsNullOrEmpty(contextId))
            {
                return NotFound(new { Message = "Editing context not found" });
            }

            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var request = new HttpRequestMessage(HttpMethod.Delete, $"{apiAddress}/api/context/{contextId}");
            request.Headers.Add("x-api-key", apiKey);

            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                return Ok(new { Message = "Context delete successful" });
            }
            else
            {
                var error = await response.Content.ReadAsStringAsync();
                return BadRequest(new { Message = "Context delete failed", Error = error });
            }
        }

        public async Task<IActionResult> GetEvents()
        {
            var userId = HttpContext.Session.GetString("UserId");

            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var request = new HttpRequestMessage(HttpMethod.Get, $"{apiAddress}/api/events/{userId}");
            request.Headers.Add("x-api-key", apiKey);

            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                var events = JsonSerializer.Deserialize<List<Event>>(result);
                if (events == null)
                {
                    return NotFound(new { Message = "Events not found" });
                }
                return Ok(new { Message = "Events request successful", Data = events });
            } else {
                var error = await response.Content.ReadAsStringAsync();
                return BadRequest(new { Message = "Events request failed", Error = error });
            }
        }

        public IActionResult SetEditingEvent([FromBody] JsonElement data)
        {
            if (!data.TryGetProperty("eventId", out JsonElement eventIdElement))
            {
                return BadRequest(new { Message = "eventId not provided." });
            }

            string? eventId = eventIdElement.GetString();

            if (string.IsNullOrEmpty(eventId))
            {
                HttpContext.Session.Remove("EditingEvent");
                return Ok(new { Message = "Editing event set to null." });
            }

            HttpContext.Session.SetString("EditingEvent", eventId);
            return Ok(new { Message = "Editing event set successful" });
        }

        public async Task<IActionResult> GetEditingEvent()
        {
            string? eventId = HttpContext.Session.GetString("EditingEvent");

            if (string.IsNullOrEmpty(eventId))
            {
                return Ok(new { Message = "Editing event not found" });
            }

            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var request = new HttpRequestMessage(HttpMethod.Get, $"{apiAddress}/api/eventbyid/{eventId}");
            request.Headers.Add("x-api-key", apiKey);

            var response = await httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                return BadRequest(new { Message = "GetEditingEvent failed", Error = error });
            } else {
                var result = await response.Content.ReadAsStringAsync();
                var @event = JsonSerializer.Deserialize<Event>(result);
                return Ok(new { Message = "GetEditingEvent successful", Data = @event });
            }
        }

        public async Task<IActionResult> SaveEvent([FromBody] JsonElement data)
        {
            var userId = HttpContext.Session.GetString("UserId");
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Message = "Unauthorized" });
            }

            var eventId = HttpContext.Session.GetString("EditingEvent");
            if (string.IsNullOrEmpty(eventId))
            {
                eventId = Guid.NewGuid().ToString();
            }

            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var eventData = new Event
            {
                Id = eventId,
                UserId = userId,
                Name = data.GetProperty("name").GetString(),
                Description = data.GetProperty("description").GetString(),
                Address = data.GetProperty("address").GetString(),
                Place = data.GetProperty("place").GetString(),
                Date = data.GetProperty("time").GetDateTime()
            };

            var request = new HttpRequestMessage(HttpMethod.Post, $"{apiAddress}/api/event")
            {
                Headers = { { "x-api-key", apiKey } },
                Content = new StringContent(JsonSerializer.Serialize(eventData), Encoding.UTF8, "application/json")
            };

            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                return Ok(new { Message = "Event save successful" });
            }
            else
            {
                var error = await response.Content.ReadAsStringAsync();
                return BadRequest(new { Message = "Event save failed", Error = error });
            }
        }

        public async Task<IActionResult> DeleteEvent([FromBody] JsonElement data)
        {
            var eventId = data.GetProperty("eventId").GetString();
            if (string.IsNullOrEmpty(eventId))
            {
                return NotFound(new { Message = "Editing event not found" });
            }

            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var request = new HttpRequestMessage(HttpMethod.Delete, $"{apiAddress}/api/event/{eventId}");
            request.Headers.Add("x-api-key", apiKey);

            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                return Ok(new { Message = "Event delete successful" });
            }
            else
            {
                var error = await response.Content.ReadAsStringAsync();
                return BadRequest(new { Message = "Event delete failed", Error = error });
            }
        }

        public async Task<IActionResult> SaveBot([FromBody] JsonElement data)
        {
            var userId = HttpContext.Session.GetString("UserId");
            var botId = HttpContext.Session.GetString("BotId");
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(botId))
            {
                return Unauthorized(new { Message = "Unauthorized" });
            }

            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var botData = new Bot
            {
                BotId = botId,
                UserId = userId,
                EventId = data.GetProperty("event_id").GetString(),
                Name = data.GetProperty("name").GetString(),
                Avatar = data.GetProperty("avatar").GetString(),
                Style = data.GetProperty("style").GetString(),
                Voice = data.GetProperty("voice").GetString(),
                Greeting = data.GetProperty("greeting").GetString(),
                Location = data.GetProperty("location").GetString(),
                Status = data.GetProperty("status").GetString()
            };

            var request = new HttpRequestMessage(HttpMethod.Post, $"{apiAddress}/api/bot")
            {
                Headers = { { "x-api-key", apiKey } },
                Content = new StringContent(JsonSerializer.Serialize(botData), Encoding.UTF8, "application/json")
            };

            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                return Ok(new { Message = "Bot save successful" });
            }
            else
            {
                var error = await response.Content.ReadAsStringAsync();
                return BadRequest(new { Message = "Bot save failed", Error = error });
            }
        }
    }
}
