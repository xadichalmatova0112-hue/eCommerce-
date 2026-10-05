let mahsulotlar = [];

let korilganSoni = 10;

let mahsulotlarJoyi = document.getElementById("productsBox");
let arzonJoyi = document.getElementById("cheapBox");
let qidiruvInput = document.getElementById("searchInput");
let yanaJoyi = document.getElementById("showMoreBox");



async function mahsulotlarniYukla() {
    try {
        let javob = await fetch("http://localhost:3001/products");

        if (!javob.ok) {
            throw new Error("Serverdan javob kelmadi");
        }

        let malumot = await javob.json();

        mahsulotlar = malumot;

        arzonMahsulotlar(mahsulotlar);

        mahsulotlarniKorsatish(mahsulotlar);

    } catch (xato) {
        console.log("Xatolik:", xato);
        mahsulotlarJoyi.innerHTML = "<p class='text-red-500'>Mahsulotlarni yuklab bo'lmadi</p>";
    }
}



function mahsulotlarniKorsatish(royxat) {
    mahsulotlarJoyi.innerHTML = "";

    if (royxat.length === 0) {
        mahsulotlarJoyi.innerHTML = "<p class='text-gray-500'>Mahsulot topilmadi</p>";
        yanaJoyi.innerHTML = "";
        return;
    }

    let korsatiladigan = royxat.slice(0, korilganSoni);

    for (let i = 0; i < korsatiladigan.length; i++) {
        let karta = kartaYasash(korsatiladigan[i]);
        mahsulotlarJoyi.append(karta);
    }

    yanaTugmaTekshir(royxat);
}



function yanaTugmaTekshir(royxat) {
    if (korilganSoni >= royxat.length) {
        yanaJoyi.innerHTML = "";
        return;
    }

    yanaJoyi.innerHTML = `
        <button id="yanaTugma"
            class="w-full bg-[#e8e8ea] hover:bg-[#dcdce0] text-gray-900 font-medium rounded-xl py-4">
            Yana ko'rsatish
        </button>
    `;

    let yanaTugma = document.getElementById("yanaTugma");

    yanaTugma.addEventListener("click", function() {
        korilganSoni = korilganSoni + 10;
        mahsulotlarniKorsatish(royxat);
    });
}



function kartaYasash(mahsulot) {
    let karta = document.createElement("div");
    karta.className = "bg-white rounded-xl cursor-pointer";

    let narx = raqamniChiroyli(mahsulot.price);

    let eskiNarx = "";
    if (mahsulot.oldPrice) {
        eskiNarx = raqamniChiroyli(mahsulot.oldPrice);
    }

    let oylik = "";
    if (mahsulot.monthlyPrice) {
        oylik = raqamniChiroyli(mahsulot.monthlyPrice);
    }

    karta.innerHTML = `
        <div class="bg-[#f5f5f5] rounded-xl relative h-[280px]">
            <img src="${mahsulot.thumbnail}" class="w-full h-full object-contain p-3">
            <button class="yurakTugma absolute top-3 right-3 bg-white rounded-full w-9 h-9">
                ♡
            </button>
        </div>

        <div class="pt-2">
            <p class="text-gray-400 line-through text-sm">${eskiNarx} so'm</p>
            <p class="text-2xl font-bold">${narx} so'm</p>
            <div class="bg-yellow-300 rounded-md px-2 py-1 text-sm mt-1">
                ${oylik} so'm/oyiga
            </div>
            <h3 class="text-base mt-2 h-[44px] overflow-hidden">${mahsulot.title}</h3>
            <p class="text-sm mt-1"> ${mahsulot.rating} (${mahsulot.reviews} sharhlar)</p>
            <button class="savatgaTugma bg-purple-700 text-white w-full rounded-lg py-2 mt-3">
                🛍 Ertaga
            </button>
        </div>
    `;

    let savatgaTugma = karta.querySelector(".savatgaTugma");
    savatgaTugma.addEventListener("click", function(voqea) {
        voqea.stopPropagation();
        savatgaQoshish(mahsulot, savatgaTugma);
    });

    return karta;
}



function raqamniChiroyli(raqam) {
    let matn = String(raqam);
    let natija = "";
    let sanagich = 0;

    for (let i = matn.length - 1; i >= 0; i--) {
        natija = matn[i] + natija;
        sanagich = sanagich + 1;

        if (sanagich === 3 && i !== 0) {
            natija = " " + natija;
            sanagich = 0;
        }
    }

    return natija;
}



qidiruvInput.addEventListener("input", function() {
    let qidiruvMatni = qidiruvInput.value.toLowerCase();

    let topilganlar = [];

    for (let i = 0; i < mahsulotlar.length; i++) {
        let nomi = mahsulotlar[i].title.toLowerCase();

        if (nomi.includes(qidiruvMatni)) {
            topilganlar.push(mahsulotlar[i]);
        }
    }

    mahsulotlarniKorsatish(topilganlar);
});



function arzonMahsulotlar(royxat) {
    arzonJoyi.innerHTML = "";

    let nusxa = royxat.slice();

    for (let i = 0; i < nusxa.length; i++) {
        for (let j = i + 1; j < nusxa.length; j++) {
            if (nusxa[i].price > nusxa[j].price) {
                let vaqtincha = nusxa[i];
                nusxa[i] = nusxa[j];
                nusxa[j] = vaqtincha;
            }
        }
    }

    let engArzonlar = nusxa.slice(0, 4);

    for (let i = 0; i < engArzonlar.length; i++) {
        let karta = kartaYasash(engArzonlar[i]);
        arzonJoyi.append(karta);
    }
}



