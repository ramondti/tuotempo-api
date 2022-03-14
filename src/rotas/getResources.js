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
    console.log(error)
    return {
      result: 'ERROR',
      debug_msg: 'Erro ao consultar o banco de dados!'
    };
  }
}


export async function get_resources_location_lid(location_lid) {
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
    WHERE AGENDA_CENTRAL.cd_unidade_atendimento = ${location_lid}
    AND AGENDA_CENTRAL.cd_prestador IS NOT NULL
  `);

    if (!result || result.length === 0) {
      return {
        result: 'ERROR',
        debug_msg: 'Não encontrado registro no banco de dados',
      };
    }

    const dados = [];
    result.forEach(element => {
      dados.push({
        resource_lid: element.CD_PRESTADOR,
        id_number: {
          number: element.NR_CPF_CGC,
          type: '1',
        },
        registration_code:{
          number: element.NR_DOCUMENTO,
          region: element.regiao,
        },
        first_name: element.NM_PRESTADOR,
        second_name: null,
        contact: {
          mobile_phone: element.NR_FONE_CONTATO,
          email: element.DS_EMAIL
        },
        notice: null,
        operator_notice:null,
        web_enabled:'true',
        active: 'true'
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

export async function get_resources_insurance_lid(insurance_lid) {
  try {
    const result = await knex.raw(`
    SELECT DISTINCT 
     AGENDA_CENTRAL.cd_prestador
    FROM DBAMV.AGENDA_CENTRAL
    LEFT JOIN DBAMV.PRESTADOR ON PRESTADOR.cd_prestador = DBAMV.AGENDA_CENTRAL.cd_prestador
    LEFT JOIN DBAMV.ATENDIME ON ATENDIME.cd_prestador = DBAMV.PRESTADOR.cd_prestador
    LEFT JOIN DBAMV.CONVENIO ON CONVENIO.cd_convenio = DBAMV.ATENDIME.cd_convenio
    WHERE CONVENIO.cd_convenio = ${insurance_lid}
    AND AGENDA_CENTRAL.cd_prestador IS NOT NULL
  

  `);

    if (!result || result.length === 0) {
      return {
        result: 'ERROR',
        debug_msg: 'Não encontrado registro no banco de dados',
      };
    }

    const dados = [];

    result.forEach(element => {
     dados.push(element.CD_PRESTADOR);
    });

    const id = {resource_lids : dados};
    

    return { result: 'OK', return: id };
  } catch (error) {
    console.log(error)
    return {
      result: 'ERROR',
      debug_msg: 'Erro ao consultar o banco de dados!'
    };
  }
}



export { get_resources };
