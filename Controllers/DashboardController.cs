using intelliGuideDashboard.Models;
using Microsoft.AspNetCore.Mvc;
using intelliGuideDashboard.Filters;
using System.Text.Json;

namespace intelliGuideDashboard.Controllers
{
    [Route("[controller]")]
    [ServiceFilter(typeof(SessionCheckFilter))]
    public class DashboardController(ILogger<DashboardController> logger, HttpClient httpClient) : Controller
    {
        private readonly ILogger<DashboardController> _logger = logger;
        private readonly HttpClient _httpClient = httpClient;

        [HttpGet("")]
        [HttpGet("Status")]
        public IActionResult Status()
        {
            return View();
        }

        [HttpGet("Context")]
        public IActionResult Context()
        {
            return View();
        }

        [HttpGet("Settings")]
        public IActionResult Settings()
        {
            return View();
        }

        [HttpGet("Events")]
        public IActionResult Events()
        {
            return View();
        }

        [HttpGet("Search")]
        public IActionResult Search()
        {
            return View();
        }

        [HttpGet("Notifications")]
        public IActionResult Notifications()
        {
            return View();
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return Ok(new { Message = "Logout successful" });
        }

        [HttpGet("getBots")]
        public async Task<IActionResult> GetBots()
        {
            var UserId = HttpContext.Session.GetString("UserId");
            _logger.LogInformation($"UserId: {UserId}");
            if (string.IsNullOrEmpty(UserId))
            {
                return Unauthorized(new { Message = "Unauthorized" });
            }
            var apiAddress = Environment.GetEnvironmentVariable("API_ADDRESS");
            var apiKey = Environment.GetEnvironmentVariable("INTELLIGUIDE_API_KEY");

            var request = new HttpRequestMessage(HttpMethod.Get, $"http://{apiAddress}/api/bots/{UserId}");
            request.Headers.Add("x-api-key", apiKey);
            
            var response = await _httpClient.SendAsync(request);

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
    }
}
