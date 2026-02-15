using Microsoft.EntityFrameworkCore;
using TaxtDB.Data;
using TaxtModel.Dto;

namespace TaxtService.Services;

public interface IDocumentsService
{
    Task<IReadOnlyList<DocumentDto>> GetDocumentsAsync(CancellationToken cancellationToken = default);
}

public sealed class DocumentsService : IDocumentsService
{
    private readonly TaxtDbContext _dbContext;

    public DocumentsService(TaxtDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<DocumentDto>> GetDocumentsAsync(CancellationToken cancellationToken = default)
    {
        var documents = await _dbContext.Documents
            .OrderBy(document => document.Id)
            .Select(document => new DocumentDto
            {
                Id = document.Id,
                Name = document.Name
            })
            .ToListAsync(cancellationToken);

        return documents;
    }
}
