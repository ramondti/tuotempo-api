import knex from '../database/db';

export async function get_resources() {
  try {
    const result = await knex.raw(`
   SELECT DISTINCT                                                                           
    (CASE WHEN AGENDA_CENTRAL.cd_prestador IS NULL THEN AGENDA_CENTRAL.cd_recurso_central ELSE AGENDA_CENTRAL.cd_prestador END) ID_LID,
    (CASE WHEN PRESTADOR.nm_prestador IS NULL THEN (SELECT ds_recurso_central 
                                                     FROM recurso_central 
                                                    WHERE cd_recurso_central = AGENDA_CENTRAL.cd_recurso_central )
                                              ELSE NVL(SUBSTR(nm_prestador,0, INSTR(nm_prestador, ' ')-1), nm_prestador) END) DS_LID,
    (CASE WHEN PRESTADOR.nm_prestador IS NOT NULL THEN NVL(SUBSTR(nm_prestador,INSTR(nm_prestador, ' ') + 1, INSTR(nm_prestador, ' ')+20000), nm_prestador) END) segundo_nm,
    PRESTADOR.nr_cpf_cgc,
    (CASE WHEN PRESTADOR.cd_conselho = 8 THEN 'PR' END) regiao,
    CONSELHO.cd_uf,
    PRESTADOR.ds_codigo_conselho,
    PRESTADOR.nr_fone_contato,
    PRESTADOR.tp_documentacao,
    PRESTADOR.ds_email,        
    PRESTADOR.nr_documento,
    agenda_central.cd_unidade_atendimento,
    (CASE WHEN PRESTADOR.nr_cpf_cgc IS NULL THEN NULL ELSE '1' END) TYPE
    FROM DBAMV.AGENDA_CENTRAL
    LEFT JOIN DBAMV.PRESTADOR ON PRESTADOR.cd_prestador = DBAMV.AGENDA_CENTRAL.cd_prestador
    LEFT JOIN DBAMV.CONSELHO ON CONSELHO.cd_conselho = PRESTADOR.cd_conselho
     `);

    if (!result || result.length === 0) {
      return {
        result: 'OK',
      };
    }

    const dados = [];


    for (const element of result) {

      dados.push({
        resource_lid: element.ID_LID,
        first_name: element.DS_LID,
        second_name: element.SEGUNDO_NM,
        id_number: {
          number: element.NR_CPF_CGC,
          type: element.TYPE,
        },
        registration_code: {
          number: element.DS_CODIGO_CONSELHO,
          region: element.CD_UF,
        },
        contact: {
          mobile_phone: element.NR_FONE_CONTATO,
          email: element.DS_EMAIL,
        },
        related: {
          location_lids:[...await findCdUnidadeAtendimentoByIdLid(element.ID_LID)]  ,
          insurance_lids: [...await findConvenioByIdLid(element.ID_LID)],
        },
        notice: null,
        operator_notice: null,
        languages: null,
        web_enabled: 'true',
        active: 'true',
      });

    }

   

    return { result: 'OK', return: dados };
  } catch (error) {
    console.log(error);
    return {
      result: 'ERROR',
      debug_msg: 'Erro ao consultar o banco de dados!',
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
    AGENDA_CENTRAL.cd_unidade_atendimento,
    AGENDA_CENTRAL.cd_recurso_central,
    (CASE WHEN PRESTADOR.nr_cpf_cgc IS NULL THEN NULL ELSE PRESTADOR.nr_cpf_cgc END) TYPE
    FROM DBAMV.AGENDA_CENTRAL
    LEFT JOIN DBAMV.PRESTADOR ON PRESTADOR.cd_prestador = DBAMV.AGENDA_CENTRAL.cd_prestador
    WHERE AGENDA_CENTRAL.cd_unidade_atendimento = ${location_lid}

  `);

    if (!result || result.length === 0) {
      return {
        result: 'OK',
      };
    }

    const dados = [];

    
    for (const element of result) {

      dados.push({
        resource_lid: element.ID_LID,
        first_name: element.DS_LID,
        second_name: element.SEGUNDO_NM,
        id_number: {
          number: element.NR_CPF_CGC,
          type: element.TYPE,
        },
        registration_code: {
          number: element.DS_CODIGO_CONSELHO,
          region: element.CD_UF,
        },
        contact: {
          mobile_phone: element.NR_FONE_CONTATO,
          email: element.DS_EMAIL,
        },
        related: {
          location_lids: [element.CD_UNIDADE_ATENDIMENTO],
          insurance_lids: [...await findConvenioByIdLid(element.ID_LID)],
        },
        notice: null,
        operator_notice: null,
        languages: null,
        web_enabled: 'true',
        active: 'true',
      });

    }

    return { result: 'OK', return: dados };
  } catch (error) {
    console.log(error);
    return {
      result: 'ERROR',
      debug_msg: 'Erro ao consultar o banco de dados!',
    };
  }
}

export async function get_resources_insurance_lid(insurance_lid) {
  try {
    const result = await knex.raw(`
    SELECT DISTINCT 
    (CASE WHEN AGENDA_CENTRAL.cd_prestador IS NULL THEN AGENDA_CENTRAL.cd_recurso_central ELSE AGENDA_CENTRAL.cd_prestador END) ID_LID
    FROM DBAMV.AGENDA_CENTRAL
      LEFT JOIN DBAMV.agenda_central_convenio ON agenda_central_convenio.cd_agenda_central = agenda_central.cd_agenda_central
    WHERE agenda_central_convenio.cd_convenio = ${insurance_lid}
  `);

    if (!result || result.length === 0) {
      return {
        result: 'OK',
      };
    }

    const dados = [];

    result.forEach(element => {
      dados.push(element.ID_LID);
    });

    const id = { resource_lids: dados };

    return { result: 'OK', return: id };
  } catch (error) {
    console.log(error);
    return {
      result: 'ERROR',
      debug_msg: 'Erro ao consultar o banco de dados!',
    };
  }
}

async function findCdUnidadeAtendimentoByIdLid(idLid) {
  try {
    const result = await knex.raw(`SELECT DISTINCT agenda_central.cd_unidade_atendimento FROM AGENDA_CENTRAL WHERE cd_prestador = ${idLid}`);

  //console.log(result.map(value => value.CD_UNIDADE_ATENDIMENTO));
    return result.map(value => value.CD_UNIDADE_ATENDIMENTO);

  } catch (err) {
    console.log(err)
  }
}

async function findConvenioByIdLid(idLid) {
  try {
    const result = await knex.raw(`
    SELECT DISTINCT cd_convenio
      FROM agenda_central 
    LEFT JOIN DBAMV.agenda_central_convenio ON agenda_central_convenio.cd_agenda_central = agenda_central.cd_agenda_central
    WHERE cd_prestador = ${idLid}
    AND cd_convenio IS NOT NULL`
    );

  //console.log(result.map(value => value.CD_CONVENIO));
    return result.map(value => value.CD_CONVENIO);

  } catch (err) {
    console.log(err)
  }
}

export { get_resources };
