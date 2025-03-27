export class Storage {
    static salvar(chave, dados) {
        try {
            localStorage.setItem(chave, JSON.stringify(dados));
        } catch (erro) {
            console.error('Erro ao salvar dados:', erro);
        }
    }

    static carregar(chave) {
        try {
            const dados = localStorage.getItem(chave);
            return dados ? JSON.parse(dados) : null;
        } catch (erro) {
            console.error('Erro ao carregar dados:', erro);
            return null;
        }
    }

    static remover(chave) {
        try {
            localStorage.removeItem(chave);
            return true;
        } catch (erro) {
            console.error('Erro ao remover dados:', erro);
            return false;
        }
    }

    static limpar() {
        try {
            localStorage.clear();
            return true;
        } catch (erro) {
            console.error('Erro ao limpar dados:', erro);
            return false;
        }
    }
} 