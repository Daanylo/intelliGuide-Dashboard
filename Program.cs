using ElectronNET.API;
using ElectronNET.API.Entities;
using DotNetEnv;
using intelliGuideDashboard.Filters;

Env.Load();

var builder = WebApplication.CreateBuilder(args);
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

builder.WebHost.UseElectron(args);

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseSession();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Login}/{action=Index}/{id?}");

app.MapControllerRoute(
    name: "default",
    pattern: "Login",
    defaults: new { controller = "Login", action = "Index" });


if (HybridSupport.IsElectronActive)
{
    Console.WriteLine("Electron is active. Initializing...");
    await Task.Run(async () =>
    {
        var options = new BrowserWindowOptions
        {
            Width = 1024,
            Height = 768,
            Show = true
        };

        string appUrl = "http://localhost:8001/Login";
        Console.WriteLine($"Attempting to reach: {appUrl}");

        using var client = new HttpClient();
        await Task.Delay(1000);

        var window = await Electron.WindowManager.CreateWindowAsync(options, appUrl);
        Console.WriteLine("Window created.");

        window.OnClosed += () =>
        {
            Console.WriteLine("Window closed. Quitting app.");
            Electron.App.Quit();
        };

        window.Show();
        Console.WriteLine("Window shown.");
    });
}

app.Run();