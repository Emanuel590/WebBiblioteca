using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace WebBiblioteca.Models
{
    public class LibroModels
    {
        public int Id_libro { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public int Stock { get; set; }
        public decimal precio_alquiler { get; set; }
   
        public int Id_Autor { get; set; }
     
        public int Id_Genero { get; set; }
    
        public int Id_Estado { get; set; }
    }
}
