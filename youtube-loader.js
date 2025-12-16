function initializeYouTubePlaylist(config) {
  const {
    apiKey,
    playlistId,
    playlistIds, // Acepta una lista de IDs
    containerId,
    cardClass,
    itemsPerPage,
    searchInputId,
    noResultsId,
    paginationContainerId,
    loadingMessageId,
    renderAs = "videos", // 'videos' o 'playlists'
  } = config;

  let allItems = [];
  let filteredItems = [];
  let currentPage = 1;

  const grid = document.getElementById(containerId);
  const searchInput = document.getElementById(searchInputId);
  const noResultsMessage = document.getElementById(noResultsId);
  const paginationContainer = document.getElementById(paginationContainerId);
  const loadingMessage = document.getElementById(loadingMessageId);

  async function fetchAndRenderPlaylists() {
    try {
      const idsToFetch = playlistIds || [];
      if (idsToFetch.length === 0) {
        throw new Error("No playlist IDs provided.");
      }
      const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${idsToFetch.join(
        ","
      )}&key=${apiKey}&maxResults=50`;

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        const reason =
          errorData?.error?.errors?.[0]?.reason || response.statusText;
        throw new Error(`Failed to fetch playlist details: ${reason}`);
      }

      const data = await response.json();
      grid.innerHTML = ""; // Limpiar mensaje de "cargando"

      if (data.items.length === 0) {
        noResultsMessage.innerText =
          "No se encontraron playlists. Verifica que los IDs sean correctos y que las playlists no sean privadas.";
        noResultsMessage.style.display = "block";
        return;
      }

      data.items.forEach(renderPlaylistCard);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      loadingMessage.innerHTML = `<p style="color: red; text-align: center;">Error al cargar las playlists: ${error.message}</p>`;
    }
  }

  function renderPlaylistCard(playlist) {
    const snippet = playlist.snippet;
    const card = document.createElement("a");
    card.className = "playlist-card"; // Usaremos una nueva clase CSS
    card.href = `playlist-view.html?id=${playlist.id}`;
    card.innerHTML = `
      <div class="playlist-card-thumbnail">
        <img src="${snippet.thumbnails.high.url}" alt="${
      snippet.title
    }" loading="lazy">
        <span class="video-count">${
          playlist.contentDetails.itemCount
        } videos</span>
      </div>
      <div class="playlist-card-content">
        <h3>${snippet.title}</h3>
        <p>${snippet.description.substring(0, 100)}...</p>
      </div>
    `;
    grid.appendChild(card);
  }

  async function fetchAllItems() {
    try {
      // Usa la nueva lista de IDs o la anterior si es una sola
      const idsToFetch = playlistIds || [playlistId];

      // Cambiamos a un bucle secuencial para cargar cada playlist una por una.
      for (const id of idsToFetch) {
        let nextPageToken = "";
        let items = [];
        let hasError = false;

        do {
          let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${id}&key=${apiKey}&maxResults=50`;
          if (nextPageToken) {
            url += `&pageToken=${nextPageToken}`;
          }
          const response = await fetch(url);
          if (!response.ok) {
            // Manejo de errores más robusto.
            let errorDetails = response.statusText;
            try {
              // La API de Google suele devolver errores en JSON.
              errorDetails = await response.json();
            } catch (e) {
              // Si no es JSON, podría ser un error de red (HTML/texto).
              errorDetails = await response.text();
            }
            console.error(
              `Error al cargar la playlist ${id} (status: ${response.status}):`,
              errorDetails
            );
            hasError = true;
            break; // Salimos del bucle 'do-while' para esta playlist
          }
          const data = await response.json();
          if (data.error) {
            console.error(`Error de API para la playlist ${id}:`, data.error);
            hasError = true;
            break; // Salimos del bucle 'do-while'
          }
          items.push(...data.items);
          nextPageToken = data.nextPageToken;
        } while (nextPageToken);

        // Si no hubo error para esta playlist, procesamos y mostramos los videos.
        if (!hasError && items.length > 0) {
          const newItems = items.map((item) => ({
            videoId: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url, // Capturamos la miniatura
            description: item.snippet.description.substring(0, 150) + "...",
          }));

          allItems.push(...newItems);
          filteredItems = [...allItems]; // Actualiza la lista filtrada
        }
      }
      displayPage(1); // Muestra la primera página después de cargar todo
    } catch (error) {
      console.error("Error al cargar los videos:", error);
      grid.innerHTML = ""; // Limpia el grid para que no se quede el "Cargando..."
      loadingMessage.innerHTML = `<p style="color: red; text-align: center; grid-column: 1 / -1;">Error al cargar los videos. Revisa la configuración de la API Key, el ID de la Playlist y las restricciones en Google Cloud.</p>`;
    }
  }

  function displayPage(page) {
    currentPage = page;
    grid.innerHTML = "";
    noResultsMessage.style.display = "none";
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = filteredItems.slice(start, end);

    if (filteredItems.length === 0) {
      noResultsMessage.style.display = "block";
    } else {
      paginatedItems.forEach(renderCard);
    }
    setupPagination();
  }

  function renderCard(item) {
    const card = document.createElement("article");
    card.className = cardClass;
    card.innerHTML = `
        <div class="devocional-media" data-video-id="${item.videoId}">
          <img src="${item.thumbnail}" alt="${item.title}" loading="lazy">
          <button class="play-button" aria-label="Reproducir video: ${item.title}"><i class="fas fa-play"></i></button>
        </div>
        <div class="devocional-content">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </div>
      `;

    // Añadimos el evento para cargar el video al hacer clic
    const mediaContainer = card.querySelector(".devocional-media");
    mediaContainer.addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${item.videoId}?autoplay=1`;
      iframe.title = "YouTube video player";
      iframe.frameborder = "0";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowfullscreen = true;
      mediaContainer.innerHTML = ""; // Limpiamos el contenedor
      mediaContainer.appendChild(iframe);
    });

    grid.appendChild(card);
  }

  function setupPagination() {
    paginationContainer.innerHTML = "";
    const pageCount = Math.ceil(filteredItems.length / itemsPerPage);
    if (pageCount <= 1) return;
    for (let i = 1; i <= pageCount; i++) {
      const btn = document.createElement("button");
      btn.className = "pagination-btn";
      btn.innerText = i;
      if (i === currentPage) btn.classList.add("active");
      btn.addEventListener("click", () => displayPage(i));
      paginationContainer.appendChild(btn);
    }
  }

  function filterItems() {
    const searchTerm = searchInput.value.toLowerCase();
    filteredItems = allItems.filter(
      (p) =>
        p.title.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
    );
    displayPage(1);
  }

  function filterPlaylistCards() {
    const searchTerm = searchInput.value.toLowerCase();
    const allCards = grid.querySelectorAll(".playlist-card");
    let visibleCards = 0;
    allCards.forEach((card) => {
      const title = card.querySelector("h3").textContent.toLowerCase();
      const description = card.querySelector("p").textContent.toLowerCase();
      if (title.includes(searchTerm) || description.includes(searchTerm)) {
        card.style.display = "block";
        visibleCards++;
      } else {
        card.style.display = "none";
      }
    });
    noResultsMessage.style.display = visibleCards === 0 ? "block" : "none";
  }

  if (renderAs === "playlists") {
    if (searchInput) searchInput.addEventListener("input", filterPlaylistCards);
    fetchAndRenderPlaylists();
  } else {
    // renderAs === 'videos'
    if (searchInput) searchInput.addEventListener("input", filterItems);
    fetchAllItems();
  }
}
