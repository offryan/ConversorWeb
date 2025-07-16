async function enviarArquivo() {
            const origem = document.getElementById("origem").value;
            const destino = document.getElementById("destino").value;
            const arquivo = document.getElementById("arquivo").files[0];
            const status = document.getElementById("status");

            if (!arquivo) {
                status.textContent = "Por favor, selecione um arquivo.";
                return;
            }

            const formData = new FormData();
            formData.append("file", arquivo);
            formData.append("origem", origem);
            formData.append("destino", destino);

            status.textContent = "Convertendo...";

            try {
                const response = await fetch("https://seu-backend.onrender.com/convert", {
                    method: "POST",
                    body: formData
                });

                if (!response.ok) {
                    throw new Error("Erro na conversão.");
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "convertido." + destino.toLowerCase();
                document.body.appendChild(a);
                a.click();
                a.remove();
                status.textContent = "Conversão concluída!";
            } catch (error) {
                status.textContent = "Erro: " + error.message;
            }
        }