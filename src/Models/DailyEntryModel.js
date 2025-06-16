const mongoose = require('mongoose');

// Define o esquema para uma entrada diária
const DailyEntrySchema = new mongoose.Schema(
    {
        user: { // Referência ao User (ID do usuário)
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Accounts', // Assumindo que 'Accounts' é o nome do seu modelo de usuário
            required: true,
            index: true // Otimiza a busca por usuário
        },
        date: { type: Date, required: true }, // Data da entrada (formato ISO-MM-DD)
        mood: { // 5 opções de emoji ou estados de humor
            type: String,
            enum: ['very_happy', 'happy', 'neutral', 'sad', 'very_sad'],
            required: true
        },
        note: { type: String, maxlength: 500 }, // Campo de texto opcional para notas
        habits: { // Hábitos diários com valores numéricos
            waterCups: { type: Number, min: 0, default: 0 },
            exerciseMinutes: { type: Number, min: 0, default: 0 },
            sleepMinutes: { type: Number, min: 0, default: 0 },
            weight: { type: Number, min: 0, default: 0 }
        },
        streakCount: { type: Number, default: 0 } // Contagem da sequência de dias (streak) para a semana atual
    },
    { timestamps: true } // Adiciona campos `createdAt` e `updatedAt` automaticamente
);

// Cria um índice único composto para garantir apenas uma entrada por usuário por dia
DailyEntrySchema.index({ user: 1, date: 1 }, { unique: true });

// Cria o modelo Mongoose a partir do esquema
const DailyEntryModel = mongoose.model('DailyEntry', DailyEntrySchema);

// Classe para gerenciar as operações de entrada diária
class DailyEntry {
    constructor(body) {
        this.body = body; // Dados da requisição (ex: req.body)
        this.errors = []; // Array para armazenar erros de validação
        this.dailyEntry = null; // Objeto da entrada diária após salvar/atualizar
    }

    /**
     * Verifica se as metas diárias de hábitos foram atingidas.
     * @param {Object} habits - Objeto contendo os hábitos e seus valores.
     * @returns {boolean} - True se as metas forem atingidas, false caso contrário.
     * Importante: Se um hábito não for fornecido (undefined), ele NÃO é considerado como meta atingida.
     * Para um hábito contar, ele deve ter um valor e atingir a meta.
     */
    static metGoals(habits) {
        if (!habits) return false; // Se não há objeto de hábitos, não há metas atingidas

        // As metas são consideradas atingidas APENAS se o valor do hábito for fornecido
        // E atender ao requisito. Se um hábito não for fornecido (undefined),
        // ele NÃO contribui para a meta atingida.
        const waterMet = habits.waterCups !== undefined && habits.waterCups >= 8;
        const exerciseMet = habits.exerciseMinutes !== undefined && habits.exerciseMinutes >= 30;
        const sleepMet = habits.sleepMinutes !== undefined && habits.sleepMinutes >= 420; // 7 horas = 420 minutos

        return waterMet && exerciseMet && sleepMet;
    }

    /**
     * Valida os dados do corpo da requisição.
     * Adiciona erros ao array `this.errors` se a validação falhar.
     */
    _validate() {
        this.cleanUp(); // Limpa e padroniza os dados antes da validação

        if (!this.body.user) {
            this.errors.push('O ID do usuário é obrigatório.');
        }

        // Validação e normalização da data
        if (!this.body.date) {
            this.errors.push('A data é obrigatória.');
        } else {
            try {
                this.body.date = new Date(this.body.date); // Converte para objeto Date
                if (isNaN(this.body.date.getTime())) { // Verifica se a data é inválida
                    this.errors.push('Formato de data inválido.');
                } else {
                    // Normaliza a data para o início do dia em UTC para consistência com o índice único
                    this.body.date.setUTCHours(0, 0, 0, 0);
                }
            } catch (e) {
                this.errors.push('Formato de data inválido.');
            }
        }

        // Validação do humor
        if (!this.body.mood || !['very_happy', 'happy', 'neutral', 'sad', 'very_sad'].includes(this.body.mood)) {
            this.errors.push('O humor é obrigatório e deve ser uma das opções permitidas.');
        }

        // Validação da nota
        if (this.body.note && typeof this.body.note !== 'string') {
            this.errors.push('A nota deve ser uma string.');
        }
        if (this.body.note && this.body.note.length > 500) {
            this.errors.push('A nota não pode exceder 500 caracteres.');
        }

        // Validação básica dos hábitos (pode ser mais robusta se necessário)
        if (this.body.habits) {
            if (typeof this.body.habits.waterCups !== 'number' && this.body.habits.waterCups !== undefined) {
                this.errors.push('O número de copos de água deve ser um número.');
            }
            if (typeof this.body.habits.exerciseMinutes !== 'number' && this.body.habits.exerciseMinutes !== undefined) {
                this.errors.push('Os minutos de exercício devem ser um número.');
            }
            if (typeof this.body.habits.sleepMinutes !== 'number' && this.body.habits.sleepMinutes !== undefined) {
                this.errors.push('Os minutos de sono devem ser um número.');
            }
            if (typeof this.body.habits.weight !== 'number' && this.body.habits.weight !== undefined) {
                this.errors.push('O peso deve ser um número.');
            }
        }
    }

