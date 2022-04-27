import knex from '../../database/db';


export async function get_noshow(start_date,end_date) {
  try {
  
 const result = await knex.raw(`
 SELECT                                                                                              
 it_agenda_central.cd_it_agenda_central                                                                AS app_lid,
 null                                                                                                  AS created,
 NULL                                                                                                  AS cancelled,
 NULL 		                                                                                              AS modified,
 IT_AGENDA_CENTRAL.DS_OBSERVACAO                                                                       AS status,
 To_Char(agenda_central.dt_agenda,'dd/mm/yyyy')||' '||To_Char(agenda_central.hr_inicio,'hh24:mi:ss')   AS checkedin,
 To_Char(agenda_central.dt_agenda,'dd/mm/yyyy')||' '||To_Char(agenda_central.hr_inicio,'hh24:mi:ss')   AS start_visit,
 To_Char(agenda_central.dt_agenda,'dd/mm/yyyy')||' '||To_Char(agenda_central.hr_fim,'hh24:mi:ss')      AS end_visit,
 IT_AGENDA_CENTRAL.CD_IT_AGENDA_CENTRAL                                                                AS availability_lid, 
 agenda_central.dt_agenda                                                                              AS "date",
 IT_AGENDA_CENTRAL.hr_agenda                                                                           AS start_time,
 (to_char(it_agenda_central.hr_agenda + (agenda_central.qt_tempo_medio)/1440, 'hh24:mi'))              AS  end_time,
 agenda_central.cd_unidade_atendimento                                                                 AS location_LID,
 prestador.cd_prestador                                                                                AS resurce_lid,
 IT_AGENDA_CENTRAL.cd_item_agendamento                                                                 AS activity_lid,
 IT_AGENDA_CENTRAL.cd_convenio                                                                         AS insurance_lid,
 NULL                                                                                                  AS PRICE,
 PACIENTE.cd_paciente                                                                                  AS user_lid,
 NR_CPF                                                                                                AS ID_NUMBER,
 1                                                                                                     AS ID_TYPE,
 NVL(SUBSTR(IT_AGENDA_CENTRAL.NM_PACIENTE,0, 
 INSTR(IT_AGENDA_CENTRAL.NM_PACIENTE, ' ')-1), IT_AGENDA_CENTRAL.NM_PACIENTE)                          AS NM_PACIENTEE,
 NVL(SUBSTR(IT_AGENDA_CENTRAL.NM_PACIENTE,INSTR(IT_AGENDA_CENTRAL.NM_PACIENTE, ' ') + 1, 
 INSTR(IT_AGENDA_CENTRAL.NM_PACIENTE, ' ')+20000), IT_AGENDA_CENTRAL.NM_PACIENTE)                      AS NM_SOBRENOME,
 PACIENTE.dt_nascimento                                                                                AS birthdate,
 PACIENTE.CD_CIDADE                                                                                    AS place_of_birth,
 PACIENTE.tp_sexo                                                                                      AS GENDER,
 paciente.email                                                                                        AS email,
 paciente.nr_celular                                                                                   AS mobile
 
 FROM DBAMV.AGENDA_CENTRAL
 LEFT JOIN DBAMV.IT_AGENDA_CENTRAL ON IT_AGENDA_CENTRAL.CD_AGENDA_CENTRAL = AGENDA_CENTRAL.CD_AGENDA_CENTRAL
 LEFT JOIN DBAMV.PRESTADOR ON PRESTADOR.CD_PRESTADOR = AGENDA_CENTRAL.CD_PRESTADOR
 LEFT JOIN DBAMV.PACIENTE ON PACIENTE.CD_PACIENTE = IT_AGENDA_CENTRAL.CD_PACIENTE
 WHERE sn_atendido = 'N' 
AND To_Char(AGENDA_CENTRAL.DT_AGENDA,'DD/MM/YYYY') 
BETWEEN 	'${start_date}' 
AND       '${end_date}'
    `);

    console.log(result)

    if (!result || result.length === 0) {
      return {
        result: 'OK'
      };
    }

    const dados = [];
    result.forEach(element => {
      dados.push({
        "app_lid": element.APP_LID,
        "created": element.CREATED,
        "cancelled": element.CANCELLED,
        "modified": element.MODIFIED,
        "status": element.STATUS,
        "checkedin": null,
        "start_visit": element.START_VISIT,
        "end_visit": element.END_VISIT,
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

export { get_noshow };