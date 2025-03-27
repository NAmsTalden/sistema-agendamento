import { supabase } from './supabase.js';

export class Storage {
    static async getAgendamentos() {
        try {
            const { data, error } = await supabase
                .from('agendamentos')
                .select('*')
                .order('data', { ascending: true });

            if (error) {
                console.error('Erro ao carregar agendamentos:', error);
                throw error;
            }

            console.log('Agendamentos carregados:', data);
            return data || [];
        } catch (erro) {
            console.error('Erro ao carregar agendamentos:', erro);
            return [];
        }
    }

    static async salvarAgendamento(agendamento) {
        try {
            console.log('Tentando salvar agendamento:', agendamento);

            const { data, error } = await supabase
                .from('agendamentos')
                .insert([{
                    data: agendamento.data,
                    horario_said: agendamento.horario_said,
                    horario_retor: agendamento.horario_retor,
                    endereco_sa: agendamento.endereco_sa,
                    endereco_re: agendamento.endereco_re,
                    veiculo: agendamento.veiculo,
                    motorista: agendamento.motorista,
                    passageiros: agendamento.passageiros
                }])
                .select();

            if (error) {
                console.error('Erro ao salvar agendamento:', error);
                throw error;
            }

            console.log('Agendamento salvo com sucesso:', data);
            return data;
        } catch (erro) {
            console.error('Erro ao salvar agendamento:', erro);
            return null;
        }
    }

    static salvar(chave, dados) {
        try {
            localStorage.setItem(chave, JSON.stringify(dados));
        } catch (erro) {
            console.error('Erro ao salvar dados:', erro);
        }
    }

    static carregar(chave) {
        try {
            const dados = localStorage.getItem(chave);
            return dados ? JSON.parse(dados) : null;
        } catch (erro) {
            console.error('Erro ao carregar dados:', erro);
            return null;
        }
    }

    static remover(chave) {
        try {
            localStorage.removeItem(chave);
            return true;
        } catch (erro) {
            console.error('Erro ao remover dados:', erro);
            return false;
        }
    }

    static limpar() {
        try {
            localStorage.clear();
            return true;
        } catch (erro) {
            console.error('Erro ao limpar dados:', erro);
            return false;
        }
    }
} 