    /**
     * Limpa e padroniza os dados do corpo da requisição, removendo campos extras
     * e definindo valores padrão para evitar problemas.
     */
    cleanUp() {
        // Remove campos que não são strings, números, objetos ou booleanos
        for (const key in this.body) {
            if (typeof this.body[key] !== 'string' && typeof this.body[key] !== 'number' &&
                typeof this.body[key] !== 'object' && typeof this.body[key] !== 'boolean') {
                delete this.body[key];
            }
        }

        // Garante que o corpo tenha apenas os campos esperados e com valores padrão
        this.body = {
            user: this.body.user,
            date: this.body.date,
            mood: this.body.mood,
            note: this.body.note || '',
            habits: {
                waterCups: this.body.habits && !isNaN(Number(this.body.habits.waterCups)) ? Number(this.body.habits.waterCups) : 0,
                exerciseMinutes: this.body.habits && !isNaN(Number(this.body.habits.exerciseMinutes)) ? Number(this.body.habits.exerciseMinutes) : 0,
                sleepMinutes: this.body.habits && !isNaN(Number(this.body.habits.sleepMinutes)) ? Number(this.body.habits.sleepMinutes) : 0,
                weight: this.body.habits && !isNaN(Number(this.body.habits.weight)) ? Number(this.body.habits.weight) : 0,
            },
            streakCount: this.body.streakCount || 0 // Será calculado posteriormente
        };
    }

    /**
     * Calcula e aplica o `streakCount` baseado nas entradas anteriores e metas.
     * Esta função atualiza `this.body.streakCount`.
     */
    async _calculateAndApplyStreak() {
        const userId = this.body.user;
        const currentDate = this.body.date; // Já normalizado para o início do dia UTC

        const yesterdayDate = new Date(currentDate);
        yesterdayDate.setUTCDate(currentDate.getUTCDate() - 1); // Calcula a data de ontem em UTC

        // Busca a entrada de ontem para o mesmo usuário
        const yesterdayEntry = await DailyEntryModel.findOne({ user: userId, date: yesterdayDate });

        let currentStreak = 0; // Inicializa o streak para 0

        // Verifica se as metas de hoje foram atingidas
        const todayGoalsMet = DailyEntry.metGoals(this.body.habits);

        // Lógica do Streak
        if (todayGoalsMet) {
            // Obtém o dia da semana em UTC (0 para domingo, 1 para segunda, ..., 6 para sábado)
            if (currentDate.getUTCDay() === 0) { // Se for domingo (início da semana para reset)
                currentStreak = 1; // Reseta o streak para 1 para a nova semana
            } else if (yesterdayEntry && DailyEntry.metGoals(yesterdayEntry.habits)) {
                // Se a entrada de ontem existe E as metas de ontem foram batidas, continua o streak
                currentStreak = yesterdayEntry.streakCount + 1;
            } else {
                // Se as metas de hoje foram batidas, MAS não havia entrada de ontem OU as metas de ontem NÃO foram batidas,
                // significa que a sequência foi quebrada ou é o primeiro dia.
                currentStreak = 1; // Inicia um novo streak de 1 dia.
            }
        } else {
            // Se as metas de hoje NÃO forem batidas, o streak é resetado para 0
            currentStreak = 0;
        }

        // Aplica o streak calculado ao corpo da entrada antes de salvar
        this.body.streakCount = currentStreak;
    }
    /**
     * Salva (cria ou atualiza) uma entrada diária no banco de dados.
     * Calcula o streak antes de salvar.
     */
    async save() {
        this._validate(); // Executa a validação dos dados
        if (this.errors.length > 0) {
            return; // Se houver erros, interrompe a execução
        }

        try {
            const { user, date, mood, note, habits } = this.body;

            // Encontra uma entrada existente para o usuário e data
            let existingEntry = await DailyEntryModel.findOne({ user, date });

            // Calcula e aplica o streakCount antes de salvar/atualizar
            await this._calculateAndApplyStreak();

            if (existingEntry) {
                // Se a entrada já existe, atualiza-a
                this.dailyEntry = await DailyEntryModel.findByIdAndUpdate(
                    existingEntry._id, // ID da entrada existente
                    {
                        mood,
                        note,
                        habits,
                        streakCount: this.body.streakCount // Usa o streak calculado
                    },
                    { new: true, runValidators: true } // Retorna o documento atualizado e executa validadores do esquema
                );
            } else {
                // Se não existe, cria uma nova entrada
                this.dailyEntry = await DailyEntryModel.create(this.body);
            }
        } catch (e) {
            // Trata erro de índice único duplicado (se tentar criar duas entradas para o mesmo dia/usuário)
            if (e.code === 11000) { // Código de erro de chave duplicada do MongoDB
                this.errors.push('Uma entrada para este usuário e data já existe. Use uma operação de atualização para modificá-la.');
            } else {
                this.errors.push('Erro ao salvar entrada diária: ' + e.message);
                console.error('Erro detalhado ao salvar entrada diária:', e); // Loga o erro completo para depuração
            }
        }
    }

    /**
     * Método estático para buscar entradas diárias para um usuário em um determinado período.
     * @param {string} userId - O ID do usuário.
     * @param {Date} startDate - Data de início do período (inclusive).
     * @param {Date} endDate - Data de fim do período (inclusive).
     * @returns {Promise<Array>} - Uma promessa que resolve para um array de entradas diárias.
     */
    static async findEntriesForUser(userId, startDate, endDate) {
        try {
            // Busca entradas dentro do intervalo de datas e para o usuário específico, ordenando por data
            return await DailyEntryModel.find({
                user: userId,
                date: { $gte: startDate, $lte: endDate }
            }).sort({ date: 1 });
        } catch (e) {
            console.error('Erro ao buscar entradas diárias:', e);
            throw new Error('Não foi possível buscar as entradas diárias.');
        }
    } 
    async updateFrom() {
        // Correção de digitação: findByIdAndUpadate para findByIdAndUpdate
        // Verifique se o ID está sendo passado corretamente para a atualização
        this.dailyEntry = await DailyEntryModel.findByIdAndUpdate(this.body.user, this.body, {new:true})
    }
}

module.exports = DailyEntry;