import { supabase } from './utils/supabase.js';
import { CalendarioView } from './modules/CalendarioView.js';
import { FormularioView } from './modules/FormularioView.js';
import { VeiculosView } from './modules/VeiculosView.js';
import { MotoristasView } from './modules/MotoristasView.js';
import { Storage } from './modules/Storage.js';

class App {
    constructor() {
        console.log('Inicializando App...');
        this.storage = new Storage(supabase);
        console.log('Storage inicializado');
        
        this.calendario = new CalendarioView('calendario');
        console.log('CalendarioView inicializado');
        
        this.formulario = new FormularioView();
        console.log('FormularioView inicializado');
        
        this.veiculos = new VeiculosView(this.storage);
        console.log('VeiculosView inicializado');
        
        this.motoristas = new MotoristasView(this.storage);
        console.log('MotoristasView inicializado');
        
        this.dataAtual = new Date();
        this.diaSelecionado = null;
        this.agendamentos = [];
        
        this.setupNavegacao();
        this.setupEventListeners();
    }

    setupNavegacao() {
        const links = document.querySelectorAll('.nav-link');
        const views = document.querySelectorAll('.view');

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                
                // Atualiza links ativos
                links.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Mostra/esconde views
                views.forEach(view => {
                    if (view.id === targetId) {
                        view.classList.remove('d-none');
                    } else {
                        view.classList.add('d-none');
                    }
                });
            });
        });
    }

    setupEventListeners() {
        console.log('Configurando event listeners...');
        document.addEventListener('calendario:diaSelecionado', (e) => {
            console.log('Dia selecionado:', e.detail);
            this.diaSelecionado = e.detail;
            this.atualizarAgendamentosParaData(this.diaSelecionado);
        });

        document.addEventListener('formulario:salvo', async (e) => {
            try {
                console.log('Salvando agendamento:', e.detail);
                await this.storage.salvarAgendamento(e.detail);
                await this.carregarAgendamentos();
                return true;
            } catch (error) {
                console.error('Erro ao salvar agendamento:', error);
                throw error;
            }
        });

        document.addEventListener('formulario:fechado', () => {
            console.log('Formulário fechado');
            this.diaSelecionado = null;
            this.calendario.renderizar(this.dataAtual, this.agendamentos, null);
        });

        const btnNovoAgendamento = document.getElementById('novo-agendamento');
        if (btnNovoAgendamento) {
            btnNovoAgendamento.addEventListener('click', () => {
                if (this.diaSelecionado) {
                    console.log('Abrindo formulário para novo agendamento');
                    this.formulario.abrir({ data: this.diaSelecionado });
                } else {
                    alert('Por favor, selecione uma data no calendário.');
                }
            });
        } else {
            console.error('Botão novo-agendamento não encontrado!');
        }

        // Eventos do Calendário
        this.calendario.addEventListener('dataSelecionada', async (event) => {
            const data = event.detail;
            await this.atualizarAgendamentosParaData(data);
        });

        this.calendario.addEventListener('novoAgendamento', (event) => {
            const data = event.detail;
            this.formulario.abrir(data);
        });

        // Eventos do Formulário
        this.formulario.addEventListener('agendamentoSalvo', async (event) => {
            const dados = event.detail;
            try {
                await this.storage.salvarAgendamento(dados);
                this.formulario.fechar();
                await this.atualizarAgendamentosParaData(dados.data);
                this.mostrarToast('Agendamento salvo com sucesso!', 'success');
            } catch (error) {
                console.error('Erro ao salvar agendamento:', error);
                this.mostrarToast(error.message || 'Erro ao salvar agendamento', 'danger');
            }
        });

        // Carrega dados iniciais
        this.carregarDadosIniciais();
    }

    async carregarDadosIniciais() {
        try {
            await Promise.all([
                this.storage.buscarVeiculos(),
                this.storage.buscarMotoristas()
            ]);

            // Atualiza os selects do formulário
            this.atualizarSelectVeiculos();
            this.atualizarSelectMotoristas();

            // Carrega agendamentos do dia atual
            const hoje = new Date().toISOString().split('T')[0];
            await this.atualizarAgendamentosParaData(hoje);
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            this.mostrarToast('Erro ao carregar dados iniciais', 'danger');
        }
    }

    async atualizarAgendamentosParaData(data) {
        try {
            const agendamentos = await this.storage.buscarAgendamentosPorData(data);
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

            const listGroup = document.createElement('div');
            listGroup.className = 'list-group list-group-flush';

            agendamentos.forEach(agendamento => {
                const item = document.createElement('div');
                item.className = 'list-group-item';
                item.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">
                                ${agendamento.veiculo.modelo} - ${agendamento.veiculo.placa}
                            </h6>
                            <p class="mb-1 text-muted">
                                <i class="bi bi-person"></i> ${agendamento.motorista.nome}
                            </p>
                            <small>
                                <i class="bi bi-clock"></i> ${agendamento.horario_said} - ${agendamento.horario_retor}
                            </small>
                        </div>
                        <button type="button" class="btn btn-outline-danger btn-sm" onclick="app.excluirAgendamento(${agendamento.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                    <div class="mt-2">
                        <small class="d-block">
                            <i class="bi bi-geo-alt"></i> Saída: ${agendamento.endereco_sa}
                        </small>
                        <small class="d-block">
                            <i class="bi bi-geo-alt-fill"></i> Retorno: ${agendamento.endereco_re}
                        </small>
                    </div>
                    <div class="mt-2">
                        <small class="text-muted">
                            <i class="bi bi-people"></i> ${agendamento.passageiros.length} passageiro(s)
                        </small>
                    </div>
                `;
                listGroup.appendChild(item);
            });

            container.innerHTML = '';
            container.appendChild(listGroup);
        } catch (error) {
            console.error('Erro ao atualizar agendamentos:', error);
            this.mostrarToast('Erro ao carregar agendamentos', 'danger');
        }
    }

    getVeiculoNome(id) {
        const veiculos = {
            '1': 'Fiat Uno - ABC-1234',
            '2': 'VW Gol - DEF-5678',
            '3': 'Ford Ka - GHI-9012'
        };
        return veiculos[id] || 'Veículo não encontrado';
    }

    getMotoristaNome(id) {
        const motoristas = {
            '1': 'João Silva',
            '2': 'Maria Santos',
            '3': 'Pedro Oliveira'
        };
        return motoristas[id] || 'Motorista não encontrado';
    }

    async excluirAgendamento(id) {
        if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

        try {
            await this.storage.excluirAgendamento(id);
            const data = this.calendario.getDataSelecionada();
            await this.atualizarAgendamentosParaData(data);
            this.mostrarToast('Agendamento excluído com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir agendamento:', error);
            this.mostrarToast(error.message || 'Erro ao excluir agendamento', 'danger');
        }
    }

    atualizarSelectVeiculos() {
        const select = document.querySelector('select[name="veiculo"]');
        select.innerHTML = '<option value="">Selecione...</option>';

        this.storage.veiculos
            .filter(v => v.status === 'disponivel')
            .forEach(veiculo => {
                const option = document.createElement('option');
                option.value = veiculo.id;
                option.textContent = `${veiculo.modelo} - ${veiculo.placa}`;
                select.appendChild(option);
            });
    }

    atualizarSelectMotoristas() {
        const select = document.querySelector('select[name="motorista"]');
        select.innerHTML = '<option value="">Selecione...</option>';

        this.storage.motoristas
            .filter(m => m.status === 'disponivel')
            .forEach(motorista => {
                const option = document.createElement('option');
                option.value = motorista.id;
                option.textContent = motorista.nome;
                select.appendChild(option);
            });
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

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, iniciando aplicação...');
    window.app = new App();
}); 