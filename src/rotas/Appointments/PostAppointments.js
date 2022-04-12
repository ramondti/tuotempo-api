import knex from '../../database/db';
const oracledb = require('oracledb');

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
    SELECT DISTINCT
    to_char(it_agenda_central.hr_agenda,'dd/mm/yyyy') dt_agenda,
    To_Char(it_agenda_central.hr_agenda,'HH24:MI:SS') hr_inicio,
    (to_char(it_agenda_central.hr_agenda + (agenda_central.qt_tempo_medio)/1440, 'hh24:mi')) hr_fim,
    agenda_central.cd_unidade_atendimento,
    agenda_central.cd_prestador,
    recurso_central.cd_recurso_central,
    agenda_central.cd_agenda_central
   FROM AGENDA_CENTRAL
   LEFT JOIN dbamv.recurso_central ON recurso_central.cd_recurso_central = AGENDA_CENTRAL.cd_recurso_central
   LEFT JOIN dbamv.IT_AGENDA_CENTRAL ON  dbamv.IT_AGENDA_CENTRAL.cd_agenda_central = AGENDA_CENTRAL.cd_agenda_central
   LEFT JOIN DBAMV.PRESTADOR ON PRESTADOR.cd_prestador = AGENDA_CENTRAL.cd_prestador
   LEFT JOIN DBAMV.ATENDIME ON ATENDIME.cd_prestador = PRESTADOR.cd_prestador
   LEFT JOIN DBAMV.CONVENIO ON CONVENIO.cd_convenio = ATENDIME.cd_convenio
   WHERE To_Char(it_agenda_central.hr_agenda,'DD/MM/YYYY') = '${availability.date}'
   AND To_Char(it_agenda_central.hr_agenda,'HH24:MI') = '${availability.start_time}'
   AND prestador.cd_prestador in (${availability.resource_lid})
   AND agenda_central.cd_unidade_atendimento in (${availability.location_lid})
   AND it_agenda_central.cd_paciente IS NULL
   AND it_agenda_central.nm_paciente IS NULL
   order by 1 DESC                    
    `);

    if (!verifica_horario || verifica_horario.length === 0) {
      return {
        result: 'OK',
        debug_msg: 'Horario não esta disponivel!',
      };
    }

    const verifica = await knex.raw(`
    SELECT *
     FROM tbl_dti_paciente
    WHERE cd_paciente_integra = ${user.user_lid}
    and cd_paciente is not null
    and tp_status = 'T'
    `);

    var seq_agenda;

    var user_lid_existe = null;

    if (!verifica || verifica.length !== 0) {
      user_lid_existe = 'USER_LID Já existe';

      const seq_paciente = verifica[0].CD_DTI_PACIENTE;

      console.log(verifica[0].CD_DTI_PACIENTE);

      seq_agenda = await knex.raw(
        `select seq_dti_agenda.nextval SEQ_DTI_AGENDA from dual`,
      );
      await knex.raw(`
      INSERT INTO tbl_dti_agenda (
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
        '${availability.availability_lid}',
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
        dbamv.pkg_mv2000.atribui_empresa(1);
        P_RESULT := fnc_dti_controla_agendamento;
        END;
        `,
      );

      const verifica_agenda = await knex.raw(`
      SELECT *
       FROM tbl_dti_agenda
      WHERE cd_dti_agenda = ${seq_agenda[0].SEQ_DTI_AGENDA}
      and tp_status = 'T'
      `);

      if (!verifica_agenda || verifica_agenda.length === 0) {
        return {
          result: 'ERRO',
          debug_msg: 'Não foi possivel Registrar o paciente!',
        };
      }
    } else {
      user_lid_existe = user.user_lid;
      const seq_paciente = await knex.raw(
        `select seq_dti_paciente.nextval seq_dti from dual`,
      );
      await knex.raw(`
      INSERT INTO tbl_dti_paciente(
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
        cd_paciente_integra 
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
        '${user.user_lid}'
      )
      `);

      await knex.raw(
        `
        DECLARE
          P_RESULT VARCHAR2(30);
        
        BEGIN 
        dbamv.pkg_mv2000.atribui_empresa(1);
        P_RESULT := fnc_dti_controla_cad_paciente;
        END;
        `,
      );

      const verifica_paci = await knex.raw(`
      SELECT *
       FROM tbl_dti_agenda
      WHERE cd_dti_agenda = ${seq_agenda[0].SEQ_DTI_AGENDA}
      and tp_status = 'T'
      `);

      if (!verifica_paci || verifica_paci.length === 0) {
        return {
          result: 'ERRO',
          debug_msg: 'Não foi possivel Registrar o paciente!',
        };
      }

      seq_agenda = await knex.raw(
        `select seq_dti_agenda.nextval SEQ_DTI_AGENDA from dual`,
      );

      await knex.raw(`
      INSERT INTO tbl_dti_agenda (
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
        '${availability.availability_lid}',
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
        dbamv.pkg_mv2000.atribui_empresa(1);
        P_RESULT := fnc_dti_controla_agendamento;
        END;
        `,
      );

      const verifica_agenda = await knex.raw(`
      SELECT *
       FROM tbl_dti_agenda
      WHERE cd_dti_agenda = ${seq_agenda[0].SEQ_DTI_AGENDA}
      and tp_status = 'T'
      `);

      if (!verifica_agenda || verifica_agenda.length === 0) {
        return {
          result: 'ERRO',
          debug_msg: 'Não foi possivel Registrar o paciente!',
        };
      }
    }

    const dados = {
      app_lid: seq_agenda[0].SEQ_DTI_AGENDA,
      availability: {
        availability_lid: availability.availability_lid,
        date: availability.date,
        start_time: availability.start_time,
        end_time: availability.end_time,
        location_lid: availability.location_lid,
        resource_lid: availability.resource_lid,
        activity_lid: availability.activity_lid,
        insurance_lid: availability.insurance_lid,
      },
      user: {
        user_lid: user_lid_existe,
        id_number: {
          number: user.id_number.number,
          type: user.id_number.type,
        },
        first_name: user.first_name,
        second_name: user.second_name,
        third_name: user.third_name,
        birthdate: user.birthdate,
        place_of_birth: user.place_of_birth,
        gender: user.gender,
        contact: {
          email: user.contact.email,
          landline: user.contact.landline,
          mobile: user.contact.mobile,
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
          street: user.address.street,
          street_number: user.address.street_number,
          zipcode: user.address.zipcode,
          city: user.address.city,
          province: user.address.province,
          region: user.address.region,
          country: user.address.country,
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
