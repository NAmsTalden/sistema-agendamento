import { supabase } from './modules/supabase.js';
import { CalendarioView } from './modules/CalendarioView.js';
import { FormularioView } from './modules/FormularioView.js';
import { VeiculosView } from './modules/VeiculosView.js';
import { MotoristasView } from './modules/MotoristasView.js';
import { Storage } from './modules/Storage.js';

class App {
    constructor() {
        this.storage = new Storage();
        this.calendario = new CalendarioView();
        this.formulario = new FormularioView();
        this.veiculos = new VeiculosView();
        this.motoristas = new MotoristasView();

        this.setupNavegacao();
        this.setupEventListeners();
        this.carregarDadosIniciais();

        console.log('App inicializado com sucesso!');
    }

    setupNavegacao() {
        const views = ['agenda', 'veiculos', 'motoristas'];
        const links = document.querySelectorAll('.nav-link');

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                
                // Atualiza links
                links.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Atualiza views
                views.forEach(view => {
                    const el = document.getElementById(view);
                    el.classList.toggle('d-none', view !== targetId);
                });
            });
        });
    }

    setupEventListeners() {
        // Eventos do calendário
        this.calendario.addEventListener('selecao', ({ data }) => {
            this.atualizarAgendamentosParaData(data);
        });

        // Eventos do formulário
        document.getElementById('novo-agendamento').addEventListener('click', () => {
            const data = this.calendario.getDataSelecionada();
            if (data) {
                this.formulario.abrir(data);
            } else {
                this.mostrarToast('Selecione uma data primeiro', 'warning');
            }
        });

        this.formulario.addEventListener('salvo', () => {
            const data = this.calendario.getDataSelecionada();
            if (data) {
                this.atualizarAgendamentosParaData(data);
            }
        });
    }

    async carregarDadosIniciais() {
        try {
            // Carrega veículos e motoristas para o formulário
            const [veiculos, motoristas] = await Promise.all([
                this.storage.buscarVeiculos(),
                this.storage.buscarMotoristas()
            ]);

            this.formulario.atualizarVeiculos(veiculos);
            this.formulario.atualizarMotoristas(motoristas);

            // Carrega agendamentos do dia atual
            const hoje = new Date();
            this.calendario.renderizar();
            this.atualizarAgendamentosParaData(hoje);

            console.log('Dados iniciais carregados com sucesso!');
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            this.mostrarToast('Erro ao carregar dados iniciais', 'danger');
        }
    }

    async atualizarAgendamentosParaData(data) {
        try {
            const agendamentos = await this.storage.buscarAgendamentos(data);
            const container = document.getElementById('detalhes-agendamentos');
            
            if (agendamentos.length === 0) {
                container.innerHTML = `
                    <div class="text-center text-muted p-4">
                        <i class="bi bi-calendar-x fs-1"></i>
                        <p class="mt-2">Nenhum agendamento para esta data.</p>
                    </div>
                `;
                return;
            }

            // Ordena por horário de saída
            agendamentos.sort((a, b) => a.horarioSaida.localeCompare(b.horarioSaida));

            const html = `
                <div class="list-group list-group-flush">
                    ${agendamentos.map(agendamento => `
                        <div class="list-group-item">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <div class="mb-1">
                                        <strong>Horário:</strong> ${agendamento.horarioSaida} - ${agendamento.horarioRetorno}
                                    </div>
                                    <div class="mb-1">
                                        <strong>Veículo:</strong> ${this.getVeiculoNome(agendamento.veiculo)}
                                    </div>
                                    <div class="mb-1">
                                        <strong>Motorista:</strong> ${this.getMotoristaNome(agendamento.motorista)}
                                    </div>
                                    <div class="mb-1">
                                        <strong>Saída:</strong> ${agendamento.enderecoSaida}
                                    </div>
                                    <div class="mb-1">
                                        <strong>Retorno:</strong> ${agendamento.enderecoRetorno}
                                    </div>
                                    <div>
                                        <strong>Passageiros:</strong> ${agendamento.passageiros.join(', ')}
                                    </div>
                                </div>
                                <button class="btn btn-outline-danger btn-sm" onclick="app.excluirAgendamento('${agendamento.id}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            container.innerHTML = html;
            
            // Atualiza o calendário com os agendamentos
            this.calendario.renderizar(agendamentos);
            
            console.log(`Agendamentos atualizados para ${data.toLocaleDateString()}`);
        } catch (error) {
            console.error('Erro ao atualizar agendamentos:', error);
            this.mostrarToast('Erro ao carregar agendamentos', 'danger');
        }
    }

    async excluirAgendamento(id) {
        if (confirm('Tem certeza que deseja excluir este agendamento?')) {
            try {
                await this.storage.excluirAgendamento(id);
                const data = this.calendario.getDataSelecionada();
                if (data) {
                    this.atualizarAgendamentosParaData(data);
                }
                this.mostrarToast('Agendamento excluído com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao excluir agendamento:', error);
                this.mostrarToast('Erro ao excluir agendamento', 'danger');
            }
        }
    }

    getVeiculoNome(id) {
        const veiculos = this.storage.veiculos || [];
        const veiculo = veiculos.find(v => v.id === id);
        return veiculo ? `${veiculo.modelo} (${veiculo.placa})` : 'Não encontrado';
    }

    getMotoristaNome(id) {
        const motoristas = this.storage.motoristas || [];
        const motorista = motoristas.find(m => m.id === id);
        return motorista ? motorista.nome : 'Não encontrado';
    }

    mostrarToast(mensagem, tipo = 'success') {
        const toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            const container = document.createElement('div');
            container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${tipo} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${mensagem}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

        const container = document.querySelector('.toast-container');
        container.appendChild(toast);

        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }
}

// Inicializa o app quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 