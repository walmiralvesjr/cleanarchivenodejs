const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Função para verificar e deletar arquivos antigos
function verificarEDeletarArquivosAntigos(files) {
    const agora = new Date();
    const resultados = [];

    return new Promise((resolve) => {
        files.forEach(file => {
            const filePath = path.resolve(file); // Resolve o caminho completo do arquivo
            
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    resultados.push({ fileName: file, status: `Erro ao obter informações do arquivo: ${err}` });
                    return;
                }

                const tempoDeCriacao = new Date(stats.birthtime);
                const diffEmMilissegundos = agora - tempoDeCriacao;
                const diffEmDias = diffEmMilissegundos / (1000 * 60 * 60 * 24);

                if (diffEmDias > 7) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            resultados.push({ fileName: file, status: `Erro ao deletar o arquivo: ${err}` });
                        } else {
                            resultados.push({ fileName: file, status: 'Deletado com sucesso' });
                        }
                    });
                } else {
                    resultados.push({ fileName: file, status: 'Mantido (menos de 7 dias)' });
                }
            });
        });

        setTimeout(() => resolve(resultados), 1000); // Aguardar conclusão
    });
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve arquivos estáticos (HTML, CSS)

app.post('/limpar-arquivos', async (req, res) => {
    const { files } = req.body;

    try {
        const resultados = await verificarEDeletarArquivosAntigos(files);
        res.json(resultados);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao limpar arquivos: ' + err });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
