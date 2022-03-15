import knex from '../database/db';

export async function get_availabilities(activity_lid) {
  try {
    const result = await knex.raw(`
    SELECT DISTINCT
    TO_CHAR(agenda_central.dt_agenda,'dd/mm/yyyy') ||'_'|| TO_CHAR(agenda_central.hr_inicio,'HH24:MI:SS') availability_lid, 
    to_char(agenda_central.dt_agenda,'dd/mm/yyyy') dt_agenda,
    To_Char(agenda_central.hr_inicio,'HH24:MI:SS') hr_inicio,
    To_Char(agenda_central.hr_fim,'HH24:MI:SS') hr_fim,
    agenda_central.cd_unidade_atendimento,
    agenda_central.cd_prestador,
    recurso_central.cd_recurso_central,
    convenio.cd_convenio
   FROM AGENDA_CENTRAL
   LEFT JOIN dbamv.recurso_central ON recurso_central.cd_recurso_central = AGENDA_CENTRAL.cd_recurso_central
   LEFT JOIN DBAMV.PRESTADOR ON PRESTADOR.cd_prestador = AGENDA_CENTRAL.cd_prestador
   LEFT JOIN DBAMV.ATENDIME ON ATENDIME.cd_prestador = PRESTADOR.cd_prestador
   LEFT JOIN DBAMV.CONVENIO ON CONVENIO.cd_convenio = ATENDIME.cd_convenio
   WHERE recurso_central.cd_recurso_central = ${activity_lid}
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
        availability_lid:element.AVAILABILITY_LID,
        date:element.DT_AGENDA,
        start_time:element.HR_INICIO,
        end_time:element.HR_FIM,
        location_lid:element.CD_UNIDADE_ATENDIMENTO,
        resource_lid:element.CD_PRESTADOR,
        activity_lid:element.CD_RECURSO_CENTRAL,
        insurance_lid:element.CD_CONVENIO
      });
    });

    return { result: 'OK', return: dados };
  } catch (error) {
    console.log(error)
    return {
      result: 'ERROR',
      debug_msg: 'Erro ao consultar o banco de dados!'
    };
  }
}

export async function get_availabilities_first(activity_lid) {
  try {
    const result = await knex.raw(`
    SELECT DISTINCT
    to_char(agenda_central.dt_agenda,'dd/mm/yyyy') dt_agenda,
    AGENDA_CENTRAL.cd_unidade_atendimento,
    PRESTADOR.cd_prestador,
    convenio.cd_convenio
  FROM dbamv.agenda_central
  LEFT JOIN dbamv.prestador ON prestador.cd_prestador = agenda_central.cd_prestador
  LEFT JOIN dbamv.atendime ON atendime.cd_prestador = prestador.cd_prestador
  LEFT JOIN dbamv.recurso_central ON recurso_central.cd_recurso_central = agenda_central.cd_recurso_central
  LEFT JOIN DBAMV.ATENDIME ON ATENDIME.cd_prestador = PRESTADOR.cd_prestador
  LEFT JOIN DBAMV.CONVENIO ON CONVENIO.cd_convenio = ATENDIME.cd_convenio
  WHERE recurso_central.cd_recurso_central = ${activity_lid}

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
        date:element.DT_AGENDA,
        location_lid:element.CD_UNIDADE_ATENDIMENTO,
        resource_lid:element.CD_PRESTADOR,
        activity_lid:element.CD_RECURSO_CENTRAL,
        insurance_lid:element.CD_CONVENIO
      });
    });

    return { result: 'OK', return: dados };
  } catch (error) {
    console.log(error)
    return {
      result: 'ERROR',
      debug_msg: 'Erro ao consultar o banco de dados!'
    };
  }
}

export { get_availabilities }