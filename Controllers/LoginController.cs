using intelliGuideDashboard.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
namespace intelliGuideDashboard.Controllers
{
    public class LoginController(ILogger<LoginController> logger, HttpClient httpClient, IConfiguration configuration) : Controller
    {
        private readonly ILogger<LoginController> logger = logger;
        private readonly HttpClient httpClient = httpClient;
        private readonly IConfiguration configuration = configuration;

        public async Task<IActionResult> LoginUser([FromBody] LoginRequest loginRequest)
        {
            if (loginRequest == null || string.IsNullOrEmpty(loginRequest.Username) || string.IsNullOrEmpty(loginRequest.Password))
            {
                return BadRequest("Invalid login request.");
            }

            var jsonContent = JsonSerializer.Serialize(loginRequest);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var apiAddress = configuration["intelliGuide:ApiAddress"];
            var apiKey = configuration["intelliGuide:ApiKey"];

            var request = new HttpRequestMessage(HttpMethod.Post, $"{apiAddress}/api/login")
            {
                Content = content
            };
            request.Headers.Add("x-api-key", apiKey);

            var response = await httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                var user = JsonSerializer.Deserialize<User>(result);
                
                if (user == null)
                {
                    return Unauthorized(new { Message = "Invalid username or password" });
                }
                HttpContext.Session.SetString("UserId", user.UserId.ToString());
                if (loginRequest.RememberMe)
                {
                    var cookieOptions = new CookieOptions
                    {
                        Expires = DateTime.Now.AddDays(30),
                        HttpOnly = true,
                        IsEssential = true
                    };
                    Response.Cookies.Append("UserId", user.UserId.ToString(), cookieOptions);
                }
                return Ok(new { Message = "Login successful", Data = result });
            }
            else
            {
                var error = await response.Content.ReadAsStringAsync();
                return Unauthorized(new { Message = "Invalid username or password", Error = error });
            }
        }

        public IActionResult Login()
        {
            return View();
        }
    }
}
