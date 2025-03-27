using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using WebBiblioteca.Models;
using WebBiblioteca.Services;

namespace WebBiblioteca.Pages
{
    public class LibrosAdminModel : PageModel
    {
        //Creamos una variable de solo lectura
        private readonly LibrosServices _librosServices;

        //Constructor
        public LibrosAdminModel(LibrosServices librosServices)
        {
            _librosServices = librosServices;
        }

        //Propiedad para almacenar la lista de libros
        public List<LibroModels> Libros { get; set; }

        //Metodo que se ejecuta para mostrar los libros
        public async Task OnGetAsync()
        {
            //Obtenemos la lista de libros
            Libros = await _librosServices.GetLibrosAsync();
        }

        

    }
}
