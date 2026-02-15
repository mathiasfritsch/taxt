using Microsoft.AspNetCore.Mvc;
using Taxt.Dto;

namespace Taxt.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentsController : ControllerBase
{
    // GET: api/transactions
    [HttpGet]
    public IActionResult Get()
    {
        
        var documents = new List<Document>()
        {
            new Document { Id = 1, Name = "Document 1" },
            new Document { Id = 2, Name = "Document 2" },
            new Document { Id = 3, Name = "Document 3" }
        };
        
        return Ok(documents);
    }
}