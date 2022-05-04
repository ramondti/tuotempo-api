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
        user_lid: paciente_del[0].CD_PACIENTE,
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
