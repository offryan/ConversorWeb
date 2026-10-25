const API_URL = "https://conversorapi.onrender.com/convert";

const origem = document.getElementById("origem");
const destino = document.getElementById("destino");
const arquivoInput = document.getElementById("arquivo");
const botao = document.getElementById("converter");
const status = document.getElementById("status");

function mostrarStatus(texto, tipo = "") {
    status.textContent = texto;
    status.className = tipo;
}

// O seletor de arquivos só mostra arquivos do tipo escolhido
origem.addEventListener("change", () => {
    arquivoInput.accept = origem.value === "ICS" ? ".ics" : ".mbox";
    arquivoInput.value = "";
    mostrarStatus("");
});

document.getElementById("formulario").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const arquivo = arquivoInput.files[0];
    if (!arquivo) {
        mostrarStatus("Selecione um arquivo.", "erro");
        return;
    }

    const formData = new FormData();
    formData.append("file", arquivo);
    formData.append("origem", origem.value);
    formData.append("destino", destino.value);

    botao.disabled = true;
    // A API fica no plano gratuito do Render, que "dorme" depois de um tempo sem uso
    const aviso = setTimeout(() => mostrarStatus("Acordando o servidor, pode levar até 1 minuto..."), 5000);
    mostrarStatus("Convertendo...");

    try {
        const response = await fetch(API_URL, { method: "POST", body: formData });
        const tipo = response.headers.get("content-type") || "";

        // Em caso de erro a API responde um JSON {"erro": "..."} em vez do arquivo
        if (!response.ok || tipo.includes("application/json")) {
            const corpo = tipo.includes("application/json") ? await response.json() : {};
            throw new Error(corpo.erro || corpo.detail || "não foi possível converter o arquivo.");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = arquivo.name.replace(/\.[^.]+$/, "") + "." + destino.value.toLowerCase();
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        mostrarStatus("Conversão concluída!", "ok");
    } catch (error) {
        mostrarStatus("Erro: " + error.message, "erro");
    } finally {
        clearTimeout(aviso);
        botao.disabled = false;
    }
});
