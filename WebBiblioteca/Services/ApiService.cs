using System.Text;
using Newtonsoft.Json;

using WebBiblioteca.Models;

namespace WebBiblioteca.Services
{
    public class ApiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiUrl;

        public ApiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiUrl = configuration["ApiUrl"];
        }

        public async Task<string> LoginAsync(LoginModel login)
        {
            var json = JsonConvert.SerializeObject(login);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_apiUrl}/Usuarios/Login", content);

            var responseBody = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"🔹 Respuesta de la API: {responseBody}"); 

            if (response.IsSuccessStatusCode)
            {
                return responseBody; // Devuelve el JWT
            }
            return null;
        }

        public async Task<bool> RegisterAsync(RegisterModel register)
        {
            var json = JsonConvert.SerializeObject(new
            {
                nombre = register.nombre,
                email = register.email,
                codigo_postal = register.codigo_postal,
                telefono = register.telefono,
                cedula = register.cedula,
                contra = register.contra,
                id_role = register.id_role,
                id_estado = register.id_estado
            });

            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_apiUrl}/Usuarios/register", content);
            return response.IsSuccessStatusCode;
        }

        public async Task<bool> RegisterEmpleadoAsync(RegisterEmpleadosModel register)
        {
            var json = JsonConvert.SerializeObject(new
            {
                nombre = register.nombre,
                email = register.email,
                codigo_postal = register.codigo_postal,
                telefono = register.telefono,
                cedula = register.cedula,
                contra = register.contra,
                id_role = register.id_role,
                id_estado = register.id_estado
            });

            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_apiUrl}/Usuarios/register", content);
            return response.IsSuccessStatusCode;
        }




    }
}

