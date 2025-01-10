using DotNetEnv;
using intelliGuideDashboard.Filters;

Env.Load();

var builder = WebApplication.CreateBuilder(args);
builder.Configuration
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: false, reloadOnChange: true)
    .AddEnvironmentVariables();

var services = builder.Services;
services.AddControllersWithViews();
services.AddHttpClient();
services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

services.AddScoped<SessionCheckFilter>();

services.AddDistributedMemoryCache();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseStaticFiles();
app.UseRouting();
app.UseSession();
app.UseAuthorization();

app.MapControllerRoute(
    name: "login-route",
    pattern: "Login",
    defaults: new { controller = "Login", action = "Login" });

app.MapControllerRoute(
    name: "dashboard-route",
    pattern: "Dashboard/{action=Status}",
    defaults: new { controller = "Dashboard" });

app.MapControllerRoute(
    name: "search-route",
    pattern: "Dashboard/Search/{conversation_id?}",
    defaults: new { controller = "Dashboard", action = "Search" });

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Login}/{action=Login}/{id?}");

app.Run();