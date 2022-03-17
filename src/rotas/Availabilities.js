import knex from '../database/db';

export async function get_availabilities(activity_lid,start_day,end_day,start_time,end_time,insurance_lid,resource_lids,location_lids) {
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
   WHERE recurso_central.cd_recurso_central = '${activity_lid}'
   AND To_Char(agenda_central.hr_inicio,'DD/MM/YYYY') = '${start_day}'
   AND To_Char(agenda_central.hr_fim,'DD/MM/YYYY') = '${end_day}'
   AND To_Char(agenda_central.hr_inicio,'HH24:MI') = '${start_time}'
   AND To_Char(agenda_central.hr_fim,'HH24:MI') = '${end_time}'
   AND convenio.cd_convenio in (${insurance_lid})
   AND prestador.cd_prestador in (${resource_lids})
   AND agenda_central.cd_unidade_atendimento in (${location_lids})
   order by 1 desc

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

export async function get_availabilities_first(activity_lid,start_day,end_day,start_time,end_time,insurance_lid,resource_lids,location_lids) {
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
   WHERE recurso_central.cd_recurso_central = '${activity_lid}'
   AND To_Char(agenda_central.hr_inicio,'DD/MM/YYYY') = '${start_day}'
   AND To_Char(agenda_central.hr_fim,'DD/MM/YYYY') = '${end_day}'
   AND To_Char(agenda_central.hr_inicio,'HH24:MI') = '${start_time}'
   AND To_Char(agenda_central.hr_fim,'HH24:MI') = '${end_time}'
   AND convenio.cd_convenio in (${insurance_lid})
   AND prestador.cd_prestador in (${resource_lids})
   AND agenda_central.cd_unidade_atendimento in (${location_lids})
   order by 1 desc

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
        insurance_lid:element.CD_CONVENIO,
        price: null
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