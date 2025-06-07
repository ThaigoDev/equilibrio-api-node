const DailyEntry = require("../Models/DailyEntryModel"); // Importa a classe DailyEntry

class DailyEntryController {
    /**
     * Lida com a submissão de uma entrada diária (criação ou atualização).
     * @param {Object} req - Objeto de requisição do Express.
     * @param {Object} res - Objeto de resposta do Express.
     */
    static async submitDailyEntry(req, res) {
        // Em um ambiente de produção, o userId deve vir do token de autenticação (ex: req.user.id)
        // Para este exemplo, estamos assumindo que o userId pode vir do corpo da requisição ou um valor dummy.
        const userId = req.body.user || 'dummyUserId'; 

        // Garante que a data seja fornecida. Se não, usa a data atual do servidor.
        if (!req.body.date) {
            req.body.date = new Date().toISOString().split('T')[0]; // FormatoISO-MM-DD
        }

        // Cria uma nova instância de DailyEntry com os dados da requisição e o userId
        const dailyEntryInstance = new DailyEntry({
            ...req.body, // Inclui todos os dados do corpo da requisição
            user: userId // Sobrescreve o ID do usuário com o ID autenticado/fornecido
        });

        // Chama o método save() que lida com a criação ou atualização e o cálculo do streak
        await dailyEntryInstance.save();

        // Verifica se houve erros durante a validação ou salvamento
        if (dailyEntryInstance.errors.length > 0) {
            return res.status(400).json({
                status: "failed",
                message: "Erros de validação ou de processamento.",
                errors: dailyEntryInstance.errors,
            });
        }

        // Retorna sucesso e os dados da entrada salva/atualizada
        res.status(200).json({
            status: "success",
            message: "Entrada diária salva com sucesso!",
            data: dailyEntryInstance.dailyEntry // Contém o objeto com o streakCount atualizado
        });
    }

    /**
     * Lida com a busca de entradas diárias para um usuário em um determinado período.
     * @param {Object} req - Objeto de requisição do Express (espera userId, startDate, endDate nos query params).
     * @param {Object} res - Objeto de resposta do Express.
     */
    static async getDailyEntries(req, res) {
        // Obtém o userId dos query parameters ou de um valor dummy para este exemplo
        const userId = req.query.user || 'dummyUserId'; 
        // Converte as datas de string para objetos Date
        const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

        // Validação básica dos parâmetros de busca
        if (!userId) {
            return res.status(400).json({ status: "failed", message: "O ID do usuário é obrigatório." });
        }
        if (!startDate || !endDate) {
            return res.status(400).json({ status: "failed", message: "As datas de início e fim são obrigatórias para buscar entradas." });
        }
        // Normaliza as datas para o início e fim do dia em UTC para a consulta
        startDate.setUTCHours(0,0,0,0);
        endDate.setUTCHours(23,59,59,999);

        try {
            // Chama o método estático para buscar as entradas no modelo
            const entries = await DailyEntry.findEntriesForUser(userId, startDate, endDate);
            res.status(200).json({
                status: "success",
                data: entries // Retorna as entradas encontradas
            });
        } catch (e) {
            res.status(500).json({
                status: "failed",
                message: "Erro interno do servidor ao buscar entradas.",
                error: e.message,
            });
        }
    }
}

module.exports = DailyEntryController;