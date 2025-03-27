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
            return data || [];
        } catch (erro) {
            console.error('Erro ao carregar agendamentos:', erro);
            return [];
        }
    }

    static async salvarAgendamentos(agendamento) {
        try {
            console.log('Enviando agendamento:', agendamento);
            const { data, error } = await supabase
                .from('agendamentos')
                .insert([agendamento])
                .select();

            if (error) {
                console.error('Erro ao salvar agendamento:', error);
                throw error;
            }
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