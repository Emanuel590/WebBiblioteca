using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace WebBiblioteca.Pages
{
    public class ProductoModel : PageModel
    {
        public int IdProducto { get; set; }
        public void OnGet(int Idproducto)
        {
            IdProducto = Idproducto;
        }

    }
}