async function savatgaQoshish(mahsulot, tugma) {
    try {
        let javob = await fetch("http://localhost:3001/cart", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                productId: mahsulot.id,
                title: mahsulot.title,
                price: mahsulot.price,
                thumbnail: mahsulot.thumbnail
            })
        });

        if (!javob.ok) {
            throw new Error("Savatga qo'shib bo'lmadi");
        }

        tugma.innerHTML = " Savatda";
        tugma.classList.remove("bg-purple-700");
        tugma.classList.add("bg-green-500");

        setTimeout(function() {
            tugma.innerHTML = "🛍 Ertaga";
            tugma.classList.remove("bg-green-500");
            tugma.classList.add("bg-purple-700");
        }, 1500);

    } catch (xato) {
        console.log("Xatolik:", xato);
        alert("Savatga qo'shishda xatolik yuz berdi");
    }
}



let kirishTugma = document.getElementById("loginBtn");
let kirishOyna = document.getElementById("loginModal");
let kirishYopish = document.getElementById("closeLogin");
let kodOlishTugma = document.getElementById("loginActionBtn");
let telefonInput = document.getElementById("phoneInput");

kirishTugma.addEventListener("click", function() {
    kirishOyna.classList.remove("hidden");
    kirishOyna.classList.add("flex");
});

kirishYopish.addEventListener("click", function() {
    kirishOyna.classList.add("hidden");
    kirishOyna.classList.remove("flex");

    kodOlishTugma.innerHTML = "Kodni olish";
    telefonInput.value = "";
    telefonInput.removeAttribute("disabled");
});

kodOlishTugma.addEventListener("click", function() {
    if (kodOlishTugma.innerHTML.trim() === "Kodni olish") {
        if (telefonInput.value.trim() === "") {
            alert("Iltimos, telefon raqamingizni kiriting!");
            return;
        }

        telefonInput.setAttribute("disabled", true);
        kodOlishTugma.innerHTML = "Tasdiqlash";

    } else {
        alert("Muvaffaqiyatli kirildi!");

        kirishOyna.classList.add("hidden");
        kirishOyna.classList.remove("flex");

        kodOlishTugma.innerHTML = "Kodni olish";
        telefonInput.value = "";
        telefonInput.removeAttribute("disabled");
    }
});



let saralanganTugma = document.getElementById("favoriteBtn");
let saralanganOyna = document.getElementById("favoriteModal");
let saralanganYopish = document.getElementById("closeFavorite");

saralanganTugma.addEventListener("click", function() {
    saralanganOyna.classList.remove("hidden");
    saralanganOyna.classList.add("flex");
});

saralanganYopish.addEventListener("click", function() {
    saralanganOyna.classList.add("hidden");
    saralanganOyna.classList.remove("flex");
});



let savatTugma = document.getElementById("cartBtn");
let savatOyna = document.getElementById("cartModal");
let savatYopish = document.getElementById("closeCart");
let savatJoyi = document.getElementById("cartItems");

savatTugma.addEventListener("click", function() {
    savatOyna.classList.remove("hidden");
    savatOyna.classList.add("flex");
    savatniYukla();
});

savatYopish.addEventListener("click", function() {
    savatOyna.classList.add("hidden");
    savatOyna.classList.remove("flex");
});



async function savatniYukla() {
    try {
        let javob = await fetch("http://localhost:3001/cart");

        if (!javob.ok) {
            throw new Error("Savatni yuklab bo'lmadi");
        }

        let malumot = await javob.json();

        savatJoyi.innerHTML = "";

        if (malumot.length === 0) {
            savatJoyi.innerHTML = "<p class='text-gray-500 text-center py-10'>Savat bo'sh</p>";
            return;
        }

        for (let i = 0; i < malumot.length; i++) {
            let element = savatElementi(malumot[i]);
            savatJoyi.append(element);
        }

    } catch (xato) {
        console.log("Xatolik:", xato);
    }
}



function savatElementi(mahsulot) {
    let div = document.createElement("div");
    div.className = "flex items-center gap-4 p-3 border-b border-gray-100";

    let narx = raqamniChiroyli(mahsulot.price);

    div.innerHTML = `
        <div class="bg-[#f5f5f5] rounded-lg w-20 h-20 shrink-0">
            <img src="${mahsulot.thumbnail}" class="w-full h-full object-contain p-2">
        </div>
        <div class="flex-1">
            <h3 class="text-sm font-medium">${mahsulot.title}</h3>
            <p class="text-purple-700 font-bold mt-1">${narx} so'm</p>
        </div>
        <button class="ochirTugma bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
            🗑 O'chirish
        </button>
    `;

    let ochirTugma = div.querySelector(".ochirTugma");

    ochirTugma.addEventListener("click", function() {
        savatdanOchir(mahsulot.id);
    });

    return div;
}



async function savatdanOchir(id) {
    try {
        let javob = await fetch("http://localhost:3001/cart/" + id, {
            method: "DELETE"
        });

        if (!javob.ok) {
            throw new Error("O'chirishda xatolik");
        }

        savatniYukla();

    } catch (xato) {
        console.log("Xatolik:", xato);
    }
}



mahsulotlarniYukla();