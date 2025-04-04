namespace WebBiblioteca.Models
{
    public class RegisterEmpleadosModel
    {
        public string nombre { get; set; }
        public string email { get; set; }
        public long codigo_postal { get; set; }
        public long telefono { get; set; }
        public long cedula { get; set; }
        public string contra { get; set; }
        public int id_role { get; set; } = 3;
        public int id_estado { get; set; } = 1;

    }
}
