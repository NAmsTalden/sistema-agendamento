import { CalendarioView } from './modules/CalendarioView.js';
import { FormularioView } from './modules/FormularioView.js';
import { Storage } from './utils/Storage.js';

class App {
    constructor() {
        // Inicializa o estado
        this.state = {
            dataAtual: new Date(),
            diaSelecionado: null,
            agendamentos: []
        };

        // Inicializa as views
        this.calendarioView = new CalendarioView('calendario-grid');
        this.formularioView = new FormularioView();

        // Configura os event listeners
        this.setupEventListeners();

        // Carrega os agendamentos e atualiza a visualização
        this.carregarAgendamentos();
    }

    async carregarAgendamentos() {
        this.state.agendamentos = await Storage.getAgendamentos();
        this.atualizarVisualizacao();
    }

    setupEventListeners() {
        // Event listeners para navegação do calendário
        document.getElementById('btn-mes-anterior').addEventListener('click', () => this.mesAnterior());
        document.getElementById('btn-mes-proximo').addEventListener('click', () => this.mesProximo());

        // Event listener para novo agendamento
        document.getElementById('btn-novo-agendamento').addEventListener('click', () => this.novoAgendamento());

        // Event listeners do formulário
        document.addEventListener('formulario:fechado', () => {
            this.state.diaSelecionado = null;
            this.atualizarVisualizacao();
        });

        document.addEventListener('formulario:salvo', async (event) => {
            const agendamento = event.detail;
            
            // Salva o agendamento
            const resultado = await Storage.salvarAgendamentos(agendamento);
            
            if (resultado) {
                // Recarrega os agendamentos para atualizar a visualização
                await this.carregarAgendamentos();
            }
        });

        // Event listener para seleção de dia
        document.addEventListener('calendario:diaSelecionado', (event) => {
            this.state.diaSelecionado = event.detail;
            this.atualizarVisualizacao();
        });
    }

    atualizarVisualizacao() {
        // Atualiza o título do mês
        const mesAtual = document.getElementById('mes-atual');
        mesAtual.textContent = this.state.dataAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        // Atualiza o calendário
        this.calendarioView.renderizar(
            this.state.dataAtual,
            this.state.agendamentos,
            this.state.diaSelecionado
        );

        // Atualiza os detalhes do dia
        this.atualizarDetalhesDia();
    }

    atualizarDetalhesDia() {
        const detalhesDia = document.getElementById('detalhes-dia');
        
        if (!this.state.diaSelecionado) {
            detalhesDia.innerHTML = '<p class="text-muted text-center">Selecione um dia para ver os agendamentos.</p>';
            return;
        }

        // Filtra os agendamentos do dia selecionado
        const agendamentosDoDia = this.state.agendamentos.filter(
            agendamento => agendamento.data === this.state.diaSelecionado
        );

        if (agendamentosDoDia.length === 0) {
            detalhesDia.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3 class="h5 mb-0">Agendamentos para ${new Date(this.state.diaSelecionado).toLocaleDateString('pt-BR')}</h3>
                    <button class="btn btn-primary btn-sm" onclick="document.getElementById('btn-novo-agendamento').click()">
                        <i class="bi bi-plus-lg"></i> Novo
                    </button>
                </div>
                <p class="text-muted">Nenhum agendamento para este dia.</p>
            `;
            return;
        }

        // Ordena os agendamentos por horário de saída
        agendamentosDoDia.sort((a, b) => a.horario_said.localeCompare(b.horario_said));

        // Cria o HTML para cada agendamento
        const agendamentosHTML = agendamentosDoDia.map(agendamento => `
            <div class="card mb-3 border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h4 class="h6 mb-0">
                            <i class="bi bi-clock me-1"></i>
                            ${agendamento.horario_said} - ${agendamento.horario_retor}
                        </h4>
                        <span class="badge bg-primary">${agendamento.veiculo}</span>
                    </div>
                    <div class="mb-2">
                        <div class="small text-muted">
                            <i class="bi bi-geo-alt me-1"></i>
                            Saída: ${agendamento.endereco_sa}
                        </div>
                        <div class="small text-muted">
                            <i class="bi bi-geo-alt-fill me-1"></i>
                            Retorno: ${agendamento.endereco_re}
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="small">
                            <i class="bi bi-person me-1"></i>
                            ${agendamento.motorista}
                        </div>
                        <div class="small text-muted">
                            ${agendamento.passageiros.length} passageiro(s)
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Atualiza o conteúdo
        detalhesDia.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="h5 mb-0">Agendamentos para ${new Date(this.state.diaSelecionado).toLocaleDateString('pt-BR')}</h3>
                <button class="btn btn-primary btn-sm" onclick="document.getElementById('btn-novo-agendamento').click()">
                    <i class="bi bi-plus-lg"></i> Novo
                </button>
            </div>
            ${agendamentosHTML}
        `;
    }

    mesAnterior() {
        this.state.dataAtual = new Date(
            this.state.dataAtual.getFullYear(),
            this.state.dataAtual.getMonth() - 1,
            1
        );
        this.atualizarVisualizacao();
    }

    mesProximo() {
        this.state.dataAtual = new Date(
            this.state.dataAtual.getFullYear(),
            this.state.dataAtual.getMonth() + 1,
            1
        );
        this.atualizarVisualizacao();
    }

    novoAgendamento() {
        this.formularioView.abrir({
            data: this.state.diaSelecionado || new Date().toISOString().split('T')[0]
        });
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new App();
}); 