import { Validator } from '../utils/Validator.js';

export class FormularioView {
    constructor() {
        this.modal = new bootstrap.Modal(document.getElementById('modal-formulario'));
        this.form = document.getElementById('form-agendamento');
        this.passageirosContainer = document.getElementById('passageiros-container');
        this.btnAdicionarPassageiro = document.getElementById('adicionar-passageiro');
        this.btnSalvar = this.form.querySelector('button[type="submit"]');

        this.setupEventListeners();
        this.setupValidation();
    }

    setupEventListeners() {
        this.btnAdicionarPassageiro.addEventListener('click', () => {
            const novaLinha = this.criarLinhaPassageiro();
            this.passageirosContainer.appendChild(novaLinha);
            novaLinha.querySelector('input').focus();
            this.atualizarBotaoRemover();
        });

        this.passageirosContainer.addEventListener('click', (e) => {
            if (e.target.closest('.remover-passageiro')) {
                e.target.closest('.input-group').remove();
                this.atualizarBotaoRemover();
            }
        });

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (this.form.checkValidity()) {
                this.iniciarCarregamento();
                try {
                    await this.dispatchEvent('formulario:salvo', this.coletarDados());
                    this.fechar();
                    this.mostrarToast('Agendamento salvo com sucesso!', 'success');
                } catch (error) {
                    console.error('Erro ao salvar:', error);
                    this.mostrarToast('Erro ao salvar o agendamento. Tente novamente.', 'danger');
                } finally {
                    this.finalizarCarregamento();
                }
            }
            this.form.classList.add('was-validated');
        });

        // Validação em tempo real
        this.form.querySelectorAll('input, select').forEach(campo => {
            campo.addEventListener('input', () => {
                this.validarCampo(campo);
            });

            campo.addEventListener('blur', () => {
                this.validarCampo(campo);
            });
        });
    }

    setupValidation() {
        this.validator = new Validator({
            'horarioSaida': {
                required: true,
                message: 'Informe o horário de saída'
            },
            'horarioRetorno': {
                required: true,
                message: 'Informe o horário de retorno'
            },
            'enderecoSaida': {
                required: true,
                minLength: 5,
                message: 'Informe o endereço de saída (mínimo 5 caracteres)'
            },
            'enderecoRetorno': {
                required: true,
                minLength: 5,
                message: 'Informe o endereço de retorno (mínimo 5 caracteres)'
            },
            'veiculo': {
                required: true,
                message: 'Selecione um veículo'
            },
            'motorista': {
                required: true,
                message: 'Selecione um motorista'
            }
        });
    }

    validarCampo(campo) {
        const isValid = campo.checkValidity();
        campo.classList.toggle('is-valid', isValid);
        campo.classList.toggle('is-invalid', !isValid);
        
        const feedbackElement = campo.nextElementSibling;
        if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
            feedbackElement.textContent = campo.validationMessage;
        }
    }

    criarLinhaPassageiro(valor = '') {
        const div = document.createElement('div');
        div.className = 'input-group mb-2 fade-in';
        div.innerHTML = `
            <input type="text" class="form-control" name="passageiros[]" 
                   value="${valor}" required placeholder="Nome do passageiro"
                   minlength="3">
            <button type="button" class="btn btn-outline-danger remover-passageiro">
                <i class="bi bi-trash"></i>
            </button>
            <div class="invalid-feedback">
                Informe o nome do passageiro (mínimo 3 caracteres)
            </div>
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
        this.dispatchEvent('formulario:fechado');
    }

    preencherFormulario(agendamento) {
        const campos = {
            data: 'data',
            horario_said: 'horarioSaida',
            horario_retor: 'horarioRetorno',
            endereco_sa: 'enderecoSaida',
            endereco_re: 'enderecoRetorno',
            veiculo: 'veiculo',
            motorista: 'motorista'
        };

        Object.entries(campos).forEach(([chave, campo]) => {
            if (agendamento[chave]) {
                this.form.elements[campo].value = agendamento[chave];
                this.validarCampo(this.form.elements[campo]);
            }
        });

        if (agendamento.passageiros?.length > 0) {
            this.atualizarPassageiros(agendamento.passageiros);
        }
    }

    limparFormulario() {
        this.form.reset();
        this.form.classList.remove('was-validated');
        this.form.querySelectorAll('.is-valid, .is-invalid').forEach(campo => {
            campo.classList.remove('is-valid', 'is-invalid');
        });
        this.atualizarPassageiros(['']);
    }

    atualizarPassageiros(passageiros) {
        this.passageirosContainer.innerHTML = '';
        passageiros.forEach(passageiro => {
            this.passageirosContainer.appendChild(this.criarLinhaPassageiro(passageiro));
        });
        this.atualizarBotaoRemover();
    }

    atualizarBotaoRemover() {
        const botoes = this.passageirosContainer.querySelectorAll('.remover-passageiro');
        botoes.forEach(btn => {
            btn.disabled = this.passageirosContainer.children.length <= 1;
        });
    }

    coletarDados() {
        const formData = new FormData(this.form);
        const dados = {
            data: formData.get('data'),
            horario_said: formData.get('horarioSaida'),
            horario_retor: formData.get('horarioRetorno'),
            endereco_sa: formData.get('enderecoSaida'),
            endereco_re: formData.get('enderecoRetorno'),
            veiculo: formData.get('veiculo'),
            motorista: formData.get('motorista'),
            passageiros: formData.getAll('passageiros[]').filter(p => p.trim())
        };

        // Validação dos dados
        if (!dados.data) {
            throw new Error('Data é obrigatória');
        }

        if (!dados.horario_said || !dados.horario_retor) {
            throw new Error('Horários são obrigatórios');
        }

        if (!dados.endereco_sa || !dados.endereco_re) {
            throw new Error('Endereços são obrigatórios');
        }

        if (!dados.veiculo) {
            throw new Error('Veículo é obrigatório');
        }

        if (!dados.motorista) {
            throw new Error('Motorista é obrigatório');
        }

        if (!dados.passageiros || dados.passageiros.length === 0) {
            throw new Error('Pelo menos um passageiro é obrigatório');
        }

        console.log('Dados coletados:', dados);
        return dados;
    }

    iniciarCarregamento() {
        this.btnSalvar.disabled = true;
        this.btnSalvar.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Salvando...
        `;
    }

    finalizarCarregamento() {
        this.btnSalvar.disabled = false;
        this.btnSalvar.innerHTML = 'Salvar';
    }

    mostrarToast(mensagem, tipo) {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1050';
        
        const toastElement = document.createElement('div');
        toastElement.className = `toast align-items-center text-white bg-${tipo} border-0`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');
        
        toastElement.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${mensagem}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toastElement);
        document.body.appendChild(toastContainer);
        
        const toast = new bootstrap.Toast(toastElement, {
            animation: true,
            autohide: true,
            delay: 3000
        });
        
        toast.show();
        
        toastElement.addEventListener('hidden.bs.toast', () => {
            document.body.removeChild(toastContainer);
        });
    }

    dispatchEvent(eventName, detail = null) {
        console.log('Disparando evento:', eventName, detail);
        try {
            const event = new CustomEvent(eventName, { 
                detail,
                bubbles: true,
                cancelable: true
            });
            const success = document.dispatchEvent(event);
            if (!success) {
                throw new Error('Evento cancelado');
            }
            return success;
        } catch (error) {
            console.error('Erro ao disparar evento:', error);
            throw error;
        }
    }
} 