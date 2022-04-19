import knex from '../../database/db';

export async function get_availabilities(activity_lid,start_day,end_day,start_time,end_time,insurance_lid,resource_lids,location_lids) {
  try {


    const pega_conv = await knex.raw(`
    SELECT 
      NVL(SUBSTR('${insurance_lid}',INSTR('${insurance_lid}', '-') + 1, INSTR('${insurance_lid}', '-')+20000), ${insurance_lid}) cd_con_pla,
      NVL(SUBSTR('${insurance_lid}',0, INSTR('${insurance_lid}', '-')-1), '${insurance_lid}') cd_convenio
    FROM dual

  `);

    const result = await knex.raw(`
    SELECT DISTINCT
    TO_CHAR(it_agenda_central.hr_agenda,'dd/mm/yyyy') ||'_'|| TO_CHAR(it_agenda_central.hr_agenda,'HH24:MI:SS') availability_lid, 
    to_char(it_agenda_central.hr_agenda,'dd/mm/yyyy') dt_agenda,
    To_Char(it_agenda_central.hr_agenda,'HH24:MI') hr_inicio,
    (to_char(it_agenda_central.hr_agenda + (agenda_central.qt_tempo_medio)/1440, 'hh24:mi')) hr_fim,
    agenda_central.cd_unidade_atendimento,
    agenda_central.cd_prestador,
    recurso_central.cd_recurso_central,
    agenda_central.cd_agenda_central,
    convenio.cd_convenio
   FROM AGENDA_CENTRAL
   LEFT JOIN dbamv.recurso_central ON recurso_central.cd_recurso_central = AGENDA_CENTRAL.cd_recurso_central
   LEFT JOIN dbamv.IT_AGENDA_CENTRAL ON  dbamv.IT_AGENDA_CENTRAL.cd_agenda_central = AGENDA_CENTRAL.cd_agenda_central
   LEFT JOIN DBAMV.PRESTADOR ON PRESTADOR.cd_prestador = AGENDA_CENTRAL.cd_prestador
   LEFT JOIN DBAMV.ATENDIME ON ATENDIME.cd_prestador = PRESTADOR.cd_prestador
   LEFT JOIN DBAMV.CONVENIO ON CONVENIO.cd_convenio = ATENDIME.cd_convenio
  WHERE item_agendamento_recurso.cd_item_agendamento = '${activity_lid}'
   and To_Char(it_agenda_central.hr_agenda,'DD/MM/YYYY') = '${start_day}'
   AND To_Char(it_agenda_central.hr_agenda,'DD/MM/YYYY') = '${end_day}'
   AND To_Char(it_agenda_central.hr_agenda,'HH24:MI') BETWEEN '${start_time}' AND '${end_time}'
   and convenio.cd_convenio = (${pega_conv[0].CD_CONVENIO})
   and con_pla.cd_con_pla = (${pega_conv[0].CD_CON_PLA})
   AND prestador.cd_prestador in (${resource_lids})
   AND agenda_central.cd_unidade_atendimento in (${location_lids})
   AND it_agenda_central.cd_paciente IS NULL
   AND it_agenda_central.nm_paciente IS NULL 
   order by 1 DESC


  `);

    if (!result || result.length === 0) {
      return {
        result: 'OK',
        debug_msg: 'Não encontrado registro no banco de dados',
      };
    }

    const dados = [];
    result.forEach(element => {
      dados.push({
        availability_lid:element.AVAILABILITY_LID,
        date:element.DT_AGENDA,
        start_time:element.HR_INICIO,
        end_time: element.HR_FIM,
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

    const pega_conv = await knex.raw(`
      SELECT 
        NVL(SUBSTR('${insurance_lid}',INSTR('${insurance_lid}', '-') + 1, INSTR('${insurance_lid}', '-')+20000), ${insurance_lid}) cd_con_pla,
        NVL(SUBSTR('${insurance_lid}',0, INSTR('${insurance_lid}', '-')-1), '${insurance_lid}') cd_convenio
      FROM dual

    `);

    const result = await knex.raw(`
    SELECT DISTINCT
    TO_CHAR(it_agenda_central.hr_agenda,'dd/mm/yyyy') ||'_'|| TO_CHAR(it_agenda_central.hr_agenda,'HH24:MI:SS') availability_lid, 
    to_char(it_agenda_central.hr_agenda,'dd/mm/yyyy') dt_agenda,
    To_Char(it_agenda_central.hr_agenda,'HH24:MI:SS') hr_inicio,
    (to_char(it_agenda_central.hr_agenda + (agenda_central.qt_tempo_medio)/1440, 'hh24:mi')) hr_fim,
    agenda_central.cd_unidade_atendimento,
    agenda_central.cd_prestador,
    recurso_central.cd_recurso_central,
    agenda_central.cd_agenda_central,
    convenio.cd_convenio
   FROM AGENDA_CENTRAL
   LEFT JOIN dbamv.recurso_central ON recurso_central.cd_recurso_central = AGENDA_CENTRAL.cd_recurso_central
   LEFT JOIN dbamv.IT_AGENDA_CENTRAL ON  dbamv.IT_AGENDA_CENTRAL.cd_agenda_central = AGENDA_CENTRAL.cd_agenda_central
   LEFT JOIN DBAMV.PRESTADOR ON PRESTADOR.cd_prestador = AGENDA_CENTRAL.cd_prestador
   LEFT JOIN DBAMV.ATENDIME ON ATENDIME.cd_prestador = PRESTADOR.cd_prestador
   LEFT JOIN DBAMV.CONVENIO ON CONVENIO.cd_convenio = ATENDIME.cd_convenio
  WHERE item_agendamento_recurso.cd_item_agendamento = '${activity_lid}'
   and To_Char(it_agenda_central.hr_agenda,'DD/MM/YYYY') = '${start_day}'
   AND To_Char(it_agenda_central.hr_agenda,'DD/MM/YYYY') = '${end_day}'
   AND To_Char(it_agenda_central.hr_agenda,'HH24:MI') BETWEEN '${start_time}' AND '${end_time}'
   and convenio.cd_convenio = (${pega_conv[0].CD_CONVENIO})
   and con_pla.cd_con_pla = (${pega_conv[0].CD_CON_PLA})
   AND agenda_central.cd_unidade_atendimento in (${location_lids})
   AND it_agenda_central.cd_paciente IS NULL
   AND it_agenda_central.nm_paciente IS NULL 
   order by 1 DESC  

  `);

    if (!result || result.length === 0) {
      return {
        result: 'OK',
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