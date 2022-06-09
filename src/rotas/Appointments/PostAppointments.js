import knex from '../../database/db';
export async function post_appointments(
  availability,
  user,
  notes,
  tags,
  referral_doctor,
  communication,
) {
  try {

    const verifica_horario = await knex.raw(`
  SELECT * 
    FROM IT_AGENDA_CENTRAL 
  WHERE CD_IT_AGENDA_CENTRAL = ${availability.availability_lid}
  AND it_agenda_central.cd_paciente IS NULL
  AND it_agenda_central.nm_paciente IS NULL
    `);

    if (!verifica_horario || verifica_horario.length === 0) {
      return {
        result: 'OK',
        debug_msg: 'Horario não esta disponivel!',
      };
    }


    console.log('Validou horario')
    console.log(user.user_lid)

    if (user.user_lid != null && user.user_lid != '') {
      const verifica = await knex.raw(`
        SELECT *
          FROM dbamv.paciente
        WHERE CD_PACIENTE = ${user.user_lid} 
                                  `);

      console.log('DENTRO DO IF')
      console.log(verifica.length)

      if (!verifica || verifica.length === 0){
        return {
          result: 'OK',
          debug_msg: 'USER_LID NÃO EXISTE!',
        };

      }
    } 


    console.log('Passou if do user_lid')    

var verifica_user

console.log('user.user_lid')
console.log(user.user_lid)

if (!user.user_lid) {
   verifica_user = 0;
}
  else {
   verifica_user = await knex.raw(`
        SELECT *
          FROM dbamv.paciente
        WHERE CD_PACIENTE = ${user.user_lid}
    `);
  }

  
  console.log('Antes dos insert')
  var user_lid_existe
  var seq_agenda 

    if (!verifica_user || verifica_user.length !== 0) {

      user_lid_existe = verifica_user[0].CD_PACIENTE;

      const seq_paciente = verifica_user[0].CD_PACIENTE;

     seq_agenda = await knex.raw(
        `select tuotempo.seq_dti_agenda.nextval SEQ_DTI_AGENDA from dual`,
      );

      await knex.raw(`
      INSERT INTO tuotempo.tbl_dti_agenda (
        cd_dti_agenda,
        tp_status,   
        ds_erro,      
        dt_gerado,    
        tp_registro,  
        tp_movimento,
        cd_multi_empresa,
        cd_registro_filho,
        cd_item_agendamento,
        cd_unidade_atendimento,
        cd_prestador,
        dt_agenda,
        hr_inicio,
        hr_fim,
        cd_convenio,
        cd_seq_integra
  
      ) VALUES (
        ${seq_agenda[0].SEQ_DTI_AGENDA},
        'A',
        null,
        sysdate,
        '003',
        'I',
        1,
        ${seq_paciente},
        '${availability.activity_lid}',
        '${availability.location_lid}',
        '${availability.resource_lid}',
        '${availability.date}',
        '${availability.start_time}',
        '${availability.end_time}',
        '${availability.insurance_lid}',
        '${availability.availability_lid}'
      )
      `);

      await knex.raw(
        `
        DECLARE
          P_RESULT VARCHAR2(30);
        BEGIN
        P_RESULT := tuotempo.fnc_dti_controla_agendamento;
        END;
        `,
      );

      const verifica_agenda = await knex.raw(`
      SELECT *
       FROM tuotempo.tbl_dti_agenda
      WHERE cd_dti_agenda = ${seq_agenda[0].SEQ_DTI_AGENDA}
      and tp_status = 'T'
      `);

      if (!verifica_agenda || verifica_agenda.length === 0) {
        return {
          result: 'ERRO',
          debug_msg: 'Não foi possivel Registrar o Agendamento!',
        };
      }
    } else {

      const seq_paciente = await knex.raw(
        `select tuotempo.seq_dti_paciente.nextval seq_dti from dual`,
      );
      await knex.raw(`
      INSERT INTO tuotempo.tbl_dti_paciente(
        cd_dti_paciente,
        tp_status,   
        ds_erro,      
        dt_gerado,    
        tp_registro,  
        tp_movimento,
        cd_multi_empresa,
        cd_registro_principal,
        cd_registro_pai,
        nm_pessoa,
        nm_sobrenome,
        dt_nascimento,
        tp_sexo,
        ds_endereco,
        nr_endereco,
        nm_cidade,
        nr_cep,
        nr_telefone,
        nr_celular, 
        ds_email,
        cd_paciente_integra,
        tp_documento,
        nr_documento 
      ) 
      VALUES (
        ${seq_paciente[0].SEQ_DTI},
        'A',
        null,
        sysdate,
        '001',
        'I',
        1,
        '${seq_paciente[0].SEQ_DTI}',
        '${seq_paciente[0].SEQ_DTI}',
        '${user.first_name}',
        '${user.second_name}',
        '${user.birthdate}',
        '${user.gender}',
        '${user.address.street}',
        '${user.address.street_number}',
        '${user.address.city}',
        '${user.address.zipcode}',
        '${user.contact.landline}',
        '${user.contact.mobile}',
        '${user.contact.email}',
        '${user.user_lid}',
        '${user.id_number.type}',
        '${user.id_number.number}'
      )
      `);

      await knex.raw(
        `
        DECLARE
          P_RESULT VARCHAR2(30);
        
        BEGIN 
        P_RESULT := tuotempo.fnc_dti_controla_cad_paciente;
        END;
        `,
      );

      const verifica_paci = await knex.raw(`
      SELECT *
       FROM dbamv.paciente
      WHERE nr_cpf = '${user.id_number.number}'
      `);

      console.log('Seq da paciente')
      console.log (seq_paciente[0].SEQ_DTI)

      if (!verifica_paci || verifica_paci.length === 0) {
        return {
          result: 'ERRO',
          debug_msg: 'Não foi possivel Registrar o paciente!',
        };
      }

      user_lid_existe = verifica_paci[0].CD_PACIENTE;

     seq_agenda = await knex.raw(
        `select tuotempo.seq_dti_agenda.nextval SEQ_DTI_AGENDA from dual`,
      );

      console.log('Passou para o agendamento')

      await knex.raw(`
      INSERT INTO tuotempo.tbl_dti_agenda (
        cd_dti_agenda,
        tp_status,   
        ds_erro,      
        dt_gerado,    
        tp_registro,  
        tp_movimento,
        cd_multi_empresa,
        cd_registro_filho,
        cd_item_agendamento,
        cd_unidade_atendimento,
        cd_prestador,
        dt_agenda,
        hr_inicio,
        hr_fim,
        cd_convenio,
        cd_seq_integra
  
      ) VALUES (
        ${seq_agenda[0].SEQ_DTI_AGENDA},
        'A',
        null,
        sysdate,
        '003',
        'I',
        1,
         ${seq_paciente[0].SEQ_DTI},
        '${availability.activity_lid}',
        '${availability.location_lid}',
        '${availability.resource_lid}',
        '${availability.date}',
        '${availability.start_time}',
        '${availability.end_time}',
        '${availability.insurance_lid}',
        '${availability.availability_lid}'
      )
  
      `);

      await knex.raw(
        `
        DECLARE
          P_RESULT VARCHAR2(30);
        BEGIN 
        P_RESULT := tuotempo.fnc_dti_controla_agendamento;
        END;
        `,
      );

      const verifica_agenda = await knex.raw(`
      SELECT *
       FROM tuotempo.tbl_dti_agenda
      WHERE cd_dti_agenda = ${seq_agenda[0].SEQ_DTI_AGENDA}
      and tp_status = 'T'
      `);

      if (!verifica_agenda || verifica_agenda.length === 0) {
        return {
          result: 'ERRO',
          debug_msg: 'Não foi possivel Registrar o Agendamento!',
        };
      }
    }


    const resultado = await knex.raw(`
    SELECT 
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
      app_lid: availability.availability_lid,
      availability: {
        availability_lid: availability.availability_lid,
        date: resultado[0].DATA,
        start_time: resultado[0].START_TIME,
        end_time: resultado[0].END_TIME,
        location_lid: resultado[0].LOCATION_LID,
        resource_lid: resultado[0].RESOURCE_LID,
        activity_lid: availability.activity_lid,
        insurance_lid: availability.insurance_lid,
      },
      user: {
        user_lid: user_lid_existe,
        id_number: {
          number: user.id_number.number,
          type: user.id_number.type,
        },
        first_name: resultado[0].FIRST_NAME,
        second_name: resultado[0].SECOND_NAME,
        third_name: user.third_name,
        birthdate: resultado[0].BIRTHDATE,
        place_of_birth: user.place_of_birth,
        gender: resultado[0].GENDER,
        contact: {
          email: resultado[0].EMAIL,
          landline: user.contact.landline,
          mobile: resultado[0].MOBILE,
          work: user.contact.work,
        },
        privacy: {
          communication_preferences: {
            SMS: user.privacy.communication_preferences.sms,
            email: user.privacy.communication_preferences.email,
            phone: user.privacy.communication_preferences.phone,
          },
          primary: user.privacy.primary,
          promotions: user.privacy.promotions,
          review: user.privacy.review,
          dossier: user.privacy.dossier,
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
      notes: notes,
      tags: tags,
      referral_doctor: referral_doctor,
      communication: {
        email: communication.email,
        mobile_phone: communication.mobile_phone,
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

export { post_appointments };
