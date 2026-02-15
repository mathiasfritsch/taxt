using Microsoft.AspNetCore.Mvc;
namespace Taxt.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    // GET: api/transactions
    [HttpGet]
    public IActionResult Get()
    {
        return Ok("transactions");
    }
}