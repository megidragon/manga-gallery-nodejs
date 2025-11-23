document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const viewer = document.getElementById('viewer');
    const currentImage = document.getElementById('current-image');
    const pageIndicator = document.getElementById('page-indicator');
    const closeBtn = document.getElementById('close-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const comicsPathInput = document.getElementById('comics-path');
    const loadPathBtn = document.getElementById('load-path-btn');

    let currentComicImages = [];
    let currentIndex = 0;

    // Fetch current settings
    fetch('/api/settings')
        .then(res => res.json())
        .then(data => {
            if (data.path) {
                comicsPathInput.value = data.path;
                loadComics(); // Load comics after getting path
            }
        });

    // Load path button handler
    loadPathBtn.addEventListener('click', () => {
        const newPath = comicsPathInput.value;
        if (!newPath) return;

        fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: newPath })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    loadComics();
                } else {
                    alert('Failed to update path: ' + (data.error || 'Unknown error'));
                }
            })
            .catch(err => console.error('Error updating settings:', err));
    });

    function loadComics() {
        gallery.innerHTML = ''; // Clear existing
        fetch('/api/comics')
            .then(response => response.json())
            .then(comics => {
                if (comics.length === 0) {
                    gallery.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">No comics found in this directory.</p>';
                    return;
                }
                comics.forEach(comic => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.onclick = () => openComic(comic.path);

                    const img = document.createElement('img');
                    img.className = 'card-image';
                    img.src = comic.cover || 'placeholder.png';
                    img.alt = comic.name;
                    img.onerror = () => { img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'; };

                    const title = document.createElement('div');
                    title.className = 'card-title';
                    title.textContent = comic.name;

                    card.appendChild(img);
                    card.appendChild(title);
                    gallery.appendChild(card);
                });
            })
            .catch(err => console.error('Error fetching comics:', err));
    }

    // Initial load (replaced by loadComics called after settings fetch)
    // fetch('/api/comics')... 

    function openComic(path) {
        // Use query param for path
        fetch(`/api/comic?path=${encodeURIComponent(path)}`)
            .then(response => response.json())
            .then(data => {
                currentComicImages = data.images;
                if (currentComicImages.length > 0) {
                    currentIndex = 0;
                    updateViewer();
                    viewer.classList.remove('hidden');
                    // Small delay to allow display:block to apply before opacity transition
                    setTimeout(() => viewer.classList.add('active'), 10);
                } else {
                    alert('This comic has no images.');
                }
            })
            .catch(err => console.error('Error fetching comic details:', err));
    }

    function updateViewer() {
        if (currentComicImages.length === 0) return;
        currentImage.src = currentComicImages[currentIndex];
        pageIndicator.textContent = `${currentIndex + 1} / ${currentComicImages.length}`;
    }

    function nextImage(e) {
        e?.stopPropagation();
        if (currentComicImages.length === 0) return;
        currentIndex = (currentIndex + 1) % currentComicImages.length;
        updateViewer();
    }

    function prevImage(e) {
        e?.stopPropagation();
        if (currentComicImages.length === 0) return;
        currentIndex = (currentIndex - 1 + currentComicImages.length) % currentComicImages.length;
        updateViewer();
    }

    function closeViewer() {
        viewer.classList.remove('active');
        setTimeout(() => viewer.classList.add('hidden'), 300);
        currentComicImages = [];
    }

    // Event Listeners
    nextBtn.addEventListener('click', nextImage);
    prevBtn.addEventListener('click', prevImage);
    closeBtn.addEventListener('click', closeViewer);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!viewer.classList.contains('active')) return;

        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'Escape') closeViewer();
    });

    // Click outside image to close (optional, but nice)
    viewer.addEventListener('click', (e) => {
        if (e.target === viewer) closeViewer();
    });
});
