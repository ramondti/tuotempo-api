import knex from '../../database/db';

export async function del_appointments(app_lid) {
  try {

    const verifica_horario = await knex.raw(`
    SELECT * 
      FROM IT_AGENDA_CENTRAL 
    WHERE CD_IT_AGENDA_CENTRAL = ${app_lid}
    AND it_agenda_central.nm_paciente IS NOT NULL
    `);

    if (!verifica_horario || verifica_horario.length === 0) {
      return {
        result: 'OK',
        debug_msg: 'Horario esta disponivel!',
      };
    }

    await knex.raw(
      `
      DECLARE 
      P_OUT NUMBER ;
      P_IN  NUMBER;
      BEGIN prc_dti_exclui_agendamento(P_OUT,${app_lid}) ;
      END; 
      
        `,
    );


    const verifica = await knex.raw(`
    SELECT * 
      FROM IT_AGENDA_CENTRAL 
    WHERE CD_IT_AGENDA_CENTRAL = ${app_lid}
    AND it_agenda_central.nm_paciente IS NULL
    `);


    if (!verifica || verifica.length === 0) {
      return {
        result: 'OK',
        debug_msg: 'Horario não foi cancelado',
      };
    }


  const result = await knex.raw(`
  SELECT
  (SELECT To_Date(DT_GERADO, 'DD/MM/YY HH24:MI:SS')
   FROM DEPARA WHERE CD_DEPARA_MV = IT_AGENDA_CENTRAL.CD_IT_AGENDA_CENTRAL)                             AS dt_gerado,
  (SELECT To_Date(SYSDATE, 'DD/MM/YY HH24:MI:SS') FROM DUAL)                                            AS cancelled,   
  IT_AGENDA_CENTRAL.CD_IT_AGENDA_CENTRAL                                                                AS availability_lid,
  To_Char(IT_AGENDA_CENTRAL.hr_agenda,'DD/MM/YY')                                                       AS data,
  To_Char(IT_AGENDA_CENTRAL.hr_agenda,'hh24:mi')                                                        AS start_time,
  (to_char(it_agenda_central.hr_agenda + (agenda_central.qt_tempo_medio)/1440, 'hh24:mi'))              AS end_time,
  agenda_central.cd_unidade_atendimento                                                                 AS location_LID,
  prestador.cd_prestador                                                                                AS RESOURCE_LID,
  IT_AGENDA_CENTRAL.cd_item_agendamento                                                                 AS activity_lid,
  (CASE WHEN (IT_AGENDA_CENTRAL.cd_convenio || '-' || IT_AGENDA_CENTRAL.cd_con_pla) = '-' THEN
  NULL ELSE IT_AGENDA_CENTRAL.cd_convenio || '-' || IT_AGENDA_CENTRAL.cd_con_pla       END )            AS insurance_lid,
  PACIENTE.cd_paciente                                                                                  AS user_lid,
  paciente.nr_cpf                                                                                       AS ID_NUMBER,
  1                                                                                                     AS ID_TYPE,
  NVL(SUBSTR(IT_AGENDA_CENTRAL.NM_PACIENTE,0, 
    INSTR(IT_AGENDA_CENTRAL.NM_PACIENTE, ' ')-1), IT_AGENDA_CENTRAL.NM_PACIENTE)                        AS first_name,
    NVL(SUBSTR(IT_AGENDA_CENTRAL.NM_PACIENTE,INSTR(IT_AGENDA_CENTRAL.NM_PACIENTE, ' ') + 1, 
    INSTR(IT_AGENDA_CENTRAL.NM_PACIENTE, ' ')+20000), IT_AGENDA_CENTRAL.NM_PACIENTE)                    AS second_name,  
  to_char(paciente.dt_nascimento,'dd/mm/yyyy')                                                          AS birthdate,
  PACIENTE.CD_CIDADE                                                                                    AS place_of_birth,
  PACIENTE.tp_sexo                                                                                      AS GENDER,
  paciente.email                                                                                        AS email,
  paciente.nr_celular                                                                                   AS mobile,
  paciente.nr_ddd_fone as NR_FONE,
  paciente.nr_ddd_celular,
  paciente.nr_endereco AS street_number,
  paciente.ds_endereco AS street,
  paciente.nr_cep AS zipcode                                          
  FROM DBAMV.AGENDA_CENTRAL
  LEFT JOIN DBAMV.IT_AGENDA_CENTRAL ON IT_AGENDA_CENTRAL.CD_AGENDA_CENTRAL = AGENDA_CENTRAL.CD_AGENDA_CENTRAL
  LEFT JOIN DBAMV.PRESTADOR ON PRESTADOR.CD_PRESTADOR = AGENDA_CENTRAL.CD_PRESTADOR
  LEFT JOIN DBAMV.PACIENTE ON PACIENTE.CD_PACIENTE = IT_AGENDA_CENTRAL.CD_PACIENTE
  LEFT JOIN DBAMV.CONVENIO ON CONVENIO.CD_CONVENIO = IT_AGENDA_CENTRAL.CD_CONVENIO
  WHERE IT_AGENDA_CENTRAL.cd_it_agenda_central = '${availability.availability_lid}'
  `);


    const dados = {
      app_lid: app_lid,
      created: result[0].DT_GERADO,
      cancelled: result[0].CANCELLED,
      modified: null,
      status: 'Cancelled',
      checkedin: null,
      start_visit: null,
      end_visit: null,
      notes: null,
      tags: null,
      availability: {
        availability_lid: result[0].AVAILABILITY_LID,
        date: result[0].DATA,
        start_time: result[0].START_TIME,
        end_time: result[0].END_TIME,
        location_lid: resultado[0].LOCATION_LID,
        resource_lid: resultado[0].RESOURCE_LID,
        activity_lid: null,
        insurance_lid: resultado[0].INSURANCE_LID,
      },
      user: {
        user_lid: resultado[0].USER_LID,
        id_number: {
          number: resultado[0].ID_UMBER,
          type: resultado[0].ID_TYPE,
        },
        first_name: resultado[0].FIRST_NAME,
        second_name: resultado[0].SECOND_NAME,
        third_name: null,
        birthdate: resultado[0].BIRTHDATE,
        place_of_birth: null,
        gender: resultado[0].GENDER,
        contact: {
          email: resultado[0].EMAIL,
          landline: null,
          mobile: resultado[0].MOBILE,
          work: null,
        },
        address: {
          street: resultado[0].STREET,
          street_number: resultado[0].STREET_NUMBER,
          zipcode:  resultado[0].ZIPCODE,
          city: null,
          province: null,
          region: null,
          country: null,
        },
      },
    };

    return { result: 'OK', return: dados };
  } catch (error) {
    console.log(error);
    return {
      result: 'ERROR',
      debug_msg: 'Erro de busca!',
    };
  }
}
export { del_appointments };
