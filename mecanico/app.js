// app.js optimizado
// ---------------------------------------------
// VARIABLES GLOBALES
// ---------------------------------------------
let ot = "";

const insumos = [
    { id: 1, nombre: 'Filtro de Aceite', completado: false },
    { id: 2, nombre: 'Filtro de Aire', completado: false },
    { id: 3, nombre: 'Filtro de Combustible', completado: false }
];

// ---------------------------------------------
// INICIALIZACIÓN
// ---------------------------------------------
window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    ot = urlParams.get("ot") || "";

    document.getElementById('OT').textContent = ot;
    document.getElementById('uni').textContent = "TR-377";
});

// ---------------------------------------------
// CONSTRUCTOR DE LISTA DE INSUMOS
// ---------------------------------------------
function mostrarLista() {
    const lista = document.getElementById("list");
    lista.innerHTML = "";

    insumos.forEach(item => {
        const btn = document.createElement("button");
        btn.className = "item-insumo";

        const name = document.createElement("span");
        name.textContent = item.nombre;

        const iconScan = document.createElement("img");
        iconScan.className = "icon-scan";
        iconScan.src = "https://www.svgrepo.com/show/379577/qr-code-scan.svg";

        const iconCancel = document.createElement("img");
        iconCancel.className = "icon-cancel";
        iconCancel.src = "https://www.svgrepo.com/show/474763/cancel.svg";
        iconCancel.title = "Cancelar / Devolución";
        iconCancel.addEventListener("click", e => {
            e.stopPropagation();
            alert(`Insumo cancelado: ${item.nombre}`);
        });

        const iconOK = document.createElement("img");
        iconOK.className = "icon-ok";
        iconOK.src = "https://www.svgrepo.com/show/533007/check.svg";
        iconOK.style.display = item.completado ? "block" : "none";

        btn.addEventListener("click", () => {
            EnviarTexto('activaScanner', 3, ot);
        });

        btn.append(name, iconScan, iconCancel, iconOK);
        lista.appendChild(btn);
    });
}

// ---------------------------------------------
// ACTUALIZACIÓN DE IMÁGENES
// ---------------------------------------------
function actualizarImg(base64Str, id) {
    const src = "data:image/png;base64," + base64Str;
    const img = document.getElementById(id);
    img.src = src;

    const imgMini = document.createElement("img");
    imgMini.src = src;
    imgMini.className = "img-thumb";

    document.getElementById("imgdata").appendChild(imgMini);
}

// ---------------------------------------------
// COMUNICACIÓN CON MAUI
// ---------------------------------------------
function EnviarTexto(texto, id = "", ot = "") {
    if (id == 1) {
        document.getElementById("bmain").style.display = "block";
        document.getElementById("scanC").style.display = "none";
        mostrarLista();
    }

    window.location.href = `maui://message?data=${texto}|${id}|${ot}`;

    if (typeof invokeXamarinFormsAction === 'function') {
        invokeXamarinFormsAction(texto);
    }
}

// ---------------------------------------------
// RECIBIR DATOS DESDE MAUI
// ---------------------------------------------
function recibirTexto(tipo, texto, id, ot) {
    switch (tipo) {
        case 'base64':
            actualizarImg(texto, "evidencia");
            break;

        case 'mensaje':
            alert(texto);
            break;

        case 'codigoescaneado':
            document.getElementById("barcode").textContent = texto;
            revisarQR(texto, id);
            break;
    }
}

// ---------------------------------------------
// REVISIÓN DE QR
// ---------------------------------------------
function revisarQR(QR, id) {
    if (id == 1) validarQRT(QR);
    else if (id == 3) validarQRI(QR);
}

// ---------------------------------------------
// QR INSUMO
// ---------------------------------------------
async function validarQRI(codigo) {
    try {
        const res = await fetch(`https://api.unspokenone.com/test/TR-377`);
        const data = await res.json();

        if (data.status === "ok") {
            window.location.href = `maui://message?data=activaCamara|3|${ot}`;

            // marcar insumo como completado
            marcarInsumoCompletado();
        } else {
            alert("QR no válido");
        }
    } catch (e) {
        alert("Error de conexión con API");
    }
}

// Marca el primer insumo pendiente
function marcarInsumoCompletado() {
    const item = insumos.find(x => !x.completado);
    if (item) item.completado = true;
    mostrarLista();
}

// ---------------------------------------------
// QR TRACTO
// ---------------------------------------------
async function validarQRT(codigo) {
    try {
        const serie = codigo.split("|")[0];
        const res = await fetch(`https://api.unspokenone.com/test/${serie}`);
        const data = await res.json();

        if (data.status === "ok") {
            document.getElementById("bmain").style.display = "block";
            document.getElementById("scanC").style.display = "none";
            mostrarLista();
        } else {
            alert("QR no válido");
        }
    } catch (e) {
        alert("Error de conexión con API");
    }
}