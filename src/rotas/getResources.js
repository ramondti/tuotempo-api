import knex from '../database/db';

export async function get_resources() {
  try {
    const result = await knex.raw(`
    SELECT DISTINCT 
    AGENDA_CENTRAL.cd_prestador,
    PRESTADOR.nm_prestador,
    PRESTADOR.nr_cpf_cgc,
    (CASE WHEN PRESTADOR.cd_conselho = 8 THEN 'PR' END) regiao,
    PRESTADOR.nr_fone_contato,
    PRESTADOR.tp_documentacao,
    PRESTADOR.ds_email,
    PRESTADOR.nr_documento
    FROM DBAMV.AGENDA_CENTRAL
    LEFT JOIN DBAMV.PRESTADOR ON PRESTADOR.cd_prestador = DBAMV.AGENDA_CENTRAL.cd_prestador
    WHERE AGENDA_CENTRAL.cd_prestador IS NOT NULL
    `);

    if (!result || result.length === 0) {
      return `Não encontrou nenhum registro no banco`;
    }

    const dados = [];
    result.forEach(element => {
      dados.push({
        resource_lid: element.CD_PRESTADOR,
        first_name: element.NM_PRESTADOR,
        second_name: null,
        id_number: {
          number: element.NR_CPF_CGC,
          type: '1',
        },
        registration_code: {
          number: element.NR_DOCUMENTO,
          region: element.REGIAO,
        },
        contact: {
          mobile_phone: element.NR_FONE_CONTATO,
          email: element.DS_EMAIL,
        },
      });
    });

    return { result: 'OK', return: dados };
  } catch (error) {
    return {
      result: 'ERROR',
      debug_msg: 'Erro ao consultar o banco de dados!'
    };
  }
}

export { get_resources };
