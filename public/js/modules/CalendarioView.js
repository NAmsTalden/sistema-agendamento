export class CalendarioView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.dataAtual = new Date();
        this.diaSelecionado = null;
        this.agendamentos = [];
        this.criarEstrutura();
    }

    criarEstrutura() {
        this.container.innerHTML = `
            <div class="calendario-nav">
                <button class="btn-mes-anterior">
                    <i class="bi bi-chevron-left"></i>
                </button>
                <h2></h2>
                <button class="btn-mes-proximo">
                    <i class="bi bi-chevron-right"></i>
                </button>
            </div>
            <div class="calendario">
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
            </div>
        `;

        this.btnMesAnterior = this.container.querySelector('.btn-mes-anterior');
        this.btnMesProximo = this.container.querySelector('.btn-mes-proximo');
        this.tituloMes = this.container.querySelector('h2');
        this.gridContainer = this.container.querySelector('.calendario-grid');

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.btnMesAnterior.addEventListener('click', () => {
            this.dataAtual = new Date(this.dataAtual.getFullYear(), this.dataAtual.getMonth() - 1, 1);
            this.renderizar(this.dataAtual, this.agendamentos, this.diaSelecionado);
        });

        this.btnMesProximo.addEventListener('click', () => {
            this.dataAtual = new Date(this.dataAtual.getFullYear(), this.dataAtual.getMonth() + 1, 1);
            this.renderizar(this.dataAtual, this.agendamentos, this.diaSelecionado);
        });

        this.gridContainer.addEventListener('click', (e) => {
            const dia = e.target.closest('.calendario-dia');
            if (dia && !dia.classList.contains('vazio')) {
                const data = dia.dataset.data;
                this.diaSelecionado = data;
                document.dispatchEvent(new CustomEvent('calendario:diaSelecionado', { detail: data }));
                this.atualizarSelecao();
            }
        });
    }

    renderizar(dataAtual, agendamentos, diaSelecionado) {
        this.dataAtual = dataAtual;
        this.agendamentos = agendamentos;
        this.diaSelecionado = diaSelecionado;

        const primeiroDiaDoMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
        const ultimoDiaDoMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
        
        this.tituloMes.textContent = this.formatarMesAno(dataAtual);
        let html = '';
        
        // Preenche os dias vazios do início do mês
        for (let i = 0; i < primeiroDiaDoMes.getDay(); i++) {
            html += '<div class="calendario-dia vazio"></div>';
        }
        
        // Preenche os dias do mês
        for (let dia = 1; dia <= ultimoDiaDoMes.getDate(); dia++) {
            const data = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dia);
            const dataFormatada = this.formatarData(data);
            const agendamentosNoDia = agendamentos.filter(a => a.data === dataFormatada);
            const ehHoje = this.mesmosDias(data, new Date());
            const selecionado = dataFormatada === diaSelecionado;
            
            const classes = [
                'calendario-dia',
                ehHoje ? 'hoje' : '',
                selecionado ? 'selecionado' : '',
                agendamentosNoDia.length > 0 ? 'tem-agendamento' : ''
            ].filter(Boolean).join(' ');
            
            html += `
                <div class="${classes} fade-in" data-data="${dataFormatada}">
                    <span class="numero-dia">${dia}</span>
                    ${agendamentosNoDia.length > 0 ? `
                        <span class="badge">${agendamentosNoDia.length}</span>
                    ` : ''}
                </div>
            `;
        }
        
        this.gridContainer.innerHTML = html;
    }

    atualizarSelecao() {
        this.container.querySelectorAll('.calendario-dia').forEach(dia => {
            dia.classList.toggle('selecionado', dia.dataset.data === this.diaSelecionado);
        });
    }

    formatarMesAno(data) {
        return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }

    formatarData(data) {
        return data.toISOString().split('T')[0];
    }

    mesmosDias(data1, data2) {
        return data1.getDate() === data2.getDate() &&
               data1.getMonth() === data2.getMonth() &&
               data1.getFullYear() === data2.getFullYear();
    }
} 