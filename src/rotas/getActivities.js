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
    WHERE recurso_central.cd_recurso_central IS NOT null
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
        activity_lid: element.CD_ITEM_AGENDAMENTO,
        name: element.DS_ITEM_AGENDAMENTO,
        group: {
          group_lid: element.CD_RECURSO_CENTRAL,
          name: element.DS_RECURSO_CENTRAL
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


export async function get_activities_resource_lid(resource_lid) {
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
  LEFT JOIN dbamv.prestador ON prestador.cd_prestador = agenda_central.cd_prestador
  WHERE agenda_central.cd_prestador = ${resource_lid}
  AND recurso_central.cd_recurso_central IS NOT null

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
        activity_lid: element.CD_ITEM_AGENDAMENTO,
        name: element.DS_ITEM_AGENDAMENTO,
        group: {
          group_lid: element.CD_RECURSO_CENTRAL,
          name: element.DS_RECURSO_CENTRAL
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

export async function get_activities_resource_lid_location_lid(location_lid,resource_lid) {
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
  LEFT JOIN dbamv.prestador ON prestador.cd_prestador = agenda_central.cd_prestador
  WHERE agenda_central.cd_prestador = ${resource_lid}
  AND agenda_central.cd_unidade_atendimento = ${location_lid}
  AND recurso_central.cd_recurso_central IS NOT null

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
        activity_lid: element.CD_ITEM_AGENDAMENTO,
        name: element.DS_ITEM_AGENDAMENTO,
        group: {
          group_lid: element.CD_RECURSO_CENTRAL,
          name: element.DS_RECURSO_CENTRAL
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


export async function get_activities_insurance_lid(insurance_lid) {
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
    LEFT JOIN dbamv.prestador ON prestador.cd_prestador = agenda_central.cd_prestador
    LEFT JOIN dbamv.atendime ON atendime.cd_prestador = prestador.cd_prestador
    LEFT JOIN dbamv.convenio ON convenio.cd_convenio = atendime.cd_convenio
    WHERE convenio.cd_convenio = ${insurance_lid}
    AND recurso_central.cd_recurso_central IS NOT null

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
        activity_lid: element.CD_ITEM_AGENDAMENTO,
        name: element.DS_ITEM_AGENDAMENTO,
        group: {
          group_lid: element.CD_RECURSO_CENTRAL,
          name: element.DS_RECURSO_CENTRAL
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
