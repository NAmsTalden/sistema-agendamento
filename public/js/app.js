import { supabase } from './supabase.js';
import { CalendarioView } from './modules/CalendarioView.js';
import { FormularioView } from './modules/FormularioView.js';
import { Storage } from './modules/Storage.js';

class App {
    constructor() {
        this.storage = new Storage(supabase);
        this.calendario = new CalendarioView('calendario');
        this.formulario = new FormularioView();
        this.dataAtual = new Date();
        this.diaSelecionado = null;
        this.agendamentos = [];
        
        this.setupEventListeners();
        this.carregarAgendamentos();
    }

    setupEventListeners() {
        document.addEventListener('calendario:diaSelecionado', (e) => {
            this.diaSelecionado = e.detail;
            this.atualizarAgendamentosParaData(this.diaSelecionado);
        });

        document.addEventListener('formulario:salvo', async (e) => {
            try {
                await this.storage.salvarAgendamento(e.detail);
                await this.carregarAgendamentos();
                return true;
            } catch (error) {
                console.error('Erro ao salvar agendamento:', error);
                throw error;
            }
        });

        document.addEventListener('formulario:fechado', () => {
            this.diaSelecionado = null;
            this.calendario.renderizar(this.dataAtual, this.agendamentos, null);
        });

        document.querySelector('#novo-agendamento').addEventListener('click', () => {
            if (this.diaSelecionado) {
                this.formulario.abrir({ data: this.diaSelecionado });
            } else {
                alert('Por favor, selecione uma data no calendário.');
            }
        });
    }

    async carregarAgendamentos() {
        try {
            this.agendamentos = await this.storage.buscarAgendamentos();
            this.calendario.renderizar(this.dataAtual, this.agendamentos, this.diaSelecionado);
            if (this.diaSelecionado) {
                this.atualizarAgendamentosParaData(this.diaSelecionado);
            }
        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
            alert('Erro ao carregar agendamentos. Por favor, tente novamente.');
        }
    }

    atualizarAgendamentosParaData(data) {
        const agendamentosNoDia = this.agendamentos.filter(a => a.data === data);
        const detalhesContainer = document.getElementById('detalhes-agendamentos');
        
        if (!detalhesContainer) return;

        if (agendamentosNoDia.length === 0) {
            detalhesContainer.innerHTML = `
                <div class="text-center text-muted p-4">
                    <i class="bi bi-calendar-x fs-1"></i>
                    <p class="mt-2">Nenhum agendamento para esta data.</p>
                </div>
            `;
            return;
        }

        detalhesContainer.innerHTML = `
            <div class="list-group">
                ${agendamentosNoDia.map(agendamento => `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <h6 class="mb-1">Horário: ${agendamento.horario_said} - ${agendamento.horario_retor}</h6>
                            <span class="badge bg-primary rounded-pill">${agendamento.passageiros.length} passageiros</span>
                        </div>
                        <p class="mb-1"><strong>Saída:</strong> ${agendamento.endereco_sa}</p>
                        <p class="mb-1"><strong>Retorno:</strong> ${agendamento.endereco_re}</p>
                        <p class="mb-1"><strong>Veículo:</strong> ${agendamento.veiculo}</p>
                        <p class="mb-1"><strong>Motorista:</strong> ${agendamento.motorista}</p>
                        <div class="mt-2">
                            <small class="text-muted">Passageiros:</small>
                            <ul class="list-unstyled ms-3 mb-0">
                                ${agendamento.passageiros.map(p => `<li>${p}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Inicializa a aplicação
document.addEventListener('DOMContentLoaded', () => {
    new App();
}); 