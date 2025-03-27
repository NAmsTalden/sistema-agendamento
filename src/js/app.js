import { Storage } from './utils/Storage.js';
import { Validator } from './utils/Validator.js';
import { CalendarioView } from './modules/CalendarioView.js';
import { FormularioView } from './modules/FormularioView.js';

class App {
    constructor() {
        // Estado inicial
        this.estado = {
            mes: new Date().getMonth(),
            ano: new Date().getFullYear(),
            diaSelecionado: null,
            agendamentos: []
        };

        // Inicializa as views
        this.calendarioView = new CalendarioView();
        this.formularioView = new FormularioView();

        // Carrega os agendamentos salvos
        this.carregarAgendamentos();
        
        // Configura os event listeners
        this.setupEventListeners();
        
        // Atualiza a visualização inicial
        this.atualizarVisualizacao();
    }

    setupEventListeners() {
        // Navegação do calendário
        document.getElementById('btn-mes-anterior').addEventListener('click', () => this.mesAnterior());
        document.getElementById('btn-mes-proximo').addEventListener('click', () => this.mesProximo());
        
        // Seleção de dia
        document.addEventListener('selecionar-dia', (e) => {
            this.estado.diaSelecionado = e.detail.data;
            this.atualizarVisualizacao();
        });

        // Novo agendamento
        document.getElementById('btn-novo-agendamento').addEventListener('click', () => {
            this.formularioView.abrir({
                data: this.estado.diaSelecionado || this.formatarData(new Date())
            });
        });

        // Salvar agendamento
        this.formularioView.form.addEventListener('agendamento:salvar', (e) => {
            try {
                const dados = e.detail;
                Validator.validarAgendamento(dados);
                
                // Gera um ID único para o agendamento
                dados.id = crypto.randomUUID();
                
                // Adiciona o agendamento à lista
                this.estado.agendamentos.push(dados);
                
                // Salva no storage e atualiza a visualização
                this.salvarAgendamentos();
                this.atualizarVisualizacao();
                
                // Mostra mensagem de sucesso
                this.mostrarMensagem('Agendamento salvo com sucesso!', 'success');
            } catch (erro) {
                this.mostrarMensagem(erro.message, 'danger');
            }
        });
    }

    atualizarVisualizacao() {
        // Atualiza o calendário
        this.calendarioView.atualizar(this.estado);

        // Atualiza a visualização dos detalhes do dia
        const detalhesContainer = document.getElementById('detalhes-dia');
        if (!detalhesContainer) return;

        if (!this.estado.diaSelecionado) {
            detalhesContainer.innerHTML = '<p class="text-muted text-center">Selecione um dia para ver os agendamentos.</p>';
            return;
        }

        // Filtra e ordena os agendamentos do dia
        const agendamentosDoDia = this.estado.agendamentos
            .filter(a => a.data === this.estado.diaSelecionado)
            .sort((a, b) => a.horarioSaida.localeCompare(b.horarioSaida));

        if (agendamentosDoDia.length === 0) {
            detalhesContainer.innerHTML = `
                <div class="text-center p-4">
                    <p class="text-muted">Nenhum agendamento para ${this.formatarDataExibicao(this.estado.diaSelecionado)}</p>
                    <button class="btn btn-primary mt-3" id="btn-novo">Novo Agendamento</button>
                </div>
            `;
            return;
        }

        // Cria o cabeçalho com a data e botão de novo agendamento
        let html = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="h4 mb-0">Agendamentos para ${this.formatarDataExibicao(this.estado.diaSelecionado)}</h2>
                <button class="btn btn-primary" id="btn-novo">Novo Agendamento</button>
            </div>
        `;

        // Adiciona os cards de agendamento
        html += agendamentosDoDia.map(agendamento => `
            <div class="agendamento-card">
                <h3 class="h5 mb-3">
                    <i class="bi bi-clock"></i> ${agendamento.horarioSaida} - ${agendamento.horarioRetorno}
                </h3>
                <dl class="agendamento-info">
                    <dt><i class="bi bi-car-front"></i> Veículo</dt>
                    <dd>${agendamento.veiculo}</dd>

                    <dt><i class="bi bi-person"></i> Motorista</dt>
                    <dd>${agendamento.motorista}</dd>

                    <dt><i class="bi bi-geo-alt"></i> Saída</dt>
                    <dd>${agendamento.enderecoSaida}</dd>

                    <dt><i class="bi bi-geo-alt-fill"></i> Retorno</dt>
                    <dd>${agendamento.enderecoRetorno}</dd>

                    <dt><i class="bi bi-people"></i> Passageiros</dt>
                    <dd>
                        <ul class="list-unstyled mb-0">
                            ${agendamento.passageiros.map(p => `
                                <li><i class="bi bi-person-circle"></i> ${p}</li>
                            `).join('')}
                        </ul>
                    </dd>
                </dl>
                <div class="mt-3 d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary" 
                            onclick="app.editarAgendamento('${agendamento.id}')">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger" 
                            onclick="app.excluirAgendamento('${agendamento.id}')">
                        <i class="bi bi-trash"></i> Excluir
                    </button>
                </div>
            </div>
        `).join('');

        detalhesContainer.innerHTML = html;

        // Adiciona evento ao botão de novo agendamento
        document.getElementById('btn-novo')?.addEventListener('click', () => {
            this.formularioView.abrir({
                data: this.estado.diaSelecionado
            });
        });
    }

    mesAnterior() {
        if (this.estado.mes === 0) {
            this.estado.mes = 11;
            this.estado.ano--;
        } else {
            this.estado.mes--;
        }
        this.atualizarVisualizacao();
    }

    mesProximo() {
        if (this.estado.mes === 11) {
            this.estado.mes = 0;
            this.estado.ano++;
        } else {
            this.estado.mes++;
        }
        this.atualizarVisualizacao();
    }

    editarAgendamento(id) {
        const agendamento = this.estado.agendamentos.find(a => a.id === id);
        if (agendamento) {
            this.formularioView.abrir(agendamento);
        }
    }

    excluirAgendamento(id) {
        if (confirm('Tem certeza que deseja excluir este agendamento?')) {
            this.estado.agendamentos = this.estado.agendamentos.filter(a => a.id !== id);
            this.salvarAgendamentos();
            this.atualizarVisualizacao();
            this.mostrarMensagem('Agendamento excluído com sucesso!', 'success');
        }
    }

    carregarAgendamentos() {
        const agendamentos = Storage.carregar('agendamentos');
        if (agendamentos) {
            this.estado.agendamentos = agendamentos;
        }
    }

    salvarAgendamentos() {
        Storage.salvar('agendamentos', this.estado.agendamentos);
    }

    formatarData(data) {
        const dia = data.getDate().toString().padStart(2, '0');
        const mes = (data.getMonth() + 1).toString().padStart(2, '0');
        const ano = data.getFullYear();
        return `${dia}/${mes}/${ano}`;
    }

    formatarDataExibicao(dataString) {
        const [dia, mes, ano] = dataString.split('/');
        const data = new Date(ano, mes - 1, dia);
        return data.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    }

    mostrarMensagem(texto, tipo) {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${tipo} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${texto}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        const container = document.createElement('div');
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.appendChild(toast);
        document.body.appendChild(container);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            container.remove();
        });
    }
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 