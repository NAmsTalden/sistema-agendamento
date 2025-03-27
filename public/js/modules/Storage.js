export class Storage {
    constructor(supabase) {
        this.supabase = supabase;
        console.log('Storage inicializado com Supabase');
    }

    async salvarAgendamento(dados) {
        try {
            console.log('Salvando agendamento:', dados);
            const { data, error } = await this.supabase
                .from('agendamentos')
                .insert([{
                    data: dados.data,
                    horario_said: dados.horarioSaida,
                    horario_retor: dados.horarioRetorno,
                    endereco_sa: dados.enderecoSaida,
                    endereco_re: dados.enderecoRetorno,
                    veiculo: dados.veiculo,
                    motorista: dados.motorista,
                    passageiros: dados.passageiros
                }])
                .select();

            if (error) {
                console.error('Erro ao salvar agendamento:', error);
                throw error;
            }

            console.log('Agendamento salvo com sucesso:', data);
            return data[0];
        } catch (error) {
            console.error('Erro ao salvar agendamento:', error);
            throw error;
        }
    }

    async buscarAgendamentos() {
        try {
            console.log('Buscando agendamentos...');
            const { data, error } = await this.supabase
                .from('agendamentos')
                .select('*')
                .order('data', { ascending: true });

            if (error) {
                console.error('Erro ao buscar agendamentos:', error);
                throw error;
            }

            console.log('Agendamentos encontrados:', data);
            return data;
        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
            throw error;
        }
    }

    async buscarAgendamentosPorData(data) {
        try {
            console.log('Buscando agendamentos para a data:', data);
            const { data: agendamentos, error } = await this.supabase
                .from('agendamentos')
                .select('*')
                .eq('data', data)
                .order('horario_said', { ascending: true });

            if (error) {
                console.error('Erro ao buscar agendamentos por data:', error);
                throw error;
            }

            console.log('Agendamentos encontrados para a data:', agendamentos);
            return agendamentos;
        } catch (error) {
            console.error('Erro ao buscar agendamentos por data:', error);
            throw error;
        }
    }

    async excluirAgendamento(id) {
        try {
            console.log('Excluindo agendamento:', id);
            const { error } = await this.supabase
                .from('agendamentos')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Erro ao excluir agendamento:', error);
                throw error;
            }

            console.log('Agendamento excluído com sucesso');
        } catch (error) {
            console.error('Erro ao excluir agendamento:', error);
            throw error;
        }
    }
} 