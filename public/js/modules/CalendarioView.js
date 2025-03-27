export class CalendarioView {
    constructor() {
        this.container = document.getElementById('calendario');
        this.dataSelecionada = null;
        this.data = new Date();
        this.listeners = new Map();
        this.criarEstrutura();
        this.setupEventListeners();
        this.renderizar();
    }

    criarEstrutura() {
        this.container.classList.add('calendario-wrapper');
        this.container.innerHTML = `
            <div class="calendario-nav">
                <button type="button" class="btn-mes-anterior">
                    <i class="bi bi-chevron-left"></i>
                </button>
                <h2></h2>
                <button type="button" class="btn-proximo-mes">
                    <i class="bi bi-chevron-right"></i>
                </button>
            </div>
            <div class="calendario-header">
                <div>Dom</div>
                <div>Seg</div>
                <div>Ter</div>
                <div>Qua</div>
                <div>Qui</div>
                <div>Sex</div>
                <div>Sáb</div>
            </div>
            <div class="calendario-grid"></div>
        `;

        this.titulo = this.container.querySelector('h2');
        this.grid = this.container.querySelector('.calendario-grid');
        this.btnMesAnterior = this.container.querySelector('.btn-mes-anterior');
        this.btnProximoMes = this.container.querySelector('.btn-proximo-mes');
    }

    setupEventListeners() {
        this.btnMesAnterior.addEventListener('click', () => {
            this.data.setMonth(this.data.getMonth() - 1);
            this.renderizar();
        });

        this.btnProximoMes.addEventListener('click', () => {
            this.data.setMonth(this.data.getMonth() + 1);
            this.renderizar();
        });

        this.grid.addEventListener('click', (event) => {
            const dia = event.target.closest('.calendario-dia');
            if (dia && !dia.classList.contains('vazio')) {
                const dataAnterior = this.dataSelecionada;
                this.dataSelecionada = new Date(dia.dataset.data);
                
                // Remove seleção anterior
                if (dataAnterior) {
                    const diaAnterior = this.grid.querySelector(`[data-data="${dataAnterior.toISOString().split('T')[0]}"]`);
                    if (diaAnterior) {
                        diaAnterior.classList.remove('selecionado');
                    }
                }
                
                // Adiciona nova seleção
                dia.classList.add('selecionado');
                
                // Dispara evento de seleção
                this.dispatchEvent('selecao', { data: this.dataSelecionada });
            }
        });
    }

    addEventListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    removeEventListener(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    dispatchEvent(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }

    getDataSelecionada() {
        return this.dataSelecionada;
    }

    renderizar(agendamentos = []) {
        if (!this.data) {
            this.data = new Date();
        }

        // Atualiza título
        const mes = this.data.toLocaleString('pt-BR', { month: 'long' });
        const ano = this.data.getFullYear();
        this.titulo.textContent = `${mes} de ${ano}`;

        // Limpa grid
        this.grid.innerHTML = '';

        // Calcula primeiro dia do mês
        const primeiroDia = new Date(this.data.getFullYear(), this.data.getMonth(), 1);
        const ultimoDia = new Date(this.data.getFullYear(), this.data.getMonth() + 1, 0);
        
        // Adiciona dias vazios do início
        for (let i = 0; i < primeiroDia.getDay(); i++) {
            const div = document.createElement('div');
            div.className = 'calendario-dia vazio';
            this.grid.appendChild(div);
        }

        // Adiciona os dias do mês
        const hoje = new Date();
        for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
            const data = new Date(this.data.getFullYear(), this.data.getMonth(), dia);
            const div = document.createElement('div');
            div.className = 'calendario-dia';
            div.dataset.data = data.toISOString().split('T')[0];

            // Adiciona número do dia
            const numero = document.createElement('div');
            numero.className = 'numero-dia';
            numero.textContent = dia;
            div.appendChild(numero);

            // Verifica se é hoje
            if (data.toDateString() === hoje.toDateString()) {
                div.classList.add('hoje');
            }

            // Verifica se é o dia selecionado
            if (this.dataSelecionada && data.toDateString() === this.dataSelecionada.toDateString()) {
                div.classList.add('selecionado');
            }

            // Verifica se tem agendamentos
            const agendamentosDoDia = agendamentos.filter(a => {
                const dataAgendamento = new Date(a.data);
                return dataAgendamento.toDateString() === data.toDateString();
            });

            if (agendamentosDoDia.length > 0) {
                div.classList.add('tem-agendamento');
                const badge = document.createElement('span');
                badge.className = 'badge';
                badge.textContent = agendamentosDoDia.length;
                div.appendChild(badge);
            }

            this.grid.appendChild(div);
        }

        // Adiciona dias vazios do fim
        const diasRestantes = 42 - (this.grid.children.length);
        for (let i = 0; i < diasRestantes; i++) {
            const div = document.createElement('div');
            div.className = 'calendario-dia vazio';
            this.grid.appendChild(div);
        }
    }
} 