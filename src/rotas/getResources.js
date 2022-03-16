import knex from '../database/db';

export async function get_resources() {
  try {
    const result = await knex.raw(`
    SELECT DISTINCT                                                                           
    (CASE WHEN AGENDA_CENTRAL.cd_prestador IS NULL THEN AGENDA_CENTRAL.cd_recurso_central ELSE AGENDA_CENTRAL.cd_prestador END) ID_LID,
    (CASE WHEN PRESTADOR.nm_prestador IS NULL THEN (SELECT ds_recurso_central 
                                                     FROM recurso_central 
                                                    WHERE cd_recurso_central = AGENDA_CENTRAL.cd_recurso_central )
                                              ELSE PRESTADOR.nm_prestador END) DS_LID,
    PRESTADOR.nr_cpf_cgc,
    (CASE WHEN PRESTADOR.cd_conselho = 8 THEN 'PR' END) regiao,
    PRESTADOR.nr_fone_contato,
    PRESTADOR.tp_documentacao,
    PRESTADOR.ds_email,
    PRESTADOR.nr_documento,
    AGENDA_CENTRAL.cd_recurso_central,
    (CASE WHEN PRESTADOR.nr_cpf_cgc IS NULL THEN NULL ELSE PRESTADOR.nr_cpf_cgc END) TYPE
    FROM DBAMV.AGENDA_CENTRAL
    LEFT JOIN DBAMV.PRESTADOR ON PRESTADOR.cd_prestador = DBAMV.AGENDA_CENTRAL.cd_prestador
    `);

    if (!result || result.length === 0) {
      return `Não encontrou nenhum registro no banco`;
    }

    const dados = [];
    result.forEach(element => {
      dados.push({
        resource_lid: element.ID_LID,
        first_name: element.DS_LID,
        second_name: null,
        id_number: {
          number: element.NR_CPF_CGC,
          type: element.TYPE,
        },
        registration_code: {
          number: element.NR_DOCUMENTO,
          region: element.REGIAO,
        },
        contact: {
          mobile_phone: element.NR_FONE_CONTATO,
          email: element.DS_EMAIL,
        },
        related: {
          location_lids:[null],
          insurance_lids: [null]
        },
        notice: null,
        operator_notice: null,
        languages : null,
        web_enabled: 'true',
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


export async function get_resources_location_lid(location_lid) {
  try {
    const result = await knex.raw(`
    SELECT DISTINCT                                                                           
    (CASE WHEN AGENDA_CENTRAL.cd_prestador IS NULL THEN AGENDA_CENTRAL.cd_recurso_central ELSE AGENDA_CENTRAL.cd_prestador END) ID_LID,
    (CASE WHEN PRESTADOR.nm_prestador IS NULL THEN (SELECT ds_recurso_central 
                                                     FROM recurso_central 
                                                    WHERE cd_recurso_central = AGENDA_CENTRAL.cd_recurso_central )
                                              ELSE PRESTADOR.nm_prestador END) ds_lid,
    PRESTADOR.nr_cpf_cgc,
    (CASE WHEN PRESTADOR.cd_conselho = 8 THEN 'PR' END) regiao,
    PRESTADOR.nr_fone_contato,
    PRESTADOR.tp_documentacao,
    PRESTADOR.ds_email,
    PRESTADOR.nr_documento,
    AGENDA_CENTRAL.cd_recurso_central,
    (CASE WHEN PRESTADOR.nr_cpf_cgc IS NULL THEN NULL ELSE PRESTADOR.nr_cpf_cgc END) TYPE
    FROM DBAMV.AGENDA_CENTRAL
    LEFT JOIN DBAMV.PRESTADOR ON PRESTADOR.cd_prestador = DBAMV.AGENDA_CENTRAL.cd_prestador
    WHERE AGENDA_CENTRAL.cd_unidade_atendimento = ${location_lid}

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
        resource_lid: element.ID_LID,
        id_number: {
          number: element.NR_CPF_CGC,
          type: element.TYPE,
        },
        registration_code: {
          number: element.NR_DOCUMENTO,
          region: element.REGIAO,
        },
        contact: {
          mobile_phone: element.NR_FONE_CONTATO,
          email: element.DS_EMAIL,
        },
        related: {
          location_lids:[null],
          insurance_lids: [null]
        },
        notice: null,
        operator_notice: null,
        languages : null,
        web_enabled: 'true',
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
    (CASE WHEN AGENDA_CENTRAL.cd_prestador IS NULL THEN AGENDA_CENTRAL.cd_recurso_central ELSE AGENDA_CENTRAL.cd_prestador END) ID_LID
    FROM DBAMV.AGENDA_CENTRAL
    LEFT JOIN DBAMV.PRESTADOR ON PRESTADOR.cd_prestador = DBAMV.AGENDA_CENTRAL.cd_prestador
    LEFT JOIN DBAMV.ATENDIME ON ATENDIME.cd_prestador = DBAMV.PRESTADOR.cd_prestador
    LEFT JOIN DBAMV.CONVENIO ON CONVENIO.cd_convenio = DBAMV.ATENDIME.cd_convenio
    WHERE CONVENIO.cd_convenio = ${insurance_lid}

  `);

    if (!result || result.length === 0) {
      return {
        result: 'ERROR',
        debug_msg: 'Não encontrado registro no banco de dados',
      };
    }

    const dados = [];

    result.forEach(element => {
     dados.push(element.ID_LID);
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
