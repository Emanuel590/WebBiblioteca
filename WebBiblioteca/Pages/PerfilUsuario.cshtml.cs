using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace WebBiblioteca.Pages
{
    public class PerfilUsuarioModel : PageModel
    {
        public string Token { get; private set; }
        public void OnGet()
        {
            Token = HttpContext.Session.GetString("AuthToken");
            Console.WriteLine($" Token en : {Token}");
        }
    }
}
