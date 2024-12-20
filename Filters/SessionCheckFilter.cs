using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace intelliGuideDashboard.Filters
{
    public class SessionCheckFilter : IActionFilter
    {
        public void OnActionExecuting(ActionExecutingContext context)
        {
            var session = context.HttpContext.Session;
            if (string.IsNullOrEmpty(session.GetString("UserId")))
            {
                context.Result = new RedirectToActionResult("Login", "Login", null);
            }
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {

        }
    }
}