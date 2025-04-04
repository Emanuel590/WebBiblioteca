using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace WebBiblioteca.Pages
{
    public class GeneroModel : PageModel
    {

        public int IdGenero { get; set; }

        public void OnGet(int idGenero)
        {
            IdGenero = idGenero;
        }
    }
}
