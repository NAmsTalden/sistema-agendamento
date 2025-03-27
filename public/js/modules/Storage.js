import { supabase } from './supabase.js';

export class Storage {
    constructor() {
        this.veiculos = [];
        this.motoristas = [];
        this.agendamentos = [];
    }

    // Métodos de Veículos
    async buscarVeiculos() {
        try {
            const { data, error } = await supabase
                .from('veiculos')
                .select('*')
                .order('modelo');

            if (error) throw error;
            this.veiculos = data;
            return data;
        } catch (error) {
            console.error('Erro ao buscar veículos:', error);
            throw new Error('Não foi possível carregar os veículos');
        }
    }

    async buscarVeiculoPorId(id) {
        try {
            const { data, error } = await supabase
                .from('veiculos')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao buscar veículo:', error);
            throw new Error('Não foi possível carregar o veículo');
        }
    }

    async salvarVeiculo(dados) {
        try {
            const { data, error } = await supabase
                .from('veiculos')
                .upsert([dados])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao salvar veículo:', error);
            throw new Error('Não foi possível salvar o veículo');
        }
    }

    async excluirVeiculo(id) {
        try {
            const { error } = await supabase
                .from('veiculos')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Erro ao excluir veículo:', error);
            throw new Error('Não foi possível excluir o veículo');
        }
    }

    // Métodos de Motoristas
    async buscarMotoristas() {
        try {
            const { data, error } = await supabase
                .from('motoristas')
                .select('*')
                .order('nome');

            if (error) throw error;
            this.motoristas = data;
            return data;
        } catch (error) {
            console.error('Erro ao buscar motoristas:', error);
            throw new Error('Não foi possível carregar os motoristas');
        }
    }

    async buscarMotoristaPorId(id) {
        try {
            const { data, error } = await supabase
                .from('motoristas')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao buscar motorista:', error);
            throw new Error('Não foi possível carregar o motorista');
        }
    }

    async salvarMotorista(dados) {
        try {
            const { data, error } = await supabase
                .from('motoristas')
                .upsert([dados])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao salvar motorista:', error);
            throw new Error('Não foi possível salvar o motorista');
        }
    }

    async excluirMotorista(id) {
        try {
            const { error } = await supabase
                .from('motoristas')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Erro ao excluir motorista:', error);
            throw new Error('Não foi possível excluir o motorista');
        }
    }

    // Métodos de Agendamentos
    async buscarAgendamentos(data = null) {
        try {
            let query = supabase
                .from('agendamentos')
                .select('*')
                .order('horarioSaida');

            if (data) {
                const dataFormatada = data instanceof Date 
                    ? data.toISOString().split('T')[0]
                    : data;
                query = query.eq('data', dataFormatada);
            }

            const { data: agendamentos, error } = await query;

            if (error) throw error;
            this.agendamentos = agendamentos;
            return agendamentos;
        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
            throw new Error('Não foi possível carregar os agendamentos');
        }
    }

    async salvarAgendamento(dados) {
        try {
            // Valida os dados
            if (!dados.data) throw new Error('Data é obrigatória');
            if (!dados.horarioSaida) throw new Error('Horário de saída é obrigatório');
            if (!dados.horarioRetorno) throw new Error('Horário de retorno é obrigatório');
            if (!dados.enderecoSaida) throw new Error('Endereço de saída é obrigatório');
            if (!dados.enderecoRetorno) throw new Error('Endereço de retorno é obrigatório');
            if (!dados.veiculo) throw new Error('Veículo é obrigatório');
            if (!dados.motorista) throw new Error('Motorista é obrigatório');
            if (!dados.passageiros || !dados.passageiros.length) throw new Error('Pelo menos um passageiro é obrigatório');

            // Formata a data se for um objeto Date
            if (dados.data instanceof Date) {
                dados.data = dados.data.toISOString().split('T')[0];
            }

            // Formata os horários para HH:mm
            dados.horarioSaida = dados.horarioSaida.substring(0, 5);
            dados.horarioRetorno = dados.horarioRetorno.substring(0, 5);

            const { data, error } = await supabase
                .from('agendamentos')
                .upsert([dados])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao salvar agendamento:', error);
            throw error;
        }
    }

    async excluirAgendamento(id) {
        try {
            const { error } = await supabase
                .from('agendamentos')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Erro ao excluir agendamento:', error);
            throw new Error('Não foi possível excluir o agendamento');
        }
    }

    // Métodos auxiliares
    getVeiculoNome(id) {
        const veiculo = this.veiculos.find(v => v.id === id);
        return veiculo ? `${veiculo.modelo} - ${veiculo.placa}` : '';
    }

    getMotoristaNome(id) {
        const motorista = this.motoristas.find(m => m.id === id);
        return motorista ? motorista.nome : '';
    }
} 