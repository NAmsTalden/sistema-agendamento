export class VeiculosView {
    constructor(storage) {
        this.storage = storage;
        this.modal = new bootstrap.Modal('#modal-veiculo');
        this.form = document.getElementById('form-veiculo');
        this.btnSalvar = this.form.querySelector('button[type="submit"]');
        this.tabela = document.getElementById('tabela-veiculos');

        this.form.addEventListener('submit', this.salvar.bind(this));
        this.carregarVeiculos();
    }

    async carregarVeiculos() {
        try {
            const veiculos = await this.storage.buscarVeiculos();
            this.renderizarTabela(veiculos);
        } catch (error) {
            console.error('Erro ao carregar veículos:', error);
            this.mostrarToast('Erro ao carregar veículos', 'danger');
        }
    }

    renderizarTabela(veiculos) {
        const tbody = this.tabela.querySelector('tbody');
        tbody.innerHTML = '';

        veiculos.forEach(veiculo => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${veiculo.modelo}</td>
                <td>${veiculo.placa}</td>
                <td>${veiculo.capacidade} passageiros</td>
                <td>
                    <span class="status-badge status-${veiculo.status}">
                        ${veiculo.status === 'disponivel' ? 'Disponível' : 'Indisponível'}
                    </span>
                </td>
                <td>
                    <button type="button" class="btn btn-outline-primary btn-action" onclick="app.veiculos.editar(${veiculo.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-action" onclick="app.veiculos.excluir(${veiculo.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    coletarDados() {
        const dados = {
            id: this.form.id.value || null,
            modelo: this.form.modelo.value.trim(),
            placa: this.form.placa.value.trim().toUpperCase(),
            capacidade: parseInt(this.form.capacidade.value),
            status: this.form.status.value
        };

        if (!dados.modelo) throw new Error('Informe o modelo do veículo');
        if (!dados.placa.match(/[A-Z]{3}[0-9][0-9A-Z][0-9]{2}/)) {
            throw new Error('Placa inválida. Use o formato ABC1234 ou ABC1D23');
        }
        if (isNaN(dados.capacidade) || dados.capacidade < 1 || dados.capacidade > 50) {
            throw new Error('Capacidade deve ser entre 1 e 50 passageiros');
        }
        if (!dados.status) throw new Error('Selecione o status do veículo');

        return dados;
    }

    async salvar(event) {
        event.preventDefault();
        this.btnSalvar.disabled = true;
        this.btnSalvar.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Salvando...';

        try {
            const dados = this.coletarDados();
            await this.storage.salvarVeiculo(dados);
            this.mostrarToast('Veículo salvo com sucesso!', 'success');
            this.modal.hide();
            this.form.reset();
            this.carregarVeiculos();
        } catch (error) {
            console.error('Erro ao salvar veículo:', error);
            this.mostrarToast(error.message || 'Erro ao salvar veículo', 'danger');
        } finally {
            this.btnSalvar.disabled = false;
            this.btnSalvar.textContent = 'Salvar';
        }
    }

    async editar(id) {
        try {
            const veiculo = await this.storage.buscarVeiculoPorId(id);
            if (!veiculo) throw new Error('Veículo não encontrado');

            this.form.id.value = veiculo.id;
            this.form.modelo.value = veiculo.modelo;
            this.form.placa.value = veiculo.placa;
            this.form.capacidade.value = veiculo.capacidade;
            this.form.status.value = veiculo.status;

            this.modal.show();
        } catch (error) {
            console.error('Erro ao carregar veículo:', error);
            this.mostrarToast(error.message || 'Erro ao carregar veículo', 'danger');
        }
    }

    async excluir(id) {
        if (!confirm('Tem certeza que deseja excluir este veículo?')) return;

        try {
            await this.storage.excluirVeiculo(id);
            this.mostrarToast('Veículo excluído com sucesso!', 'success');
            this.carregarVeiculos();
        } catch (error) {
            console.error('Erro ao excluir veículo:', error);
            this.mostrarToast(error.message || 'Erro ao excluir veículo', 'danger');
        }
    }

    abrir() {
        this.form.reset();
        this.form.id.value = '';
        this.modal.show();
    }

    mostrarToast(mensagem, tipo) {
        const toastContainer = document.querySelector('.toast-container') || (() => {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
            return container;
        })();

        const toastElement = document.createElement('div');
        toastElement.className = `toast align-items-center border-0 bg-${tipo}`;
        toastElement.setAttribute('role', 'alert');
        toastElement.innerHTML = `
            <div class="d-flex">
                <div class="toast-body text-white">
                    ${mensagem}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toastElement);
        const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
        toast.show();

        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
            if (!toastContainer.hasChildNodes()) {
                toastContainer.remove();
            }
        });
    }
} 