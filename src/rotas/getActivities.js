import knex from '../database/db';

export async function get_activities() {
  try {
    const result = await knex.raw(`
    SELECT DISTINCT  
    recurso_central.cd_recurso_central,
    recurso_central.ds_recurso_central,
    item_agendamento.cd_item_agendamento,
    item_agendamento.ds_item_agendamento
    FROM dbamv.agenda_central
    LEFT JOIN dbamv.recurso_central ON recurso_central.cd_recurso_central = agenda_central.cd_recurso_central
    LEFT JOIN dbamv.item_agendamento_recurso ON item_agendamento_recurso.cd_recurso_central = recurso_central.cd_recurso_central
    LEFT JOIN dbamv.item_agendamento ON item_agendamento.cd_item_agendamento = item_agendamento_recurso.cd_item_agendamento 
  `);

    if (!result || result.length === 0) {
      return {
        result: 'ERROR',
        debug_msg: 'Não encontrado registro no banco de dados',
      };
    }

    const dados = [];
    result.forEach(element => {
      dados.push({
        activity_lid: element.CD_RECURSO_CENTRAL,
        name: element.DS_RECURSO_CENTRAL,
        group: {
          group_lid: element.CD_ITEM_AGENDAMENTO,
          name: element.DS_ITEM_AGENDAMENTO,
        },
      });
    });

    return { result: 'OK', return: dados };
  } catch (error) {
    console.log(error)
    return { 
      result: 'ERROR',
      debug_msg: 'Erro ao consultar o banco de dados!' };
  }
}

export { get_activities };
