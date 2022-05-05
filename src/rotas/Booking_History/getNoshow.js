import knex from '../../database/db';

export async function get_noshow(start_date, end_date) {
  try {


    console.log('Entrou noshow: ' + start_date + ' ' + end_date);

    var result01

    if (start_date === undefined && end_date === undefined) {
   result01 = await knex.raw(`
     SELECT                                                                                              
     it_agenda_central.cd_it_agenda_central                                                                AS app_lid,
     null                                                                                                  AS created,
     NULL                                                                                                  AS cancelled,
     NULL 		                                                                                              AS modified,
     (CASE WHEN IT_AGENDA_CENTRAL.SN_ATENDIDO ='N' THEN 6 END)                                             AS status,
     To_Char(agenda_central.dt_agenda,'dd/mm/yyyy')||' '||To_Char(agenda_central.hr_inicio,'hh24:mi:ss')   AS checkedin,
     To_Char(agenda_central.dt_agenda,'dd/mm/yyyy')||' '||To_Char(agenda_central.hr_inicio,'hh24:mi:ss')   AS start_visit,
     To_Char(agenda_central.dt_agenda,'dd/mm/yyyy')||' '||To_Char(agenda_central.hr_fim,'hh24:mi:ss')      AS end_visit,
     IT_AGENDA_CENTRAL.CD_IT_AGENDA_CENTRAL                                                                AS availability_lid, 
    To_Char(IT_AGENDA_CENTRAL.hr_agenda,'hh24:mi')                                                        AS start_time,
     (to_char(it_agenda_central.hr_agenda + (agenda_central.qt_tempo_medio)/1440, 'hh24:mi'))              AS  end_time,
     agenda_central.cd_unidade_atendimento                                                                 AS location_LID,
     prestador.cd_prestador                                                                                AS RESOURCE_LID,
     IT_AGENDA_CENTRAL.cd_item_agendamento                                                                 AS activity_lid,
     (CASE WHEN (IT_AGENDA_CENTRAL.cd_convenio || '-' || IT_AGENDA_CENTRAL.cd_con_pla) = '-' THEN
     NULL ELSE IT_AGENDA_CENTRAL.cd_convenio || '-' || IT_AGENDA_CENTRAL.cd_con_pla       END )            AS insurance_lid,
     NULL                                                                                                  AS PRICE,
     PACIENTE.cd_paciente                                                                                  AS user_lid,
     NR_CPF                                                                                                AS ID_NUMBER,
     1                                                                                                     AS ID_TYPE,
     NVL(SUBSTR(IT_AGENDA_CENTRAL.NM_PACIENTE,0, 
     INSTR(IT_AGENDA_CENTRAL.NM_PACIENTE, ' ')-1), IT_AGENDA_CENTRAL.NM_PACIENTE)                          AS NM_PACIENTEE,
     NVL(SUBSTR(IT_AGENDA_CENTRAL.NM_PACIENTE,INSTR(IT_AGENDA_CENTRAL.NM_PACIENTE, ' ') + 1, 
     INSTR(IT_AGENDA_CENTRAL.NM_PACIENTE, ' ')+20000), IT_AGENDA_CENTRAL.NM_PACIENTE)                      AS NM_SOBRENOME,
     to_char(paciente.dt_nascimento,'dd/mm/yyyy')                                                          AS birthdate,
     PACIENTE.CD_CIDADE                                                                                    AS place_of_birth,
     PACIENTE.tp_sexo                                                                                      AS GENDER,
     To_Char(agenda_central.dt_agenda ,'dd/mm/yyyy')                                                       AS DATA, 
     paciente.email                                                                                        AS email,
     paciente.nr_celular                                                                                   AS mobile
     FROM DBAMV.AGENDA_CENTRAL
     LEFT JOIN DBAMV.IT_AGENDA_CENTRAL ON IT_AGENDA_CENTRAL.CD_AGENDA_CENTRAL = AGENDA_CENTRAL.CD_AGENDA_CENTRAL
     LEFT JOIN DBAMV.PRESTADOR ON PRESTADOR.CD_PRESTADOR = AGENDA_CENTRAL.CD_PRESTADOR
     LEFT JOIN DBAMV.PACIENTE ON PACIENTE.CD_PACIENTE = IT_AGENDA_CENTRAL.CD_PACIENTE
     LEFT JOIN DBAMV.CONVENIO ON CONVENIO.CD_CONVENIO = IT_AGENDA_CENTRAL.CD_CONVENIO
     LEFT JOIN DBAMV.con_pla ON con_pla.cd_convenio = convenio.cd_convenio 
     WHERE sn_atendido = 'N'
     AND IT_AGENDA_CENTRAL.NM_PACIENTE is not null
     AND AGENDA_CENTRAL.DT_AGENDA BETWEEN To_Date(SYSDATE-1,'DD/MM/YYYY') AND To_Date(SYSDATE,'DD/MM/YYYY')
    `);
    } else {
      result01 = await knex.raw(`
     SELECT                                                                                              
     it_agenda_central.cd_it_agenda_central                                                                AS app_lid,
     null                                                                                                  AS created,
     NULL                                                                                                  AS cancelled,
     NULL 		                                                                                              AS modified,
    (CASE WHEN IT_AGENDA_CENTRAL.SN_ATENDIDO ='N' THEN 6 END)                                          AS status,
     To_Char(agenda_central.dt_agenda,'dd/mm/yyyy')||' '||To_Char(agenda_central.hr_inicio,'hh24:mi:ss')   AS checkedin,
     To_Char(agenda_central.dt_agenda,'dd/mm/yyyy')||' '||To_Char(agenda_central.hr_inicio,'hh24:mi:ss')   AS start_visit,
     To_Char(agenda_central.dt_agenda,'dd/mm/yyyy')||' '||To_Char(agenda_central.hr_fim,'hh24:mi:ss')      AS end_visit,
     IT_AGENDA_CENTRAL.CD_IT_AGENDA_CENTRAL                                                                AS availability_lid, 
    To_Char(IT_AGENDA_CENTRAL.hr_agenda,'hh24:mi')                                                        AS start_time,
     (to_char(it_agenda_central.hr_agenda + (agenda_central.qt_tempo_medio)/1440, 'hh24:mi'))              AS  end_time,
     agenda_central.cd_unidade_atendimento                                                                 AS location_LID,
     prestador.cd_prestador                                                                                AS RESOURCE_LID,
     IT_AGENDA_CENTRAL.cd_item_agendamento                                                                 AS activity_lid,
     (CASE WHEN (IT_AGENDA_CENTRAL.cd_convenio || '-' || IT_AGENDA_CENTRAL.cd_con_pla) = '-' THEN
     NULL ELSE IT_AGENDA_CENTRAL.cd_convenio || '-' || IT_AGENDA_CENTRAL.cd_con_pla       END )            AS insurance_lid,
     NULL                                                                                                  AS PRICE,
     PACIENTE.cd_paciente                                                                                  AS user_lid,
     NR_CPF                                                                                                AS ID_NUMBER,
     1                                                                                                     AS ID_TYPE,
     NVL(SUBSTR(IT_AGENDA_CENTRAL.NM_PACIENTE,0, 
     INSTR(IT_AGENDA_CENTRAL.NM_PACIENTE, ' ')-1), IT_AGENDA_CENTRAL.NM_PACIENTE)                          AS NM_PACIENTEE,
     NVL(SUBSTR(IT_AGENDA_CENTRAL.NM_PACIENTE,INSTR(IT_AGENDA_CENTRAL.NM_PACIENTE, ' ') + 1, 
     INSTR(IT_AGENDA_CENTRAL.NM_PACIENTE, ' ')+20000), IT_AGENDA_CENTRAL.NM_PACIENTE)                      AS NM_SOBRENOME,
     to_char(paciente.dt_nascimento,'dd/mm/yyyy')                                                          AS birthdate,
     PACIENTE.CD_CIDADE                                                                                    AS place_of_birth,
     PACIENTE.tp_sexo                                                                                      AS GENDER,
     To_Char(agenda_central.dt_agenda ,'dd/mm/yyyy')                                                       AS DATA,  
     paciente.email                                                                                        AS email,
     paciente.nr_celular                                                                                   AS mobile
     FROM DBAMV.AGENDA_CENTRAL
     LEFT JOIN DBAMV.IT_AGENDA_CENTRAL ON IT_AGENDA_CENTRAL.CD_AGENDA_CENTRAL = AGENDA_CENTRAL.CD_AGENDA_CENTRAL
     LEFT JOIN DBAMV.PRESTADOR ON PRESTADOR.CD_PRESTADOR = AGENDA_CENTRAL.CD_PRESTADOR
     LEFT JOIN DBAMV.PACIENTE ON PACIENTE.CD_PACIENTE = IT_AGENDA_CENTRAL.CD_PACIENTE
     LEFT JOIN DBAMV.CONVENIO ON CONVENIO.CD_CONVENIO = IT_AGENDA_CENTRAL.CD_CONVENIO
     LEFT JOIN DBAMV.con_pla ON con_pla.cd_convenio = convenio.cd_convenio     
     WHERE sn_atendido = 'N'
     AND IT_AGENDA_CENTRAL.NM_PACIENTE is not null
     AND AGENDA_CENTRAL.DT_AGENDA BETWEEN To_Date('${start_date}','DD/MM/YYYY') AND To_Date('${end_date}','DD/MM/YYYY') 
       `);
    }
    if (!result01 || result01.length === 0) {
      return {
        result: 'OK',
      };
    }

    const dados = [];
    result01.forEach(element => {
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
                "landline": null,
                "mobile": element.MOBILE, // *Mandatory* Email
                "work": null
            },
            "address": {}
        }
      });
    });

    console.log(dados);

    return { result: 'OK', return: dados };
  } catch (error) {
    console.log(error);
    return {
      result: 'ERROR',
      debug_msg: 'Erro ao consultar o banco de dados!',
    };
  }
}

export { get_noshow };
