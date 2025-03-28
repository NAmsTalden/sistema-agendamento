import { supabase } from './modules/supabase.js';
import { CalendarioView } from './modules/CalendarioView.js';
import { FormularioView } from './modules/FormularioView.js';
import { VeiculosView } from './modules/VeiculosView.js';
import { MotoristasView } from './modules/MotoristasView.js';
import { Storage } from './modules/Storage.js';
import { createClient } from '@supabase/supabase-js';
import FullCalendar from '@fullcalendar/core';

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

// Inicialização do Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Inicialização do Calendário
document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    
    // Teste inicial apenas com o calendário básico
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        height: '700px',
        buttonText: {
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia'
        }
    });
    
    calendar.render();
    
    // Log para debug
    console.log('Calendário inicializado');
});

// Função auxiliar para formatar datas
function formatarData(data) {
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    }).format(data);
}

// Carregar veículos no select
async function carregarVeiculos() {
    const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .order('modelo');
    
    if (error) {
        console.error('Erro ao carregar veículos:', error);
        return;
    }

    const select = document.getElementById('veiculo');
    select.innerHTML = '<option value="">Selecione um veículo</option>';
    
    data.forEach(veiculo => {
        const option = document.createElement('option');
        option.value = veiculo.id;
        option.textContent = `${veiculo.modelo} (${veiculo.placa})`;
        select.appendChild(option);
    });
}

// Carregar agendamentos do Supabase
async function carregarAgendamentos() {
    const { data, error } = await supabase
        .from('agendamentos')
        .select(`
            *,
            veiculos (
                modelo,
                placa
            )
        `);
    
    if (error) {
        console.error('Erro ao carregar agendamentos:', error);
        return [];
    }

    return data.map(agendamento => ({
        id: agendamento.id,
        title: `${agendamento.veiculos.modelo} - ${agendamento.motorista}`,
        start: agendamento.horario_saida,
        end: agendamento.horario_retorno,
        extendedProps: agendamento
    }));
}

// Salvar novo agendamento
document.getElementById('salvarAgendamento').addEventListener('click', async () => {
    const formData = {
        horario_saida: document.getElementById('horarioSaida').value,
        horario_retorno: document.getElementById('horarioRetorno').value,
        endereco_saida: document.getElementById('enderecoSaida').value,
        endereco_retorno: document.getElementById('enderecoRetorno').value,
        veiculo: document.getElementById('veiculo').value,
        motorista: document.getElementById('motorista').value,
        passageiros: document.getElementById('passageiros').value,
        justificativa: document.getElementById('justificativa').value,
        observacoes: document.getElementById('observacoes').value
    };

    const { data, error } = await supabase
        .from('agendamentos')
        .insert([formData]);

    if (error) {
        alert('Erro ao salvar agendamento');
        console.error(error);
    } else {
        alert('Agendamento salvo com sucesso!');
        document.getElementById('agendamentoForm').reset();
        bootstrap.Modal.getInstance(document.getElementById('agendamentoModal')).hide();
        calendar.refetchEvents();
    }
});

// Função para mostrar detalhes do agendamento
function mostrarDetalhesAgendamento(event) {
    const agendamento = event.extendedProps;
    if (confirm(`Deseja excluir o agendamento de ${agendamento.motorista}?`)) {
        excluirAgendamento(agendamento.id);
    }
}

// Função para excluir agendamento
async function excluirAgendamento(id) {
    const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id);

    if (error) {
        alert('Erro ao excluir agendamento');
        console.error(error);
    } else {
        alert('Agendamento excluído com sucesso!');
        calendar.refetchEvents();
    }
} 