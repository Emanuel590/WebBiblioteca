using System.Text.Json;
using WebBiblioteca.Models;

namespace WebBiblioteca.Services
{
    public class LibrosServices
    {
        //Creamos instancia para peticiones HTTP
        private readonly HttpClient _httpClient;

        //Creamos instancia de la API 
        private readonly string _apiURL;

        //Constructor de la Clase
        public LibrosServices(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiURL = configuration["ApiUrl"]+ "/Libros";
        }


        //Metodo para obtener todos los libros
        public async Task<List<LibroModels>> GetLibrosAsync()
        {
            //Inicializamos la respuesta
            var response = await _httpClient.GetAsync(_apiURL);
            if (!response.IsSuccessStatusCode) return new List<LibroModels>(); //Si la respuesta no es exitosa devuelve una lista vacia

            //Si la respuesta es exitosa se lee en formato JSON
            var json = await response.Content.ReadAsStringAsync(); //Lee la respuesta en formato JSON

            return JsonSerializer.Deserialize<List<LibroModels>>(json,
                new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true //Deserializa el JSON a una lista de LibroModels e ignora las mayusculas 
                }
                ) ??  new List<LibroModels>(); //si no se puede deserializar devuelve una lista vacia

        }

        //Metodo para agregar los libros


    }
}
