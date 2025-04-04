namespace WebBiblioteca.Models
{
    public class RoleModels
    {
        public const int ADMIN = 1;
        public const int CLIENTE = 2;
        public const int EMPLEADO = 3;

        public static bool IsAdmin(HttpContext context) =>
            context.Session.GetInt32("UserRole") == ADMIN;

        public static bool IsCliente(HttpContext context) =>
            context.Session.GetInt32("UserRole") == CLIENTE;

        public static bool isEmpleado(HttpContext context) =>
            context.Session.GetInt32("UserRole") == EMPLEADO;

    }
}
