using System.ComponentModel.DataAnnotations;

namespace WebBiblioteca.Models
{
    public class UsuarioModels

    {
        public int IdUsuario { get; set; }
        [Required]
        public string Nombre { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        public long? CodigoPostal { get; set; }

        [Required]
        public long Telefono { get; set; }

        [Required]
        public long Cedula { get; set; }

        [Required]
        public string Contra { get; set; }

        public int IdRole { get; set; }

    }
}
