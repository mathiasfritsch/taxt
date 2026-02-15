using Microsoft.AspNetCore.Mvc;
using TaxtModel.Dto;
using TaxtService.Services;

namespace Taxt.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentsService _documentsService;

    public DocumentsController(IDocumentsService documentsService)
    {
        _documentsService = documentsService;
    }

    // GET: api/documents
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DocumentDto>>> Get(CancellationToken cancellationToken)
    {
        var documents = await _documentsService.GetDocumentsAsync(cancellationToken);
        return Ok(documents);
    }
}