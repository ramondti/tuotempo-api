import knex from '../database/db';

export async function get_activities() {
  try {
    const result = await knex.raw(`
    SELECT DISTINCT
      recurso_central.cd_recurso_central,
      recurso_central.ds_recurso_central,
      item_agendamento.cd_item_agendamento,
      item_agendamento.ds_item_agendamento,
      item_agendamento.cd_exa_rx,
      item_agendamento.cd_exa_lab,
      (CASE WHEN gru_pro.cd_gru_pro IS NULL THEN (SELECT pro_fat.cd_gru_pro                             
                                                  FROM pro_fat                                          
                                                 WHERE pro_fat.cd_pro_fat =item_agendamento.cd_pro_Fat)
                                            ELSE gru_pro.cd_gru_pro END) cd_grupo,

      (CASE WHEN gru_pro.ds_gru_pro IS NULL THEN (SELECT gru_pro.ds_gru_pro
                                                  FROM gru_pro
                                                  WHERE gru_pro.cd_gru_pro = (SELECT pro_fat.cd_gru_pro
                                                                              FROM pro_fat
                                                                             WHERE pro_fat.cd_pro_fat =item_agendamento.cd_pro_Fat )
                                                 )
                                            ELSE gru_pro.ds_gru_pro END) ds_grupo,
     exa_rx.ds_orientacao 
    FROM dbamv.agenda_central
    LEFT JOIN dbamv.recurso_central ON recurso_central.cd_recurso_central = agenda_central.cd_recurso_central
    LEFT JOIN dbamv.item_agendamento_recurso ON item_agendamento_recurso.cd_recurso_central = recurso_central.cd_recurso_central
    LEFT JOIN dbamv.item_agendamento ON item_agendamento.cd_item_agendamento = item_agendamento_recurso.cd_item_agendamento
    LEFT JOIN dbamv.exa_rx ON exa_rx.cd_exa_rx = item_agendamento.cd_exa_rx
    LEFT JOIN dbamv.pro_fat ON pro_fat.cd_pro_Fat = exa_rx.exa_rx_cd_pro_fat
    LEFT JOIN dbamv.gru_pro ON gru_pro.cd_gru_pro = pro_fat.cd_gru_pro
    WHERE recurso_central.cd_recurso_central IS NOT NULL

  `);

    if (!result || result.length === 0) {
      return {
        result: 'OK'
      };
    }

    const dados = [];
    result.forEach(element => {
      dados.push({
        activity_lid: element.CD_ITEM_AGENDAMENTO,
        name: element.DS_ITEM_AGENDAMENTO,
        group: {
          group_lid: element.CD_GRUPO,
          name: element.DS_GRUPO
        },
        type: 'presential',
        duration: null,
        notice: null,
        operator_notice: null,
        preparation:element.DS_ORIENTACAO,

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
    item_agendamento.cd_item_agendamento,
    item_agendamento.ds_item_agendamento,
    (CASE WHEN gru_pro.cd_gru_pro IS NULL THEN (SELECT pro_fat.cd_gru_pro                             
                                                FROM pro_fat                                          
                                               WHERE pro_fat.cd_pro_fat =item_agendamento.cd_pro_Fat)
                                          ELSE gru_pro.cd_gru_pro END) cd_grupo,

    (CASE WHEN gru_pro.ds_gru_pro IS NULL THEN (SELECT gru_pro.ds_gru_pro
                                                FROM gru_pro
                                                WHERE gru_pro.cd_gru_pro = (SELECT pro_fat.cd_gru_pro
                                                                            FROM pro_fat
                                                                           WHERE pro_fat.cd_pro_fat =item_agendamento.cd_pro_Fat )
                                               )
                                          ELSE gru_pro.ds_gru_pro END) ds_grupo,
   exa_rx.ds_orientacao 
  FROM dbamv.agenda_central
  LEFT JOIN dbamv.recurso_central ON recurso_central.cd_recurso_central = agenda_central.cd_recurso_central
  LEFT JOIN dbamv.item_agendamento_recurso ON item_agendamento_recurso.cd_recurso_central = recurso_central.cd_recurso_central
  LEFT JOIN dbamv.item_agendamento ON item_agendamento.cd_item_agendamento = item_agendamento_recurso.cd_item_agendamento
  LEFT JOIN dbamv.exa_rx ON exa_rx.cd_exa_rx = item_agendamento.cd_exa_rx
  LEFT JOIN dbamv.pro_fat ON pro_fat.cd_pro_Fat = exa_rx.exa_rx_cd_pro_fat
  LEFT JOIN dbamv.gru_pro ON gru_pro.cd_gru_pro = pro_fat.cd_gru_pro
  LEFT JOIN dbamv.prestador ON prestador.cd_prestador = agenda_central.cd_prestador
WHERE recurso_central.cd_recurso_central IS NOT NULL
AND agenda_central.cd_prestador = ${resource_lid}
AND recurso_central.cd_recurso_central IS NOT null
AND (CASE WHEN gru_pro.cd_gru_pro IS NULL THEN (SELECT pro_fat.cd_gru_pro                             
                                                FROM pro_fat                                          
                                               WHERE pro_fat.cd_pro_fat =item_agendamento.cd_pro_Fat)
                                          ELSE gru_pro.cd_gru_pro END) IS NOT NULL;



  `);

    if (!result || result.length === 0) {
      return {
        result: 'OK'
      };
    }

    const dados = [];
    result.forEach(element => {
      dados.push({
        activity_lid: element.CD_ITEM_AGENDAMENTO,
        name: element.DS_ITEM_AGENDAMENTO,
        group: {
          group_lid: element.CD_GRUPO,
          name: element.DS_GRUPO
        },
        duration: 'presential',
        notice: null,
        operator_notice: null,
        preparation: element.DS_ORIENTACAO,
        web_enabled:'true',
        active:'true'

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
    item_agendamento.cd_item_agendamento,
    item_agendamento.ds_item_agendamento,
    (CASE WHEN gru_pro.cd_gru_pro IS NULL THEN (SELECT pro_fat.cd_gru_pro                             
                                                FROM pro_fat                                          
                                               WHERE pro_fat.cd_pro_fat =item_agendamento.cd_pro_Fat)
                                          ELSE gru_pro.cd_gru_pro END) cd_grupo,

    (CASE WHEN gru_pro.ds_gru_pro IS NULL THEN (SELECT gru_pro.ds_gru_pro
                                                FROM gru_pro
                                                WHERE gru_pro.cd_gru_pro = (SELECT pro_fat.cd_gru_pro
                                                                            FROM pro_fat
                                                                           WHERE pro_fat.cd_pro_fat =item_agendamento.cd_pro_Fat )
                                               )
                                          ELSE gru_pro.ds_gru_pro END) ds_grupo,
   exa_rx.ds_orientacao 
  FROM dbamv.agenda_central
  LEFT JOIN dbamv.recurso_central ON recurso_central.cd_recurso_central = agenda_central.cd_recurso_central
  LEFT JOIN dbamv.item_agendamento_recurso ON item_agendamento_recurso.cd_recurso_central = recurso_central.cd_recurso_central
  LEFT JOIN dbamv.item_agendamento ON item_agendamento.cd_item_agendamento = item_agendamento_recurso.cd_item_agendamento
  LEFT JOIN dbamv.exa_rx ON exa_rx.cd_exa_rx = item_agendamento.cd_exa_rx
  LEFT JOIN dbamv.pro_fat ON pro_fat.cd_pro_Fat = exa_rx.exa_rx_cd_pro_fat
  LEFT JOIN dbamv.gru_pro ON gru_pro.cd_gru_pro = pro_fat.cd_gru_pro
  LEFT JOIN dbamv.prestador ON prestador.cd_prestador = agenda_central.cd_prestador
WHERE recurso_central.cd_recurso_central IS NOT NULL
AND agenda_central.cd_prestador = ${resource_lid}
AND agenda_central.cd_unidade_atendimento = ${location_lid}
AND recurso_central.cd_recurso_central IS NOT null
AND (CASE WHEN gru_pro.cd_gru_pro IS NULL THEN (SELECT pro_fat.cd_gru_pro                             
                                                FROM pro_fat                                          
                                               WHERE pro_fat.cd_pro_fat =item_agendamento.cd_pro_Fat)
                                          ELSE gru_pro.cd_gru_pro END) IS NOT NULL;


  `);

    if (!result || result.length === 0) {
      return {
        result: 'OK'
      };
    }

    const dados = [];

    result.forEach(element => {
      dados.push({
        activity_lid: element.CD_ITEM_AGENDAMENTO,
        name: element.DS_ITEM_AGENDAMENTO,
        group: {
          group_lid: element.CD_GRUPO,
          name: element.DS_GRUPO
        },
        duration: 'presential',
        notice: null,
        operator_notice: null,
        preparation: element.DS_ORIENTACAO,
        web_enabled:'true',
        active:'true'

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

    console.log(insurance_lid)
    const pega_conv = await knex.raw(`
      SELECT 
        NVL(SUBSTR('${insurance_lid}',INSTR('${insurance_lid}', '-') + 1, INSTR('${insurance_lid}', '-')+20000), ${insurance_lid}) cd_con_pla,
        NVL(SUBSTR('${insurance_lid}',0, INSTR('${insurance_lid}', '-')-1), '${insurance_lid}') cd_convenio
      FROM dual

    `);

 
    console.log(pega_conv[0].CD_CON_PLA)
    console.log(pega_conv[0].CD_CONVENIO)

    
    const result = await knex.raw(`
    SELECT DISTINCT  
    recurso_central.cd_recurso_central,
    recurso_central.ds_recurso_central,
    item_agendamento.cd_item_agendamento,
    item_agendamento.ds_item_agendamento,
    con_pla.cd_con_pla
    FROM dbamv.agenda_central
    LEFT JOIN dbamv.recurso_central ON recurso_central.cd_recurso_central = agenda_central.cd_recurso_central
    LEFT JOIN dbamv.item_agendamento_recurso ON item_agendamento_recurso.cd_recurso_central = recurso_central.cd_recurso_central
    LEFT JOIN dbamv.item_agendamento ON item_agendamento.cd_item_agendamento = item_agendamento_recurso.cd_item_agendamento
    LEFT JOIN dbamv.prestador ON prestador.cd_prestador = agenda_central.cd_prestador
    LEFT JOIN dbamv.atendime ON atendime.cd_prestador = prestador.cd_prestador
    LEFT JOIN dbamv.convenio ON convenio.cd_convenio = atendime.cd_convenio
    LEFT JOIN dbamv.con_pla ON con_pla.cd_convenio = convenio.cd_convenio
    WHERE convenio.cd_convenio = ${pega_conv[0].CD_CONVENIO}
    and con_pla.cd_con_pla = ${pega_conv[0].CD_CON_PLA}
    AND recurso_central.cd_recurso_central IS NOT null

  `);

    if (!result || result.length === 0) {
      return {
        result: 'OK'
      };
    }

    const dados = [];

    result.forEach(element => {
      dados.push(element.CD_ITEM_AGENDAMENTO);
     });

     const id = {activity_lids : dados};

    return { result: 'OK', return: id };
  } catch (error) {
    console.log(error)
    return { 
      result: 'ERROR',
      debug_msg: 'Erro ao consultar o banco de dados!' };
  }
}


export { get_activities };
