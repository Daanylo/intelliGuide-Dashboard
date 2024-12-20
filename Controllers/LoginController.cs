using intelliGuideDashboard.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
namespace intelliGuideDashboard.Controllers
{
    [Route("[controller]")]
    public class LoginController(ILogger<LoginController> logger, HttpClient httpClient) : Controller
    {
        private readonly ILogger<LoginController> _logger = logger;
        private readonly HttpClient _httpClient = httpClient;

        [HttpPost("loginUser")]
        public async Task<IActionResult> LoginUser([FromBody] LoginRequest loginRequest)
        {
            if (loginRequest == null || string.IsNullOrEmpty(loginRequest.Username) || string.IsNullOrEmpty(loginRequest.Password))
            {
                return BadRequest("Invalid login request.");
            }

            var jsonContent = JsonSerializer.Serialize(loginRequest);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var apiAddress = Environment.GetEnvironmentVariable("API_ADDRESS");
            var apiKey = Environment.GetEnvironmentVariable("INTELLIGUIDE_API_KEY");

            var request = new HttpRequestMessage(HttpMethod.Post, $"http://{apiAddress}/api/login")
            {
                Content = content
            };
            request.Headers.Add("x-api-key", apiKey);

            var response = await _httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                var user = JsonSerializer.Deserialize<User>(result);
                
                if (user == null)
                {
                    return Unauthorized(new { Message = "Invalid username or password" });
                }
                HttpContext.Session.SetString("UserId", user.user_id.ToString());
                if (loginRequest.RememberMe)
                {
                    var cookieOptions = new CookieOptions
                    {
                        Expires = DateTime.Now.AddDays(30),
                        HttpOnly = true,
                        IsEssential = true
                    };
                    Response.Cookies.Append("UserId", user.user_id.ToString(), cookieOptions);
                }
                return Ok(new { Message = "Login successful", Data = result });
            }
            else
            {
                var error = await response.Content.ReadAsStringAsync();
                return Unauthorized(new { Message = "Invalid username or password", Error = error });
            }
        }

        [HttpGet("")]
        public IActionResult Login()
        {
            return View();
        }
    }
}
