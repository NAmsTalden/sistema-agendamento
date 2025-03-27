import { Validator } from '../utils/Validator.js';

export class FormularioView {
    constructor() {
        this.modal = new bootstrap.Modal(document.getElementById('modal-formulario'));
        this.form = document.getElementById('form-agendamento');
        this.passageirosContainer = document.getElementById('passageiros-container');
        this.btnAdicionarPassageiro = document.getElementById('adicionar-passageiro');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.btnAdicionarPassageiro.addEventListener('click', () => {
            this.passageirosContainer.appendChild(this.criarLinhaPassageiro());
        });

        this.passageirosContainer.addEventListener('click', (e) => {
            if (e.target.closest('.remover-passageiro') && this.passageirosContainer.children.length > 1) {
                e.target.closest('.input-group').remove();
            }
        });

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.form.checkValidity()) {
                this.dispatchEvent('formulario:salvo', this.coletarDados());
                this.fechar();
            }
            this.form.classList.add('was-validated');
        });
    }

    criarLinhaPassageiro(valor = '') {
        const div = document.createElement('div');
        div.className = 'input-group mb-2';
        div.innerHTML = `
            <input type="text" class="form-control" name="passageiros[]" value="${valor}" required>
            <button type="button" class="btn btn-outline-danger remover-passageiro">
                <i class="bi bi-dash-lg"></i>
            </button>
        `;
        return div;
    }

    abrir(agendamento = null) {
        this.limparFormulario();
        if (agendamento) {
            this.preencherFormulario(agendamento);
        }
        this.modal.show();
    }

    fechar() {
        this.modal.hide();
        this.limparFormulario();
    }

    preencherFormulario(agendamento) {
        ['data', 'horarioSaida', 'horarioRetorno', 'enderecoSaida', 
         'enderecoRetorno', 'veiculo', 'motorista'].forEach(campo => {
            this.form.elements[campo].value = agendamento[campo] || '';
        });

        if (agendamento.passageiros?.length > 0) {
            this.atualizarPassageiros(agendamento.passageiros);
        }
    }

    limparFormulario() {
        this.form.reset();
        this.form.classList.remove('was-validated');
        this.atualizarPassageiros(['']);
    }

    atualizarPassageiros(passageiros) {
        this.passageirosContainer.innerHTML = '';
        passageiros.forEach(passageiro => {
            this.passageirosContainer.appendChild(this.criarLinhaPassageiro(passageiro));
        });
    }

    coletarDados() {
        const formData = new FormData(this.form);
        return {
            data: formData.get('data'),
            horario_said: formData.get('horarioSaida'),
            horario_retor: formData.get('horarioRetorno'),
            endereco_sa: formData.get('enderecoSaida'),
            endereco_re: formData.get('enderecoRetorno'),
            veiculo: formData.get('veiculo'),
            motorista: formData.get('motorista'),
            passageiros: formData.getAll('passageiros[]').filter(p => p.trim())
        };
    }

    dispatchEvent(name, detail) {
        document.dispatchEvent(new CustomEvent(name, { 
            bubbles: true,
            detail 
        }));
    }
} 