using System.ComponentModel.DataAnnotations.Schema;

namespace WebBiblioteca.Models
{
    public class GeneroModels
    {
        public int Id_Genero { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public int Id_Estado { get; set; }
    }
}
