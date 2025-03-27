export class MotoristasView {
    constructor(storage) {
        this.storage = storage;
        this.modal = new bootstrap.Modal('#modal-motorista');
        this.form = document.getElementById('form-motorista');
        this.btnSalvar = this.form.querySelector('button[type="submit"]');
        this.tabela = document.getElementById('tabela-motoristas');

        this.form.addEventListener('submit', this.salvar.bind(this));
        this.carregarMotoristas();

        // Formatar telefone automaticamente
        this.form.telefone.addEventListener('input', this.formatarTelefone.bind(this));
    }

    async carregarMotoristas() {
        try {
            const motoristas = await this.storage.buscarMotoristas();
            this.renderizarTabela(motoristas);
        } catch (error) {
            console.error('Erro ao carregar motoristas:', error);
            this.mostrarToast('Erro ao carregar motoristas', 'danger');
        }
    }

    renderizarTabela(motoristas) {
        const tbody = this.tabela.querySelector('tbody');
        tbody.innerHTML = '';

        motoristas.forEach(motorista => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${motorista.nome}</td>
                <td>${this.formatarCNH(motorista.cnh)}</td>
                <td>${motorista.telefone}</td>
                <td>
                    <span class="status-badge status-${motorista.status}">
                        ${motorista.status === 'disponivel' ? 'Disponível' : 'Indisponível'}
                    </span>
                </td>
                <td>
                    <button type="button" class="btn btn-outline-primary btn-action" onclick="app.motoristas.editar(${motorista.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-action" onclick="app.motoristas.excluir(${motorista.id})">
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
            nome: this.form.nome.value.trim(),
            cnh: this.form.cnh.value.replace(/\D/g, ''),
            telefone: this.form.telefone.value.replace(/\D/g, ''),
            status: this.form.status.value
        };

        if (!dados.nome) throw new Error('Informe o nome do motorista');
        if (dados.cnh.length !== 11) throw new Error('CNH deve ter 11 números');
        if (dados.telefone.length !== 11) throw new Error('Telefone deve ter 11 números');
        if (!dados.status) throw new Error('Selecione o status do motorista');

        return dados;
    }

    async salvar(event) {
        event.preventDefault();
        this.btnSalvar.disabled = true;
        this.btnSalvar.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Salvando...';

        try {
            const dados = this.coletarDados();
            await this.storage.salvarMotorista(dados);
            this.mostrarToast('Motorista salvo com sucesso!', 'success');
            this.modal.hide();
            this.form.reset();
            this.carregarMotoristas();
        } catch (error) {
            console.error('Erro ao salvar motorista:', error);
            this.mostrarToast(error.message || 'Erro ao salvar motorista', 'danger');
        } finally {
            this.btnSalvar.disabled = false;
            this.btnSalvar.textContent = 'Salvar';
        }
    }

    async editar(id) {
        try {
            const motorista = await this.storage.buscarMotoristaPorId(id);
            if (!motorista) throw new Error('Motorista não encontrado');

            this.form.id.value = motorista.id;
            this.form.nome.value = motorista.nome;
            this.form.cnh.value = motorista.cnh;
            this.form.telefone.value = this.formatarTelefoneParaExibicao(motorista.telefone);
            this.form.status.value = motorista.status;

            this.modal.show();
        } catch (error) {
            console.error('Erro ao carregar motorista:', error);
            this.mostrarToast(error.message || 'Erro ao carregar motorista', 'danger');
        }
    }

    async excluir(id) {
        if (!confirm('Tem certeza que deseja excluir este motorista?')) return;

        try {
            await this.storage.excluirMotorista(id);
            this.mostrarToast('Motorista excluído com sucesso!', 'success');
            this.carregarMotoristas();
        } catch (error) {
            console.error('Erro ao excluir motorista:', error);
            this.mostrarToast(error.message || 'Erro ao excluir motorista', 'danger');
        }
    }

    abrir() {
        this.form.reset();
        this.form.id.value = '';
        this.modal.show();
    }

    formatarCNH(cnh) {
        return cnh.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    formatarTelefone(event) {
        let telefone = event.target.value.replace(/\D/g, '');
        
        if (telefone.length > 11) {
            telefone = telefone.slice(0, 11);
        }
        
        if (telefone.length >= 11) {
            telefone = telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        } else if (telefone.length >= 7) {
            telefone = telefone.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3');
        } else if (telefone.length >= 2) {
            telefone = telefone.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        }
        
        event.target.value = telefone;
    }

    formatarTelefoneParaExibicao(telefone) {
        return telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
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