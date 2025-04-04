using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using WebBiblioteca.Services;
using WebBiblioteca.Models;

namespace WebBiblioteca.Pages
{
    public class CreateEmpleadoModel : PageModel
    {
        private readonly ApiService _apiService;

        public CreateEmpleadoModel(ApiService apiService)
        {
            _apiService = apiService;
        }

        [BindProperty]
        public RegisterEmpleadosModel Empleado { get; set; }
        public string MensajeError { get; set; }

        public async Task<IActionResult> OnPostAsync()
        {
            var success = await _apiService.RegisterEmpleadoAsync(Empleado);
            if (success)
            {
                return RedirectToPage("/PerfilUsuario");
            }

            MensajeError = "Error en el registro del Empleado";
            return Page();

        }



    }
}
