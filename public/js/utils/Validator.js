export class Validator {
    constructor(rules = {}) {
        this.rules = rules;
    }

    validate(field, value) {
        const rule = this.rules[field];
        if (!rule) return true;

        if (rule.required && !value) {
            return { isValid: false, message: rule.message || 'Campo obrigatório' };
        }

        if (rule.minLength && value.length < rule.minLength) {
            return { isValid: false, message: rule.message || `Mínimo ${rule.minLength} caracteres` };
        }

        if (rule.pattern && !new RegExp(rule.pattern).test(value)) {
            return { isValid: false, message: rule.message || 'Formato inválido' };
        }

        return { isValid: true };
    }

    static validarAgendamento(agendamento) {
        const { data, horarioSaida, horarioRetorno, enderecoSaida, enderecoRetorno, veiculo, motorista, passageiros } = agendamento;

        if (!data || !horarioSaida || !horarioRetorno) {
            throw new Error('Data e horários são obrigatórios');
        }

        if (!enderecoSaida || !enderecoRetorno) {
            throw new Error('Endereços de saída e retorno são obrigatórios');
        }

        if (!veiculo) {
            throw new Error('Veículo é obrigatório');
        }

        if (!motorista) {
            throw new Error('Motorista é obrigatório');
        }

        if (!Array.isArray(passageiros) || passageiros.length === 0) {
            throw new Error('Adicione pelo menos um passageiro');
        }

        if (passageiros.length > 15) {
            throw new Error('Número máximo de passageiros excedido (máximo: 15)');
        }

        // Validar horários
        this.validarHorarios(horarioSaida, horarioRetorno);

        // Validar endereços
        this.validarEnderecos(enderecoSaida, enderecoRetorno);

        // Validar passageiros
        this.validarPassageiros(passageiros);
    }

    static validarHorarios(horarioSaida, horarioRetorno) {
        if (!horarioSaida || !horarioRetorno) {
            throw new Error('Horários de saída e retorno são obrigatórios');
        }

        const [horaSaida, minutoSaida] = horarioSaida.split(':').map(Number);
        const [horaRetorno, minutoRetorno] = horarioRetorno.split(':').map(Number);

        const totalMinutosSaida = horaSaida * 60 + minutoSaida;
        const totalMinutosRetorno = horaRetorno * 60 + minutoRetorno;

        if (totalMinutosRetorno <= totalMinutosSaida) {
            throw new Error('O horário de retorno deve ser posterior ao horário de saída');
        }
    }

    static validarEnderecos(enderecoSaida, enderecoRetorno) {
        if (!this.sanitizarString(enderecoSaida)) {
            throw new Error('Endereço de saída é obrigatório');
        }
        if (!this.sanitizarString(enderecoRetorno)) {
            throw new Error('Endereço de retorno é obrigatório');
        }

        if (this.sanitizarString(enderecoSaida).length < 5) {
            throw new Error('Endereço de saída deve ter pelo menos 5 caracteres');
        }
        if (this.sanitizarString(enderecoRetorno).length < 5) {
            throw new Error('Endereço de retorno deve ter pelo menos 5 caracteres');
        }
    }

    static validarVeiculo(veiculo) {
        if (!this.sanitizarString(veiculo)) {
            throw new Error('Veículo é obrigatório');
        }
    }

    static validarMotorista(motorista) {
        if (!this.sanitizarString(motorista)) {
            throw new Error('Motorista é obrigatório');
        }
    }

    static validarPassageiros(passageiros) {
        if (!Array.isArray(passageiros)) {
            throw new Error('Lista de passageiros inválida');
        }

        if (passageiros.length === 0) {
            throw new Error('É necessário pelo menos um passageiro');
        }

        if (passageiros.length > 15) {
            throw new Error('Número máximo de passageiros excedido (máximo: 15)');
        }

        passageiros.forEach((passageiro, index) => {
            const nome = this.sanitizarString(passageiro);
            if (!nome) {
                throw new Error(`Passageiro ${index + 1} inválido`);
            }
            if (nome.length < 3) {
                throw new Error(`Nome do passageiro ${index + 1} deve ter pelo menos 3 caracteres`);
            }
        });
    }

    static sanitizarString(str) {
        if (!str) return '';
        
        // Remove espaços em branco extras
        str = str.trim();
        
        // Remove tags HTML
        str = str.replace(/<[^>]*>/g, '');
        
        // Limita o tamanho
        str = str.substring(0, 255);
        
        return str;
    }
} 