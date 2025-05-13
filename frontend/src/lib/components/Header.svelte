<script>
    import '$lib/styles/global.css';
    import logo from '$lib/images/LOGO.LEGGERO.trspnt.png';
    import emblemaRepubblica from '$lib/images/Emblema della Repubblica Italiana.svg';
    import worldMap from '$lib/images/world_map.png'

    // Funzioni per gestire i fallimenti di caricamento delle immagini
    function handleImageError(event) {
        event.target.src = '/api/placeholder/64/64';
        event.target.onerror = null;
    }
</script>


<header class="relative shadow-lg bg-white z-0 py-4 px-6 flex justify-between items-center overflow-hidden">
  <div class="absolute inset-0 flex justify-center items-center opacity-20 grayscale brightness-150 z-[-1]">
    <img src={worldMap} alt="Mappa del mondo"
         class="w-[1000px] translate-y-20 h-auto object-contain" />
  </div>
  <div class="flex items-center">
    <img src={logo} alt="Logo della scuola" class="h-16 w-16 mr-4 hover:scale-105 transition-transform"
         on:error={handleImageError} />
  </div>
  <h1 class="text-4xl font-medium text-center flex-grow castelli-title">CastelliShelf</h1>
  <div class="flex items-center gap-4">
    <img src={emblemaRepubblica} alt="Logo Repubblica Italiana" class="h-16 w-16"
         on:error={handleImageError} />
  </div>
</header>
