export class CalendarioView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    renderizar(dataAtual, agendamentos, diaSelecionado) {
        const primeiroDiaDoMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
        const ultimoDiaDoMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
        
        let html = '';
        
        // Preenche os dias vazios do início do mês
        for (let i = 0; i < primeiroDiaDoMes.getDay(); i++) {
            html += '<div class="calendario-dia vazio"></div>';
        }
        
        // Preenche os dias do mês
        for (let dia = 1; dia <= ultimoDiaDoMes.getDate(); dia++) {
            const data = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dia);
            const dataFormatada = data.toISOString().split('T')[0];
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
                <div class="${classes}" data-data="${dataFormatada}">
                    <span class="numero-dia">${dia}</span>
                    ${agendamentosNoDia.length > 0 ? `
                        <span class="badge bg-primary">${agendamentosNoDia.length}</span>
                    ` : ''}
                </div>
            `;
        }
        
        this.container.innerHTML = html;
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.container.querySelectorAll('.calendario-dia:not(.vazio)').forEach(dia => {
            dia.addEventListener('click', () => {
                const data = dia.dataset.data;
                document.dispatchEvent(new CustomEvent('calendario:diaSelecionado', { detail: data }));
            });
        });
    }

    mesmosDias(data1, data2) {
        return data1.getDate() === data2.getDate() &&
               data1.getMonth() === data2.getMonth() &&
               data1.getFullYear() === data2.getFullYear();
    }
} 