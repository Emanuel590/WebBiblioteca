using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using WebBiblioteca.Models;
using WebBiblioteca.Services;

namespace WebBiblioteca.Pages
{
    public class RegisterModel1 : PageModel
    {
        private readonly ApiService _apiService;

        public RegisterModel1(ApiService apiService)
        {
            _apiService = apiService;
        }

        [BindProperty]
        public RegisterModel Register { get; set; }
        public string MensajeError { get; set; }

        public async Task<IActionResult> OnPostAsync()
        {
            var success = await _apiService.RegisterAsync(Register);
            if (success)
            {
                return RedirectToPage("/Login");
            }

            MensajeError = "Error en el registro";
            return Page();
        }
    }
}