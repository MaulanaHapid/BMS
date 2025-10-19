   document.addEventListener("DOMContentLoaded", function () {
            fetch("header.html")
                .then((res) => res.text())
                .then(
                    (data) =>
                        (document.getElementById("header-placeholder").innerHTML = data)
                );

            fetch("footer.html")
                .then((res) => res.text())
                .then(
                    (data) =>
                        (document.getElementById("footer-placeholder").innerHTML = data)
                );

            fetch("data.json")
                .then((res) => res.json())
                .then((mobilList) => {
                    const container = document.getElementById("car-container");
                    const pagination = document.getElementById("pagination");
                    const searchInput = document.querySelector(".form-control");
                    const filterBrandButtons = document.querySelectorAll(
                        ".btn-outline-primary[data-brand]"
                    );
                    filterBrandButtons.forEach((btn) => {
                        btn.addEventListener("click", () => {
                            filterBrandButtons.forEach((b) => b.classList.remove("active"));
                            btn.classList.add("active");
                            applyFilters();
                        });
                    });
                    const priceFilterItems = document.querySelectorAll(".price-filter");
                    priceFilterItems.forEach((item) => {
                        item.addEventListener("click", (e) => {
                            e.preventDefault();
                            priceFilterItems.forEach((i) => i.classList.remove("active"));
                            item.classList.add("active");
                            selectedPriceFilter = item.dataset.price;
                            applyFilters();
                        });
                    });

                    const itemsPerPage = 6;
                    let currentPage = 1;
                    let filteredList = mobilList;

                    
                    // Fungsi untuk render data halaman
                 function renderPage(page) {
  container.innerHTML = "";
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const items = filteredList.slice(start, end);

  items.forEach((mobil) => {
    const badgeClass = mobil.status === "Tersedia" ? "bg-success" : "bg-secondary";
    const disabled = mobil.status === "Terjual" ? "disabled" : "";

    // Nomor WhatsApp tetap, bisa disimpan di luar fungsi jika tetap
    const whatsappNumber = "6281288011459";
    // Pesan disesuaikan per mobil agar dinamis
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
            <img src="${mobil.gambar[0]}" alt="${mobil.nama}" style="width:100%; height:100%; object-fit:cover;">
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
            <div class="mb-3">📍 ${mobil.lokasi}</div>
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


                    // Fungsi pagination
                    function renderPagination(activePage) {
                        pagination.innerHTML = "";
                        const totalPages = Math.ceil(filteredList.length / itemsPerPage);

                        const prevDisabled = activePage === 1 ? "disabled" : "";
                        pagination.insertAdjacentHTML(
                            "beforeend",
                            `
          <li class="page-item ${prevDisabled}">
            <button class="page-link" id="prevPage">Sebelumnya</button>
          </li>`
                        );

                        for (let i = 1; i <= totalPages; i++) {
                            const active = i === activePage ? "active" : "";
                            pagination.insertAdjacentHTML(
                                "beforeend",
                                `
            <li class="page-item ${active}">
              <button class="page-link page-number">${i}</button>
            </li>`
                            );
                        }

                        const nextDisabled = activePage === totalPages ? "disabled" : "";
                        pagination.insertAdjacentHTML(
                            "beforeend",
                            `
          <li class="page-item ${nextDisabled}">
            <button class="page-link" id="nextPage">Berikutnya</button>
          </li>`
                        );

                        // Event pagination
                        document.querySelectorAll(".page-number").forEach((btn) => {
                            btn.addEventListener("click", () => {
                                currentPage = parseInt(btn.textContent);
                                renderPage(currentPage);
                            });
                        });

                        document
                            .getElementById("prevPage")
                            ?.addEventListener("click", () => {
                                if (currentPage > 1) {
                                    currentPage--;
                                    renderPage(currentPage);
                                }
                            });

                        document
                            .getElementById("nextPage")
                            ?.addEventListener("click", () => {
                                const totalPages = Math.ceil(
                                    filteredList.length / itemsPerPage
                                );
                                if (currentPage < totalPages) {
                                    currentPage++;
                                    renderPage(currentPage);
                                }
                            });
                    }

                    let selectedPriceFilter = "all"; // default

                    document.querySelectorAll(".price-filter").forEach((item) => {
                        item.addEventListener("click", (e) => {
                            e.preventDefault();
                            selectedPriceFilter = item.dataset.price;
                            // Tandai pilihan dropdown yang aktif (optional)
                            document
                                .querySelectorAll(".price-filter")
                                .forEach((i) => i.classList.remove("active"));
                            item.classList.add("active");
                            applyFilters();
                        });
                    });

                    // Fungsi filter berdasarkan pencarian dan kategori
                    function applyFilters() {
                        const searchTerm = searchInput.value.toLowerCase();
                        const activeCategoryBtn = Array.from(filterBrandButtons).find(
                            (btn) => btn.classList.contains("active")
                        );
                        const category = activeCategoryBtn
                            ? activeCategoryBtn.dataset.brand
                            : "all";

                        filteredList = mobilList.filter((mobil) => {
                            const matchesSearch = mobil.nama
                                .toLowerCase()
                                .includes(searchTerm);
                            let matchesCategory = true;
                            let matchesPrice = true;

                            if (category !== "all") {
                                matchesCategory = mobil.nama.toLowerCase().includes(category);
                            }

                            switch (selectedPriceFilter) {
                                case "lt50":
                                    matchesPrice = mobil.harga < 50000000;
                                    break;
                                case "50to100":
                                    matchesPrice = mobil.harga >= 50000000;
                                    break;
                                case "100":
                                    matchesPrice = mobil.harga >= 50000000;
                                    break;
                                default:
                                    matchesPrice = true;
                            }

                            return matchesSearch && matchesCategory && matchesPrice;
                        });

                        currentPage = 1;
                        renderPage(currentPage);
                    }

                    // Event filter
                    filterBrandButtons.forEach((btn) => {
                        btn.addEventListener("click", () => {
                            filterBrandButtons.forEach((b) => b.classList.remove("active"));
                            btn.classList.add("active");
                            applyFilters();
                        });
                    });

                    // Event pencarian
                    searchInput.addEventListener("input", () => {
                        applyFilters();
                    });

                    // Tampilkan data halaman pertama saat load
                    applyFilters();
                })
                .catch((err) => console.error("Gagal memuat data mobil:", err));
        });
      
  // Tampilkan notifikasi "Hubungi Kami" di samping tombol WhatsApp
 document.addEventListener('DOMContentLoaded', function() {
  const notif = document.getElementById('whatsapp-notif');

  // muncul setelah 2 detik
  setTimeout(() => {
    notif.style.display = 'block';
    notif.style.animation = 'slideIn 0.4s ease-out';
  }, 2000);

  // klik = buka WA
  notif.addEventListener('click', () => {
    window.open('https://wa.me/6281288011459', '_blank');
    notif.style.display = 'none';
  });

  // hilang otomatis setelah 8 detik
  setTimeout(() => {
    notif.style.display = 'none';
  }, 10000);
});