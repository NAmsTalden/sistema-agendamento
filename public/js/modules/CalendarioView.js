export class CalendarioView {
    constructor(gridId) {
        this.grid = document.getElementById(gridId);
        
        if (!this.grid) {
            throw new Error('Elemento do calendário não encontrado');
        }
    }

    renderizar(dataAtual, agendamentos, diaSelecionado) {
        // Limpa o grid
        this.grid.innerHTML = '';

        // Adiciona os cabeçalhos dos dias da semana
        ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(dia => {
            const header = document.createElement('div');
            header.className = 'calendario-header';
            header.textContent = dia;
            this.grid.appendChild(header);
        });

        const primeiroDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
        const ultimoDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
        
        // Células vazias antes do primeiro dia
        for (let i = 0; i < primeiroDia.getDay(); i++) {
            this.adicionarDiaVazio();
        }
        
        // Dias do mês
        for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
            this.adicionarDia(dia, dataAtual, agendamentos, diaSelecionado);
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

    adicionarDia(dia, dataAtual, agendamentos, diaSelecionado) {
        const diaElement = document.createElement('div');
        diaElement.className = 'calendario-dia';
        
        const data = this.formatarData(
            dia,
            dataAtual.getMonth(),
            dataAtual.getFullYear()
        );

        // Verifica se é hoje
        const hoje = this.formatarData(
            new Date().getDate(),
            new Date().getMonth(),
            new Date().getFullYear()
        );
        if (data === hoje) {
            diaElement.classList.add('hoje');
        }

        // Verifica se é o dia selecionado
        if (data === diaSelecionado) {
            diaElement.classList.add('selecionado');
        }

        // Filtra agendamentos do dia
        const agendamentosDoDia = agendamentos.filter(a => a.data === data);
        
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
        
        // Evento de clique
        diaElement.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('calendario:diaSelecionado', { 
                detail: data 
            }));
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
} 