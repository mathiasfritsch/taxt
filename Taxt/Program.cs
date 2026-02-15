using Microsoft.EntityFrameworkCore;
using TaxtDB.Data;
using TaxtService.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<TaxtDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("TaxtDb")));
builder.Services.AddScoped<IDocumentsService, DocumentsService>();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();