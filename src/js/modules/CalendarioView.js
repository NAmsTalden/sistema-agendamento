export class CalendarioView {
    constructor() {
        this.grid = document.getElementById('calendario-grid');
        this.mesAtualElement = document.getElementById('mes-atual');
        
        if (!this.grid || !this.mesAtualElement) {
            throw new Error('Elementos do calendário não encontrados');
        }
    }

    atualizar(estado) {
        this.renderizarCabecalho(estado.mes, estado.ano);
        this.renderizarDias(estado);
    }

    renderizarCabecalho(mes, ano) {
        this.mesAtualElement.textContent = new Date(ano, mes)
            .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        
        this.grid.querySelectorAll('.calendario-dia').forEach(dia => dia.remove());
    }

    renderizarDias(estado) {
        const { mes, ano } = estado;
        const primeiroDia = new Date(ano, mes, 1);
        const ultimoDia = new Date(ano, mes + 1, 0);
        
        // Células vazias antes do primeiro dia
        for (let i = 0; i < primeiroDia.getDay(); i++) {
            this.adicionarDiaVazio();
        }
        
        // Dias do mês
        for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
            this.adicionarDia(dia, estado);
        }
        
        // Células vazias após o último dia
        const diasRestantes = 7 - ((primeiroDia.getDay() + ultimoDia.getDate()) % 7);
        if (diasRestantes < 7) {
            for (let i = 0; i < diasRestantes; i++) {
                this.adicionarDiaVazio();
            }
        }
    }

    adicionarDiaVazio() {
        const diaVazio = document.createElement('div');
        diaVazio.className = 'calendario-dia vazio';
        this.grid.appendChild(diaVazio);
    }

    adicionarDia(dia, estado) {
        const { mes, ano, diaSelecionado } = estado;
        const diaElement = document.createElement('div');
        diaElement.className = 'calendario-dia';
        
        const data = this.formatarData(dia, mes, ano);
        const hoje = this.formatarData(
            new Date().getDate(),
            new Date().getMonth(),
            new Date().getFullYear()
        );

        if (data === hoje) diaElement.classList.add('hoje');
        if (data === diaSelecionado) diaElement.classList.add('selecionado');

        const agendamentosDoDia = estado.agendamentos.filter(a => a.data === data);
        
        // Número do dia com tooltip
        const numero = document.createElement('div');
        numero.className = 'numero';
        numero.textContent = dia;
        if (agendamentosDoDia.length) {
            numero.setAttribute('data-tooltip', 
                `${agendamentosDoDia.length} agendamento${agendamentosDoDia.length > 1 ? 's' : ''}`
            );
        }
        diaElement.appendChild(numero);
        
        // Resumo do primeiro agendamento e contador
        if (agendamentosDoDia.length) {
            const primeiroAgendamento = agendamentosDoDia[0];
            diaElement.appendChild(this.criarResumo(primeiroAgendamento));
            diaElement.appendChild(this.criarIndicador(agendamentosDoDia.length));
        }
        
        // Evento de clique com feedback
        diaElement.addEventListener('click', () => {
            diaElement.classList.add('loading');
            setTimeout(() => {
                diaElement.classList.remove('loading');
                this.selecionarDia(data);
            }, 200);
        });
        
        this.grid.appendChild(diaElement);
    }

    criarResumo(agendamento) {
        const resumo = document.createElement('div');
        resumo.className = 'resumo-agendamento';
        resumo.textContent = `${agendamento.horarioSaida} - ${agendamento.veiculo}`;
        return resumo;
    }

    criarIndicador(quantidade) {
        const indicador = document.createElement('div');
        indicador.className = 'indicador-agendamento';
        indicador.textContent = `${quantidade} agendamento${quantidade > 1 ? 's' : ''}`;
        return indicador;
    }

    formatarData(dia, mes, ano) {
        return `${dia.toString().padStart(2, '0')}/${(mes + 1).toString().padStart(2, '0')}/${ano}`;
    }

    selecionarDia(data) {
        document.dispatchEvent(new CustomEvent('selecionar-dia', { detail: { data } }));
    }
} 