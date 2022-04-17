import knex from '../../database/db';

export async function del_appointments(app_lid) {
  try {
    const verifica = await knex.raw(`
    SELECT * 
      FROM tuotempo.tbl_dti_agenda
    WHERE cd_dti_agenda = ${app_lid} 
    `);

    if (!verifica || verifica.length === 0) {
      return {
        result: 'OK',
        debug_msg: 'USER_LID JA FOI CANCELADO OU NÃO EXISTE!',
      };
    }

    const result = await knex.raw(`
    SELECT *
      FROM tuotempo.tbl_dti_agenda
    WHERE cd_dti_agenda = ${app_lid}
    `);

    const paciente_del = await knex.raw(`
    SELECT *
      FROM tuotempo.tbl_dti_paciente
    WHERE cd_registro_pai = ${result[0].CD_REGISTRO_FILHO}
    `);

    await knex.raw(` 
    UPDATE tuotempo.tbl_dti_agenda SET tp_status= 'A', tp_movimento = 'E' 
    WHERE cd_dti_agenda = ${app_lid} 
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
      WHERE cd_dti_agenda = ${result[0].SEQ_DTI_AGENDA}
      and tp_status = 'T'
      and tp_movimento = 'E'
      `);


    if (!verifica_agenda || verifica_agenda.length === 0) {
      return {
        result: 'ERRO',
        debug_msg: 'Não foi possivel cancelar o horario!',
      };
    }

    const dados = {
      app_lid: app_lid,
      created: result[0].DT_GERADO,
      cancelled: '01/05/2021 22:00:00',
      modified: null,
      status: 'Cancelled',
      checkedin: null,
      start_visit: null,
      end_visit: null,
      notes: null,
      tags: null,
      availability: {
        availability_lid: result[0].CD_SEQ_INTEGRA,
        date: result[0].DT_AGENDA,
        start_time: result[0].HR_INICIO,
        end_time: result[0].HR_FIM,
        location_lid: result[0].CD_UNIDADE_ATENDIMENTO,
        resource_lid: result[0].CD_PRESTADOR,
        activity_lid: result[0].CD_ITEM_AGENDAMENTO,
        insurance_lid: result[0].CD_CONVENIO,
      },
      user: {
        user_lid: paciente_del[0].CD_PACIENTE_INTEGRA,
        id_number: {
          number: null,
          type: null,
        },
        first_name: paciente_del[0].NM_PESSOA,
        second_name: paciente_del[0].NM_SOBRENOME,
        third_name: null,
        birthdate: paciente_del[0].DT_NASCIMENTO,
        place_of_birth: null,
        gender: paciente_del[0].TP_SEXO,
        contact: {
          email: paciente_del[0].DS_EMAIL,
          landline: paciente_del[0].NR_CELULAR,
          mobile: paciente_del[0].NR_CELULAR,
          work: null,
        },
        address: {
          street: paciente_del[0].DS_ENDERECO,
          street_number: paciente_del[0].NR_ENDERECO,
          zipcode: paciente_del[0].NR_CEP,
          city: paciente_del[0].NM_CIDADE,
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
