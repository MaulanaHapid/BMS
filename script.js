document.addEventListener("DOMContentLoaded", function () {
    // Render header
    fetch("header.html")
        .then((res) => res.text())
        .then(
            (data) =>
                (document.getElementById("header-placeholder").innerHTML = data)
        );

    // Render footer + script notif WA setelah footer siap
    fetch("footer.html")
        .then(res => res.text())
        .then(data => {
            document.getElementById("footer-placeholder").innerHTML = data;

            // Script notif WA hanya setelah footer masuk DOM
            const notif = document.getElementById('whatsapp-notif');
            if (notif) {
                setTimeout(() => {
                    notif.style.display = 'block';
                    notif.style.animation = 'slideIn 0.4s ease-out';
                }, 2000);

                notif.addEventListener('click', () => {
                    window.open('https://wa.me/6281288011459', '_blank');
                    notif.style.display = 'none';
                });

                setTimeout(() => {
                    notif.style.display = 'none';
                }, 10000);
            }
        });

    // Render daftar mobil, semua eventListener pastikan elemen ada!
    fetch("data.json")
        .then((res) => res.json())
        .then((mobilList) => {
            const container = document.getElementById("car-container");
            const pagination = document.getElementById("pagination");
            const searchInput = document.querySelector(".form-control");
            const filterBrandButtons = document.querySelectorAll(".btn-outline-primary[data-brand]");
            const priceFilterItems = document.querySelectorAll(".price-filter");

            // Validasi elemen utama, jika tidak ada, hentikan atau log warning
            if (!container || !pagination) return;

            // Variabel2 global
            let selectedPriceFilter = "all";
            let selectedCategory = "all";
            const itemsPerPage = 6;
            let currentPage = 1;
            let filteredList = mobilList;

            // Event filter brand
            if (filterBrandButtons.length > 0) {
                filterBrandButtons.forEach((btn) => {
                    btn.addEventListener("click", () => {
                        filterBrandButtons.forEach((b) => b.classList.remove("active"));
                        btn.classList.add("active");
                        selectedCategory = btn.dataset.brand;
                        applyFilters();
                    });
                });
            }

            // Event filter harga
            if (priceFilterItems.length > 0) {
                priceFilterItems.forEach((item) => {
                    item.addEventListener("click", (e) => {
                        e.preventDefault();
                        priceFilterItems.forEach((i) => i.classList.remove("active"));
                        item.classList.add("active");
                        selectedPriceFilter = item.dataset.price;
                        applyFilters();
                    });
                });
            }

            // Event pencarian
            if (searchInput) {
                searchInput.addEventListener("input", () => {
                    applyFilters();
                });
            }

            // RESET FILTER
            const btnReset = document.getElementById('resetFilters');
            if (btnReset) {
                btnReset.addEventListener("click", () => {
                    filterBrandButtons.forEach(btn => btn.classList.remove("active"));
                    const btnAll = document.querySelector('.btn-outline-primary[data-brand="all"]');
                    if (btnAll) btnAll.classList.add("active");
                    priceFilterItems.forEach(item => item.classList.remove("active"));
                    const priceAll = document.querySelector('.dropdown-menu a[data-price="all"]');
                    if (priceAll) priceAll.classList.add("active");
                    if (searchInput) searchInput.value = "";
                    selectedCategory = "all";
                    selectedPriceFilter = "all";
                    currentPage = 1;
                    applyFilters();
                });
            }

            // Render halaman
            function renderPage(page) {
                container.innerHTML = "";
                const start = (page - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                const items = filteredList.slice(start, end);

                items.forEach((mobil) => {
                    const badgeClass = mobil.status === "Tersedia" ? "bg-success" : "bg-secondary";
                    const disabled = mobil.status === "Terjual" ? "disabled" : "";
                    const whatsappNumber = "6281288011459";
                    const message = encodeURIComponent(`Halo, saya tertarik dengan mobil ${mobil.nama}. Apakah masih tersedia?`);
                    const btnHubungiClass = mobil.status === "Terjual" ? "btn-secondary" : "btn-success";
                    const disabledAttr = mobil.status === "Terjual" ? "disabled" : "";
                    const hubungiBtnHTML = mobil.status === "Terjual"
                        ? `<button class="btn ${btnHubungiClass} flex-fill" disabled>Terjual</button>`
                        : `<a href="https://wa.me/${whatsappNumber}?text=${message}" target="_blank" rel="noopener noreferrer" class="btn ${btnHubungiClass} flex-fill" ${disabledAttr}>Hubungi</a>`;

                    const cardHTML = `
                    <div class="col">
                        <div class="card h-100 shadow-sm">
                            <div class="position-relative" style="height: 200px;">
                                <img src="${mobil.gambar[0]}" alt="${mobil.nama}" style="width:100%; height:100%; object-fit:contain;">
                                <span class="badge ${badgeClass} position-absolute top-0 start-0 m-2">${mobil.status}</span>
                            </div>
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${mobil.nama}</h5>
                                <p class="card-text text-primary fw-bold fs-5">Rp ${mobil.harga.toLocaleString('id-ID')}</p>
                                <div class="d-flex flex-wrap gap-3 mb-3 text-muted small">
                                    <div>📅 ${mobil.tahun}</div>
                                    <div>🛣️ ${mobil.kilometer}</div>
                                    <div>⛽ ${mobil.bahan_bakar}</div>
                                    <div>⚙️ ${mobil.transmisi}</div>
                                </div>
                                <div class="mb-3">📍 ${mobil.lokasi || '-'}</div>
                                <div class="mt-auto d-flex gap-2">
                                    <a href="detailmobil.html?id=${mobil.id}" class="btn btn-outline-secondary flex-fill" ${disabled}>Detail</a>
                                    ${hubungiBtnHTML}
                                </div>
                            </div>
                        </div>
                    </div>`;
                    container.insertAdjacentHTML("beforeend", cardHTML);
                });

                renderPagination(page);
            }

            function renderPagination(activePage) {
                pagination.innerHTML = "";
                const totalPages = Math.ceil(filteredList.length / itemsPerPage);

                const prevDisabled = activePage === 1 ? "disabled" : "";
                pagination.insertAdjacentHTML(
                    "beforeend",
                    `<li class="page-item ${prevDisabled}">
                        <button class="page-link" id="prevPage">Sebelumnya</button>
                    </li>`
                );

                for (let i = 1; i <= totalPages; i++) {
                    const active = i === activePage ? "active" : "";
                    pagination.insertAdjacentHTML(
                        "beforeend",
                        `<li class="page-item ${active}">
                            <button class="page-link page-number">${i}</button>
                        </li>`
                    );
                }

                const nextDisabled = activePage === totalPages ? "disabled" : "";
                pagination.insertAdjacentHTML(
                    "beforeend",
                    `<li class="page-item ${nextDisabled}">
                        <button class="page-link" id="nextPage">Berikutnya</button>
                    </li>`
                );

                // Pagination events
                const prevBtn = document.getElementById("prevPage");
                if (prevBtn) {
                    prevBtn.addEventListener("click", () => {
                        if (currentPage > 1) {
                            currentPage--;
                            renderPage(currentPage);
                        }
                    });
                }
                const nextBtn = document.getElementById("nextPage");
                if (nextBtn) {
                    nextBtn.addEventListener("click", () => {
                        const totalPages = Math.ceil(filteredList.length / itemsPerPage);
                        if (currentPage < totalPages) {
                            currentPage++;
                            renderPage(currentPage);
                        }
                    });
                }
                document.querySelectorAll(".page-number").forEach((btn) => {
                    btn.addEventListener("click", () => {
                        currentPage = parseInt(btn.textContent);
                        renderPage(currentPage);
                    });
                });
            }

            // Fungsi filter ALL
    
                 function applyFilters() {
                const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
                const activeCategoryBtn = Array.from(filterBrandButtons).find(
                    (btn) => btn.classList.contains("active")
                );
                const category = activeCategoryBtn ? activeCategoryBtn.dataset.brand : "all";

                filteredList = mobilList.filter((mobil) => {
                    const matchesSearch = mobil.nama.toLowerCase().includes(searchTerm);
                    let matchesCategory = true;
                    let matchesPrice = true;
                    let matchesStatus = mobil.status.toLowerCase() === "tersedia"; 

                    if (category !== "all") {
                        matchesCategory = mobil.merk.toLowerCase() === category.toLowerCase();
                    }

                    switch (selectedPriceFilter) {
                        case "lt50":
                            matchesPrice = mobil.harga < 50000000;
                            break;
                        case "50to100":
                            matchesPrice = mobil.harga >= 50000000 && mobil.harga <= 100000000;
                            break;
                        case "100":
                            matchesPrice = mobil.harga > 100000000;
                            break;
                        default:
                            matchesPrice = true;
                    }
                    return matchesSearch && matchesCategory && matchesPrice && matchesStatus;
                });
                currentPage = 1;
                renderPage(currentPage);
            }

            // Tampilkan data halaman pertama saat load
            applyFilters();
        })
        .catch((err) => console.error("Gagal memuat data mobil:", err));
});


