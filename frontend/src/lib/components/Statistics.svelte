<script>
    import '$lib/styles/global.css';
    let { libraries } = $props(); //importare array da componente padre (+page.svelte) a componente figlio (Statistics.svelte)
</script>

<section class="stats-section container mx-auto px-4 py-6 mt-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="stat-card p-4 rounded-lg shadow-md">
        <h3 class="text-sm font-medium opacity-70">Totale Biblioteche</h3>
        <p class="text-3xl font-bold">{libraries.length}</p>
      </div>
      <div class="stat-card p-4 rounded-lg shadow-md">
        <h3 class="text-sm font-medium opacity-70">Totale Libri</h3>
        <p class="text-3xl font-bold">{libraries.reduce((total, lib) => total + lib.books, 0)}</p>
      </div>
      <div class="stat-card p-4 rounded-lg shadow-md">
        <h3 class="text-sm font-medium opacity-70">Categoria Principale</h3>
        <p class="text-3xl font-bold">Scienze</p>
      </div>
      <div class="stat-card p-4 rounded-lg shadow-md">
        <h3 class="text-sm font-medium opacity-70">Utenti Attivi</h3>
        <p class="text-3xl font-bold">127</p>
      </div>
    </div>
  </section>