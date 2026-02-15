using Microsoft.EntityFrameworkCore;
using TaxtDB.Entities;

namespace TaxtDB.Data;

public class TaxtDbContext : DbContext
{
    public TaxtDbContext(DbContextOptions<TaxtDbContext> options) : base(options)
    {
    }

    public DbSet<Document> Documents => Set<Document>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(d => d.Id);
            entity.Property(d => d.Name)
                .IsRequired()
                .HasMaxLength(200);
        });
    }
}
