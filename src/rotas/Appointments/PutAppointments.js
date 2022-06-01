import knex from '../../database/db';

export async function put_appointments(app_lid, status, cancellation_reason ) {
  try {

    const result = await knex.raw(`
    SELECT 
    IT_AGENDA_CENTRAL.cd_it_agenda_central                                                                AS app_lid,
    NULL                                                                                                  AS created,
    IT_AGENDA_CENTRAL.ds_observacao                                                                       AS cancelled,
    IT_AGENDA_CENTRAL.dt_gravacao 								                                                        AS modified,
    null                                                                                                  AS status,
    NULL                                                                                                  AS checkedin,
    NULL                                                                                                  AS start_visit,
    NULL                                                                                                  AS end_visit,
    IT_AGENDA_CENTRAL.CD_IT_AGENDA_CENTRAL                                                                AS availability_lid, 
    to_char(agenda_central.dt_agenda,'dd/mm/yyyy')                                                        AS data,
    To_Char(it_agenda_central.hr_agenda,'HH24:MI')                                                        AS start_time,
    (to_char(it_agenda_central.hr_agenda + (agenda_central.qt_tempo_medio)/1440, 'hh24:mi'))              AS end_time,
    agenda_central.cd_unidade_atendimento                                                                 AS location_LID,
    prestador.cd_prestador                                                                                AS resurce_lid,
    IT_AGENDA_CENTRAL.cd_item_agendamento                                                                 AS activity_lid,
    IT_AGENDA_CENTRAL.cd_convenio                                                                         AS insurance_lid,
    NULL                                                                                                  AS PRICE,
    PACIENTE.cd_paciente                                                                                  AS user_lid,  
    PACIENTE.nr_cpf                                                                                       AS ID_NUMBER,
    1                                                                                                     AS ID_TYPE,
    NVL(SUBSTR(IT_AGENDA_CENTRAL.NM_PACIENTE,0, 
    INSTR(IT_AGENDA_CENTRAL.NM_PACIENTE, ' ')-1), IT_AGENDA_CENTRAL.NM_PACIENTE)                          AS first_name,
    NVL(SUBSTR(IT_AGENDA_CENTRAL.NM_PACIENTE,INSTR(IT_AGENDA_CENTRAL.NM_PACIENTE, ' ') + 1, 
    INSTR(IT_AGENDA_CENTRAL.NM_PACIENTE, ' ')+20000), IT_AGENDA_CENTRAL.NM_PACIENTE)                      AS second_name,
    PACIENTE.dt_nascimento                                                                                AS birthdate,
    --' '                                                                                                 AS third_name,
    PACIENTE.CD_CIDADE                                                                                    AS place_of_birth,
    PACIENTE.tp_sexo                                                                                      AS GENDER,
    paciente.email                                                                                        AS email,
    paciente.nr_celular                                                                                   AS mobile
    FROM DBAMV.AGENDA_CENTRAL
    LEFT JOIN DBAMV.IT_AGENDA_CENTRAL ON IT_AGENDA_CENTRAL.CD_AGENDA_CENTRAL = AGENDA_CENTRAL.CD_AGENDA_CENTRAL
    LEFT JOIN DBAMV.PRESTADOR ON PRESTADOR.CD_PRESTADOR = AGENDA_CENTRAL.CD_PRESTADOR
    LEFT JOIN DBAMV.PACIENTE ON PACIENTE.CD_PACIENTE = IT_AGENDA_CENTRAL.CD_PACIENTE
    WHERE IT_AGENDA_CENTRAL.cd_it_agenda_central = ${app_lid}   
    `);

    if (!result || result.length === 0) {
      return {
        result: 'OK'
      };
    }

    console.log('cancellation_reason')
    console.log(cancellation_reason)

  await knex.raw(`
  UPDATE DBAMV.IT_AGENDA_CENTRAL SET ds_observacao = '${status}' 
  WHERE cd_it_agenda_central = ${result[0].AVAILABILITY_LID} 

  `
  )

    const dados = [];
    result.forEach(element => {
      dados.push({
        "app_lid": app_lid,
        "created": null,
        "cancelled": cancellation_reason,
        "modified": null,
        "status": status,
        "checkedin": null,
        "start_visit": null,
        "end_visit": null,
        "notes": "", 
        "tags": "",
        "availability": {
            "availability_lid": element.AVAILABILITY_LID,
            "date": element.DATA,
            "start_time": element.START_TIME,
            "end_time": element.END_TIME,
            "location_lid": element.LOCATION_LID,
            "resource_lid": element.RESOURCE_LID,
            "activity_lid": element.ACTIVITY_LID,
            "insurance_lid": element.INSURANCE_LID,
            "price": null
        },
        "user": { // *Mandatory* Patient
            "user_lid": element.USER_LID,
            "id_number": {
                "number": element.ID_NUMBER,
                "type": 1
            },
            "first_name": element.FIRST_NAME, // *Mandatory*  First Name
            "second_name": element.SECOND_NAME, // *Mandatory*  Second Name
            "third_name": null, // Date of Birth (format: dd/mm/yyyy) 
            "birthdate": element.BIRTHDATE, // *Mandatory*
            "place_of_birth": null, // Istat luogo di. nascita
            "gender": element.GENDER, // Gender (M, F) –  *Mandatory* Only if using tuOtempO SURVEY
            "contact": {
                "email":element.EMAIL, // *Mandatory* Mobile number
                "landline": element.LANDLINE,
                "mobile": element.MOBILE, // *Mandatory* Email
                "work": null
            },
            "address": {}
        }
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

export { put_appointments };