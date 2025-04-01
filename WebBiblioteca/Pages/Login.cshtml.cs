using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using WebBiblioteca.Models;
using WebBiblioteca.Services;

namespace WebBiblioteca.Pages
{
    public class LoginModel1 : PageModel
    {
        private readonly ApiService _apiService;

        public LoginModel1(ApiService apiService)
        {
            _apiService = apiService;
            Input = new LoginInputModel(); // Inicializa para evitar null reference
        }

        [BindProperty]
        public LoginInputModel Input { get; set; }

        public string MensajeError { get; set; }

        public async Task<IActionResult> OnPostAsync()
        {
            var token = await _apiService.LoginAsync(new LoginModel
            {
                Email = Input.Email,
                Contra = Input.Contra
            });

            if (token != null)
            {
                HttpContext.Session.SetString("AuthToken", token);
                return RedirectToPage("/Index"); // Redirige al home
            }

            MensajeError = "Credenciales incorrectas";
            return Page();
        }
    }

    public class LoginInputModel
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Contra { get; set; }
    }
}
