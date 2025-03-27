import { supabase } from '../utils/supabase.js';

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
    async buscarAgendamentos() {
        try {
            const { data, error } = await supabase
                .from('agendamentos')
                .select(`
                    *,
                    veiculo:veiculos(modelo, placa),
                    motorista:motoristas(nome)
                `)
                .order('data')
                .order('horario_said');

            if (error) throw error;
            this.agendamentos = data;
            return data;
        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
            throw new Error('Não foi possível carregar os agendamentos');
        }
    }

    async buscarAgendamentosPorData(data) {
        try {
            const { data: agendamentos, error } = await supabase
                .from('agendamentos')
                .select(`
                    *,
                    veiculo:veiculos(modelo, placa),
                    motorista:motoristas(nome)
                `)
                .eq('data', data)
                .order('horario_said');

            if (error) throw error;
            return agendamentos;
        } catch (error) {
            console.error('Erro ao buscar agendamentos:', error);
            throw new Error('Não foi possível carregar os agendamentos');
        }
    }

    async salvarAgendamento(dados) {
        try {
            // Formata os horários para HH:mm
            dados.horario_said = dados.horario_said.substring(0, 5);
            dados.horario_retor = dados.horario_retor.substring(0, 5);

            const { data, error } = await supabase
                .from('agendamentos')
                .upsert([dados])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erro ao salvar agendamento:', error);
            throw new Error('Não foi possível salvar o agendamento');
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
} 