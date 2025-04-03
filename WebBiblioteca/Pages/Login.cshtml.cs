using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using WebBiblioteca.Models;
using WebBiblioteca.Services;
using Newtonsoft.Json.Linq;
using Microsoft.AspNetCore.Http;

namespace WebBiblioteca.Pages
{
    public class LoginModel1 : PageModel
    {
        private readonly ApiService _apiService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public LoginModel1(ApiService apiService, IHttpContextAccessor httpContextAccessor)
        {
            _apiService = apiService;
            _httpContextAccessor = httpContextAccessor;
            Input = new LoginInputModel();
        }

        [BindProperty]
        public LoginInputModel Input { get; set; }

        public string MensajeError { get; set; }

        public async Task<IActionResult> OnPostAsync()
        {
            var responseBody = await _apiService.LoginAsync(new LoginModel
            {
                Email = Input.Email,
                Contra = Input.Contra
            });

            if (!string.IsNullOrEmpty(responseBody))
            {
                Console.WriteLine($" Respuesta de la API: {responseBody}");

                var jsonResponse = JObject.Parse(responseBody); 
                var token = jsonResponse["token"]?.ToString();

                if (!string.IsNullOrEmpty(token))
                {
                    HttpContext.Session.SetString("AuthToken", token); 
                    Console.WriteLine($" Token guardado en sesión: {HttpContext.Session.GetString("AuthToken")}");

                    return new JsonResult(new { success = true, token });
                }
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