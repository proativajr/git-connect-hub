const Gallery = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Galeria</h1>
        <p className="text-muted-foreground mt-1">Registro dos nossos momentos e conquistas</p>
      </div>

      <div className="flex items-center justify-center min-h-[400px] rounded-xl border border-border bg-card">
        <p className="text-muted-foreground">Em breve — fotos e registros do cardume.</p>
      </div>
    </div>
  );
};

export default Gallery;
